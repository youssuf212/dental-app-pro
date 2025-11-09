

import React, { createContext, useState, ReactNode, useEffect } from 'react';
// Fix: Added ServicePrice to import
// Fix: Import UserRole to fix type error.
// Fix: Added AuditLog to import
import { Case, Technician, Payment, Notification, CaseNote, CaseStatus, AuditLogType, CaseFile, Order, User, ServicePrice, UserRole, AuditLog, MillingCenter } from '../types';
import { useAuth } from '../hooks/useAuth';
import { base, TABLE_NAMES } from '../airtable-config';
import { deriveOrdersFromCaseName, SERVICE_PRICES } from '../services';
import { format } from 'date-fns';
import { FIXED_SERVICES } from '../constants';

interface DataContextType {
  cases: Case[];
  technicians: Technician[];
  payments: Payment[];
  notifications: Notification[];
  millingCenters: MillingCenter[];
  addCase: (newCase: Omit<Case, 'id' | 'createdAt' | 'activityLog'>) => void;
  updateCase: (updatedCase: Case, activityAuthor?: string) => void;
  addTechnician: (newTechnician: Omit<Technician, 'id'>, password: string) => void;
  updateTechnician: (updatedTechnician: Technician) => void;
  addPayment: (newPayment: Payment) => void;
  getTechnicianById: (id: string) => Technician | undefined;
  getCaseById: (id: string) => Case | undefined;
  addNoteToCase: (caseId: string, note: Omit<CaseNote, 'id' | 'timestamp'>) => void;
  markNotificationAsRead: (notificationId: string) => void;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => void;
  generatePaymentNotifications: () => void;
  addMillingCenter: (newCenter: Omit<MillingCenter, 'id'>) => Promise<void>;
}

export const DataContext = createContext<DataContextType | undefined>(undefined);

const getDefaultPricing = (): ServicePrice[] => {
    return FIXED_SERVICES.map(serviceName => ({
        serviceName,
        price: SERVICE_PRICES[serviceName] || 0
    }));
};

// --- MAPPING FUNCTIONS ---
const parseAirtableDate = (dateString?: string): string | undefined => {
    if (!dateString) return undefined;
    const date = new Date(`${dateString}T00:00:00Z`);
    if (!isNaN(date.getTime())) {
        return date.toISOString();
    }
    return undefined;
};


const mapAirtableRecordToTechnician = (record: any, users: User[]): Technician => {
    const email = record.fields.Email as string;
    const appUser = users.find(u => u.username === email);
    
    let pricing: ServicePrice[] = getDefaultPricing(); // Start with default
    const pricingJSON = record.fields.Pricing as string;
    if (pricingJSON) {
        try {
            const parsedPricing = JSON.parse(pricingJSON);
            if (Array.isArray(parsedPricing) && parsedPricing.length > 0) {
                 if (parsedPricing.every(p => typeof p === 'object' && 'serviceName' in p && 'price' in p)) {
                    pricing = parsedPricing;
                }
            }
        } catch (e) {
            console.warn(`Failed to parse pricing for technician ${record.id}. Using default.`, e);
        }
    }

    return {
        id: record.id,
        name: record.fields['Technician Name'] as string,
        email: email,
        phone: record.fields['Phone Number'] as string,
        skills: (record.fields.Skills as string[]) || [],
        username: appUser?.username || '',
        userId: appUser?.id || '',
        pricing: pricing,
    };
};

const mapAirtableRecordToMillingCenter = (record: any): MillingCenter => {
    return {
        id: record.id,
        name: record.fields.Name as string,
        phoneNumber: record.fields.PhoneNumber as string,
    };
};

