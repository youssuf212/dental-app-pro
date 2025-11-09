import React, { useMemo, useState } from 'react';
import { useData } from '../../hooks/useData';
import { CaseStatus, Payment, Technician, Case } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
// Fix: Removed non-existent import 'parseISO' and replaced with native Date constructor.
import { format } from 'date-fns';

const AdminPayments: React.FC = () => {
  const { cases, technicians, payments, addPayment } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<any | null>(null);
  const [dateRange, setDateRange] = useState({ start: '', end: '' });

  const getCaseCost = (c: Case) => (c.orders || []).reduce((sum, order) => sum + order.price * order.quantity, 0);

  const technicianFinancials = useMemo(() => {
    return technicians.map(tech => {
      const allPaidCaseIds = payments.filter(p => p.technicianId === tech.id).flatMap(p => p.caseIds);
      
      const unpaidCases = cases.filter(c => 
        c.technicianId === tech.id &&
        c.status === CaseStatus.FINISHED && // Only count cases explicitly approved by the owner
        !allPaidCaseIds.includes(c.id)
      );
      
      const amountOwed = unpaidCases.reduce((sum, c) => sum + getCaseCost(c), 0);

      const filteredPayments = payments.filter(p => {
        if (p.technicianId !== tech.id) return false;
        if (dateRange.start && new Date(p.date) < new Date(dateRange.start)) return false;
        if (dateRange.end && new Date(p.date) > new Date(dateRange.end)) return false;
        return true;
      });

      const totalPaidInPeriod = filteredPayments.reduce((sum, p) => sum + p.amount, 0);

      return {
        ...tech,
        unpaidCases,
        amountOwed,
        totalPaidInPeriod,
      };
    });
  }, [cases, technicians, payments, dateRange]);

  const setDateFilter = (period: 'today' | 'week' | 'month' | '') => {
      const today = new Date();
      if (period === 'today') {
        const todayStr = format(today, 'yyyy-MM-dd');
        setDateRange({ start: todayStr, end: todayStr });
      } else if (period === 'week') {
        const dayOfWeek = today.getDay(); // 0=Sun, 1=Mon, ...
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - dayOfWeek);
        
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        
        setDateRange({ start: format(startOfWeek, 'yyyy-MM-dd'), end: format(endOfWeek, 'yyyy-MM-dd')});
      } else if (period === 'month') {
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
        const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        setDateRange({ start: format(startOfMonth, 'yyyy-MM-dd'), end: format(endOfMonth, 'yyyy-MM-dd')});
      } else {
        setDateRange({ start: '', end: '' });
      }
  };


  const handleOpenPaymentModal = (tech: any) => {
    if(tech && tech.amountOwed > 0){
        setSelectedTech(tech);
        setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setSelectedTech(null);
    setIsModalOpen(false);
  };

  const handleConfirmPayment = () => {
    if(!selectedTech) return;

    const newPayment: Payment = {
        id: `payment-${Date.now()}`,
        technicianId: selectedTech.id,
        amount: selectedTech.amountOwed,
        date: new Date().toISOString(),
        caseIds: selectedTech.unpaidCases.map((c: any) => c.id),
    };

    addPayment(newPayment);
    handleCloseModal();
  };
  
  const handleDownloadCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Technician Name,Amount Owed,Total Paid (Selected Period),Unpaid Cases Count\n";

    technicianFinancials.forEach(tech => {
        const row = [tech.name, tech.amountOwed.toFixed(2), tech.totalPaidInPeriod.toFixed(2), tech.unpaidCases.length].join(",");
        csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `financial_report_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-text-primary">Payments & Financials</h1>
        <Button onClick={handleDownloadCSV} variant="secondary">Download CSV</Button>
      </div>

       <Card className="mb-6">
            <div className="flex flex-wrap items-center gap-4">
                <span className="font-semibold text-text-secondary">Filter Payments by Date:</span>
                <div className="flex gap-2">
                    <Button variant="secondary" onClick={() => setDateFilter('today')}>Today</Button>
                    <Button variant="secondary" onClick={() => setDateFilter('week')}>This Week</Button>
                    <Button variant="secondary" onClick={() => setDateFilter('month')}>This Month</Button>
                    <Button variant="secondary" onClick={() => setDateFilter('')}>Clear</Button>
                </div>
                <div className="flex items-center gap-2">
                    <input type="date" value={dateRange.start} onChange={(e) => setDateRange(prev => ({...prev, start: e.target.value}))} className="px-3 py-2 border border-border-color rounded-xl bg-white/5" />
                    <span className="text-text-tertiary">to</span>
                    <input type="date" value={dateRange.end} onChange={(e) => setDateRange(prev => ({...prev, end: e.target.value}))} className="px-3 py-2 border border-border-color rounded-xl bg-white/5" />
                </div>
            </div>
      </Card>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {technicianFinancials.map(tech => (
          <Card key={tech.id}>
            <h2 className="text-xl font-semibold text-text-primary">{tech.name}</h2>
            <div className="mt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-text-secondary">Amount Owed:</span>
                <span className="font-bold text-danger">${tech.amountOwed.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Paid (period):</span>
                <span className="font-bold text-success">${tech.totalPaidInPeriod.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-text-secondary">Unpaid Cases:</span>
                <span className="font-bold text-text-primary">{tech.unpaidCases.length}</span>
              </div>
            </div>
            <Button 
                onClick={() => handleOpenPaymentModal(tech)} 
                className="w-full mt-6"
                disabled={tech.amountOwed === 0}
            >
                Pay ${tech.amountOwed.toFixed(2)}
            </Button>
          </Card>
        ))}
      </div>

       <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={`Confirm Payment to ${selectedTech?.name}`}>
        {selectedTech && (
          <div>
            <p className="text-text-secondary mb-4">You are about to pay <span className="font-bold">${selectedTech.amountOwed.toFixed(2)}</span> for {selectedTech.unpaidCases.length} completed cases.</p>
            <ul className="text-sm list-disc list-inside mb-6 bg-white/5 p-3 rounded-xl max-h-40 overflow-y-auto">
                {selectedTech.unpaidCases.map((c: Case) => (
                    <li key={c.id}>{c.caseName} - ${getCaseCost(c).toFixed(2)}</li>
                ))}
            </ul>
            <div className="flex justify-end space-x-4">
              <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
              <Button onClick={handleConfirmPayment}>Confirm Payment</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminPayments;