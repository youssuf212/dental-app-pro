

import React, { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../../hooks/useData';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
// Fix: Removed non-existent import 'parseISO' and replaced with native Date constructor.
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { CaseStatus } from '../../types';


const TechnicianDetailPage: React.FC = () => {
    const { technicianId } = useParams<{ technicianId: string }>();
    const { technicians, cases, payments, getTechnicianById } = useData();

    const technician = getTechnicianById(technicianId!);

    const techCases = useMemo(() => {
        return cases.filter(c => c.technicianId === technicianId);
    }, [cases, technicianId]);

    const techPayments = useMemo(() => {
        return payments.filter(p => p.technicianId === technicianId).sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [payments, technicianId]);
    
    const performanceData = useMemo(() => {
        const months: { [key: string]: { name: string, completed: number } } = {};
        techCases
            .filter(c => c.status === CaseStatus.FINISHED || c.status === CaseStatus.DELIVERED)
            .forEach(c => {
                const month = format(new Date(c.dueDate), 'MMM yyyy');
                if (!months[month]) {
                    months[month] = { name: format(new Date(c.dueDate), 'MMM'), completed: 0 };
                }
                months[month].completed++;
            });
        return Object.values(months);
    }, [techCases]);

    if (!technician) {
        return <div>Technician not found.</div>;
    }

    return (
        <div>
            <Link to="/admin/technicians" className="text-primary hover:underline mb-2 block">&larr; Back to Technicians</Link>
            <h1 className="text-3xl font-bold text-text-primary mb-6">{technician.name}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-1 space-y-8">
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Contact Info</h3>
                        <p><strong>Username:</strong> {technician.username}</p>
                        <p><strong>Phone:</strong> {technician.phone}</p>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Pricing List</h3>
                        <ul className="space-y-2 text-sm">
                            {technician.pricing.map((p, i) => (
                                <li key={i} className="flex justify-between">
                                    <span>{p.serviceName}</span>
                                    <span className="font-medium">${p.price.toFixed(2)}</span>
                                </li>
                            ))}
                        </ul>
                    </Card>
                </div>
                <div className="lg:col-span-2 space-y-8">
                     <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Performance Analytics</h3>
                         <div style={{ width: '100%', height: 250 }}>
                            <ResponsiveContainer>
                               <BarChart data={performanceData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                    <CartesianGrid stroke="rgba(255,255,255,0.1)" />
                                    <XAxis dataKey="name" tick={{ fill: '#C9CDD4' }} />
                                    <YAxis tick={{ fill: '#C9CDD4' }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,11,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }} itemStyle={{ color: '#FAFBFC' }} />
                                    <Legend formatter={(value) => <span className="text-text-secondary">{value}</span>} />
                                    <Bar dataKey="completed" fill="url(#colorPerf)" name="Cases Completed" />
                                    <defs>
                                        <linearGradient id="colorPerf" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14F5E8" stopOpacity={0.8}/>
                                            <stop offset="95%" stopColor="#0CD9CC" stopOpacity={0.3}/>
                                        </linearGradient>
                                    </defs>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                     </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Assigned Cases ({techCases.length})</h3>
                        <div className="max-h-96 overflow-y-auto">
                           <table className="w-full text-sm">
                                <thead><tr className="text-left text-text-tertiary"><th className="py-2">Case</th><th className="py-2">Due Date</th><th className="py-2">Status</th></tr></thead>
                                <tbody>
                                    {techCases.map(c => (
                                        <tr key={c.id} className="border-t border-border-color">
                                            <td className="py-2"><Link to={`/admin/cases/${c.id}`} className="hover:underline">{c.caseName}</Link></td>
                                            <td className="py-2">{format(new Date(c.dueDate), 'MMM dd, yyyy')}</td>
                                            <td className="py-2"><Badge status={c.status} /></td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </Card>
                    <Card>
                        <h3 className="text-lg font-semibold text-text-primary mb-4">Payment History</h3>
                         <div className="max-h-96 overflow-y-auto">
                           <table className="w-full text-sm">
                                <thead><tr className="text-left text-text-tertiary"><th className="py-2">Date</th><th className="py-2">Amount</th><th className="py-2">Cases</th><th className="py-2"></th></tr></thead>
                                <tbody>
                                    {techPayments.map(p => (
                                        <tr key={p.id} className="border-t border-border-color">
                                            <td className="py-2">{format(new Date(p.date), 'MMM dd, yyyy')}</td>
                                            <td className="py-2 font-medium text-success">${p.amount.toFixed(2)}</td>
                                            <td className="py-2">{p.caseIds.length}</td>
                                            <td className="py-2 text-right"><Button variant="secondary" className="text-xs py-1 px-2" onClick={() => alert('PDF Invoice generation is a planned feature.')}>Invoice</Button></td>
                                        </tr>
                                    ))}
                                </tbody>
                           </table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TechnicianDetailPage;