const mapAirtableRecordToCase = (record: any, technicians: Technician[]): Case => {
    let notes: CaseNote[] = [];
    let orders: Order[] = [];
    let activityLog: AuditLog[] = [];

    const ordersJSON = record.fields.Orders as string;
    if (ordersJSON) {
        try {
            orders = JSON.parse(ordersJSON);
        } catch (e) {
            console.error(`Failed to parse Orders JSON for case ${record.id}:`, e);
        }
    }

    const notesJSON = record.fields.Notes as string;
    if (notesJSON) {
        try {
            const parsedData = JSON.parse(notesJSON);
            if (Array.isArray(parsedData)) {
                notes = parsedData;
            } else if (parsedData && typeof parsedData === 'object' && !Array.isArray(parsedData) && 'notes' in parsedData) {
                notes = parsedData.notes || [];
                if (orders.length === 0) {
                    orders = parsedData.orders || [];
                }
            }
        } catch (e) {
            console.error(`Failed to parse Notes for case ${record.id}:`, e);
        }
    }
    
    const activityLogJSON = record.fields.ActivityLog as string;
    if (activityLogJSON) {
        try {
            const parsedLogs = JSON.parse(activityLogJSON);
            if (Array.isArray(parsedLogs)) {
                activityLog = parsedLogs;
            }
        } catch (e) {
            console.error(`Failed to parse ActivityLog for case ${record.id}:`, e);
        }
    }
    
    if (orders.length === 0) {
        orders = deriveOrdersFromCaseName(record.fields.caseName);
    }
    
    if (!activityLog.some(log => log.type === 'creation')) {
        const techId = (record.fields.Technicians as string[])?.[0] || '';
        const techName = technicians.find(t => t.id === techId)?.name || 'Unassigned';
        activityLog.unshift({
            id: `log-creation-${record.id}`,
            timestamp: record.createdTime,
            activity: `Case was created and assigned to ${techName}.`,
            authorName: 'System',
            type: 'creation',
        });
    }

    const attachments = (record.fields.Attachments || []).map((att: any) => ({
        id: att.id,
        name: att.filename,
        url: att.url,
        previewUrl: att.thumbnails?.large?.url,
        uploadedById: 'user-1',
        uploadedByName: 'Admin',
    }));
    
    const rawDueDate = record.fields.dueDate as string | undefined;
    const rawCompletedAt = record.fields.completedAt as string | undefined;

    return {
        id: record.id,
        caseName: record.fields.caseName,
        dueDate: parseAirtableDate(rawDueDate) || new Date().toISOString(),
        technicianId: (record.fields.Technicians as string[])?.[0] || '',
        status: record.fields.Status as CaseStatus || CaseStatus.NEW,
        priority: 'Normal',
        files: attachments,
        notes: notes,
        createdAt: record.createdTime,
        orders: orders,
        activityLog: activityLog,
        completedAt: parseAirtableDate(rawCompletedAt),
        doctor: record.fields.Doctor as string || 'Dr Moustafa',
        branch: record.fields.Branch as string,
        color: record.fields.Color as string,
    };
};

const mapAirtableRecordToPayment = (record: any): Payment => {
    const rawPaymentDate = record.fields['Payment Date'] as string;
    return {
        id: record.id,
        technicianId: (record.fields['Linked Technician (if applicable)'] as string[])?.[0] || '',
        amount: record.fields.Amount as number,
        date: parseAirtableDate(rawPaymentDate) || new Date().toISOString(),
        caseIds: (record.fields['Linked Case'] as string[]) || [],
    };
};

const mapAirtableRecordToNotification = (record: any): Notification => {
    const rawTimestamp = record.fields['Date Sent'] as string;
    return {
        id: record.id,
        message: record.fields['Notification Message'] as string,
        timestamp: parseAirtableDate(rawTimestamp) || new Date().toISOString(),
        isRead: record.fields.Status === 'Read',
        link: '#',
        recipientId: (record.fields.Users as string[])?.[0] || '',
    };
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [cases, setCases] = useState<Case[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [millingCenters, setMillingCenters] = useState<MillingCenter[]>([]);

  useEffect(() => {
    const fetchData = async () => {
        setIsLoading(true);
        try {
            const fetchTable = async (tableName: string) => {
                try {
                    return await base(tableName).select().all();
                } catch (err) {
                    console.warn(`Could not fetch data for table "${tableName}". It might be missing or misconfigured in Airtable.`, err);
                    return []; // Return empty array on error to prevent crashing the app
                }
            };

            const [userRecords, techRecords, caseRecords, paymentRecords, notificationRecords, millingCenterRecords] = await Promise.all([
                fetchTable(TABLE_NAMES.USERS),
                fetchTable(TABLE_NAMES.TECHNICIANS),
                fetchTable(TABLE_NAMES.CASES),
                fetchTable(TABLE_NAMES.PAYMENTS),
                fetchTable(TABLE_NAMES.NOTIFICATIONS),
                fetchTable(TABLE_NAMES.MILLING_CENTERS),
            ]);

            const users: User[] = userRecords.map(r => ({ id: r.id, name: r.fields['User Name'] as string, username: r.fields.Email as string, role: (r.fields.Role as string)?.toLowerCase() === 'manager' ? UserRole.ADMIN : UserRole.TECHNICIAN }));
            
            const fetchedTechnicians = techRecords.map(r => mapAirtableRecordToTechnician(r, users));
            setTechnicians(fetchedTechnicians);
            setCases(caseRecords.map(r => mapAirtableRecordToCase(r, fetchedTechnicians)));
            setPayments(paymentRecords.map(mapAirtableRecordToPayment));
            setNotifications(notificationRecords.map(mapAirtableRecordToNotification));
            setMillingCenters(millingCenterRecords.map(mapAirtableRecordToMillingCenter));

        } catch (error) {
            console.error("A critical error occurred during data processing:", error);
        } finally {
            setIsLoading(false);
        }
    };
    
    if (user) {
        fetchData();
    } else {
        // Clear data on logout to prevent flashing old data
        setCases([]);
        setTechnicians([]);
        setPayments([]);
        setNotifications([]);
        setMillingCenters([]);
        setIsLoading(false);
    }
  }, [user]);

  const addNotification = async (notificationData: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notificationData,
      id: `notif-${Date.now()}`,
      timestamp: new Date().toISOString(),
      isRead: false,
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const addCase = async (newCaseData: Omit<Case, 'id' | 'createdAt' | 'activityLog'>) => {
    const assignedTechnician = getTechnicianById(newCaseData.technicianId);
    const ordersPayload = JSON.stringify(newCaseData.orders || []);
    
    const initialLog: AuditLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        activity: `created the case and assigned it to ${assignedTechnician?.name || 'Unassigned'}.`,
        authorName: user?.name || 'System',
        type: 'creation',
    };
    const activityLogPayload = JSON.stringify([initialLog]);

    const airtableData = {
        'caseName': newCaseData.caseName,
        'dueDate': newCaseData.dueDate ? format(new Date(newCaseData.dueDate), 'yyyy-MM-dd') : null,
        'Technicians': [newCaseData.technicianId],
        'Status': newCaseData.status,
        'Notes': JSON.stringify(newCaseData.notes || []),
        'Orders': ordersPayload,
        'ActivityLog': activityLogPayload,
        'Doctor': newCaseData.doctor,
        'Branch': newCaseData.branch,
        'Color': newCaseData.color,
    };

    try {
        const createdRecords = await base(TABLE_NAMES.CASES).create([{ fields: airtableData }]);
        const newCase = mapAirtableRecordToCase(createdRecords[0], technicians);
        setCases(prev => [...prev, newCase]);

        if (assignedTechnician) {
            addNotification({
                message: `New case "${newCase.caseName}" has been assigned to you.`,
                link: `/technician/cases/${newCase.id}`,
                recipientId: assignedTechnician.userId,
            });
        }
    } catch (error) {
        console.error("Failed to add case:", error);
    }
  };

  const updateCase = async (updatedCase: Case, activityAuthor: string = 'System') => {
    const originalCase = getCaseById(updatedCase.id);
    if (!originalCase) return;
    
    const newLogs: AuditLog[] = [];
    
    if (originalCase.status !== updatedCase.status) {
        newLogs.push({
            id: `log-${Date.now()}-status`,
            timestamp: new Date().toISOString(),
            activity: `changed status from "${originalCase.status}" to "${updatedCase.status}"`,
            authorName: activityAuthor,
            type: 'status_change',
        });
    }
    
    if (originalCase.technicianId !== updatedCase.technicianId) {
        const oldTech = getTechnicianById(originalCase.technicianId)?.name || 'Unassigned';
        const newTech = getTechnicianById(updatedCase.technicianId)?.name || 'Unassigned';
        newLogs.push({
            id: `log-${Date.now()}-tech`,
            timestamp: new Date().toISOString(),
            activity: `reassigned case from ${oldTech} to ${newTech}`,
            authorName: activityAuthor,
            type: 'general',
        });
    }
    
    if ((originalCase.notes || []).length < (updatedCase.notes || []).length) {
        const newNote = updatedCase.notes[updatedCase.notes.length - 1];
        newLogs.push({
            id: `log-${Date.now()}-note`,
            timestamp: new Date().toISOString(),
            activity: `added a note: "${newNote.content.substring(0, 40)}${newNote.content.length > 40 ? '...' : ''}"`,
            authorName: newNote.authorName,
            type: 'note',
        });
    }

    if ((originalCase.files || []).length !== (updatedCase.files || []).length) {
        if (originalCase.files.length < updatedCase.files.length) {
            const newFile = updatedCase.files.find(f => !originalCase.files.some(of => of.id === f.id));
            newLogs.push({
                id: `log-${Date.now()}-file-add`,
                timestamp: new Date().toISOString(),
                activity: `added a file: ${newFile?.name || 'new file'}`,
                authorName: activityAuthor,
                type: 'file_change',
            });
        } else {
             const removedFile = originalCase.files.find(f => !updatedCase.files.some(uf => uf.id === f.id));
             newLogs.push({
                id: `log-${Date.now()}-file-remove`,
                timestamp: new Date().toISOString(),
                activity: `removed a file: ${removedFile?.name || 'a file'}`,
                authorName: activityAuthor,
                type: 'file_change',
            });
        }
    }

    const updatedActivityLog = [...(originalCase.activityLog || []), ...newLogs];
    const finalUpdatedCase = { ...updatedCase, activityLog: updatedActivityLog };

    const ordersPayload = JSON.stringify(finalUpdatedCase.orders || []);
    const activityLogPayload = JSON.stringify(finalUpdatedCase.activityLog || []);
    
     const airtableData = {
        'caseName': finalUpdatedCase.caseName,
        'dueDate': finalUpdatedCase.dueDate ? format(new Date(finalUpdatedCase.dueDate), 'yyyy-MM-dd') : null,
        'Technicians': [finalUpdatedCase.technicianId],
        'Status': finalUpdatedCase.status,
        'Notes': JSON.stringify(finalUpdatedCase.notes || []),
        'Orders': ordersPayload,
        'ActivityLog': activityLogPayload,
        'completedAt': finalUpdatedCase.completedAt ? format(new Date(finalUpdatedCase.completedAt), 'yyyy-MM-dd') : null,
        'Doctor': finalUpdatedCase.doctor,
        'Branch': finalUpdatedCase.branch,
        'Color': finalUpdatedCase.color,
    };

    try {
        await base(TABLE_NAMES.CASES).update([{ id: finalUpdatedCase.id, fields: airtableData }]);
        setCases(prev => prev.map(c => c.id === finalUpdatedCase.id ? finalUpdatedCase : c));
    } catch (h) {
        console.error("Failed to update case:", h);
    }
  };

  const addTechnician = async (newTechData: Omit<Technician, 'id'>, password: string) => {
    try {
        const userRecords = await base(TABLE_NAMES.USERS).create([{
            fields: {
                'User Name': newTechData.name,
                'Email': newTechData.email,
                'Password': password,
                'Role': 'Technician',
                'Active Status': 'Active'
            }
        }]);
        const createdUser = userRecords[0];

        const techAirtableData = {
            'Technician Name': newTechData.name,
            'Email': newTechData.email,
            'Phone Number': newTechData.phone,
            'Skills': newTechData.skills,
            'Pricing': JSON.stringify(newTechData.pricing || []),
        };
        const techRecords = await base(TABLE_NAMES.TECHNICIANS).create([{ fields: techAirtableData }]);
        const createdTechRecord = techRecords[0];

        const newTech: Technician = {
            ...newTechData,
            id: createdTechRecord.id,
            userId: createdUser.id,
            username: createdUser.fields.Email as string,
        };
        setTechnicians(prev => [...prev, newTech]);

    } catch (h) {
        console.error("Failed to add technician and user:", h);
        alert("Failed to create technician. Check console for details.");
    }
  };


  const updateTechnician = async (updatedTechnician: Technician) => {
      const airtableData = {
        'Technician Name': updatedTechnician.name,
        'Email': updatedTechnician.email,
        'Phone Number': updatedTechnician.phone,
        'Skills': updatedTechnician.skills,
        'Pricing': JSON.stringify(updatedTechnician.pricing || []),
    };
    try {
        await base(TABLE_NAMES.TECHNICIANS).update([{ id: updatedTechnician.id, fields: airtableData }]);
        setTechnicians(prev => prev.map(t => t.id === updatedTechnician.id ? updatedTechnician : t));
    } catch (error) {
        console.error("Failed to update technician:", error);
    }
  };
  
  const addPayment = async (newPayment: Omit<Payment, 'id'>) => {
     const airtableData = {
        'Amount': newPayment.amount,
        'Payment Date': format(new Date(newPayment.date), 'yyyy-MM-dd'),
        'Linked Case': newPayment.caseIds,
        'Linked Technician (if applicable)': [newPayment.technicianId],
    };
    try {
        const createdRecords = await base(TABLE_NAMES.PAYMENTS).create([{ fields: airtableData }]);
        const payment = mapAirtableRecordToPayment(createdRecords[0]);
        setPayments(prev => [...prev, payment]);
    } catch (error) {
        console.error("Failed to add payment:", error);
    }
  };

  const addMillingCenter = async (newCenter: Omit<MillingCenter, 'id'>) => {
    try {
      const createdRecords = await base(TABLE_NAMES.MILLING_CENTERS).create([
        { fields: { Name: newCenter.name, PhoneNumber: newCenter.phoneNumber } }
      ]);
      const center = mapAirtableRecordToMillingCenter(createdRecords[0]);
      setMillingCenters(prev => [...prev, center]);
    } catch (error) {
      console.error("Failed to add milling center:", error);
    }
  };

  const getTechnicianById = (id: string) => technicians.find(t => t.id === id);
  const getCaseById = (id: string) => cases.find(c => c.id === id);

  const addNoteToCase = (caseId: string, noteData: Omit<CaseNote, 'id' | 'timestamp'>) => {
    const targetCase = getCaseById(caseId);
    if (targetCase) {
        const newNote: CaseNote = {
          ...noteData,
          id: `note-${Date.now()}`,
          timestamp: new Date().toISOString(),
        };
        const updatedNotes = [...(targetCase.notes || []), newNote];
        const updatedCase = { ...targetCase, notes: updatedNotes };
        updateCase(updatedCase, noteData.authorName);
    }
  };

  const markNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    base(TABLE_NAMES.NOTIFICATIONS).update([{ id: notificationId, fields: { 'Status': 'Read' } }])
        .catch(err => console.error("Failed to mark notification as read:", err));
  };

  const generatePaymentNotifications = () => {
  };

  if (isLoading) {
    return (
        <div className="flex items-center justify-center h-screen bg-background dark:bg-dark-background">
            <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
  }

  return (
    <DataContext.Provider value={{ 
        cases, 
        technicians, 
        payments, 
        notifications,
        millingCenters,
        addCase, 
        updateCase, 
        addTechnician, 
        updateTechnician, 
        addPayment, 
        getTechnicianById,
        getCaseById,
        addNoteToCase,
        markNotificationAsRead,
        addNotification,
        generatePaymentNotifications,
        addMillingCenter,
    }}>
      {children}
    </DataContext.Provider>
  );
};