import React, { useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { CaseStatus, Technician } from '../../types';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import Badge from '../../components/ui/Badge';
// Fix: Removed non-existent import 'parseISO' and replaced with native Date constructor.
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const COLORS = {
  [CaseStatus.NEW]: '#00D9FF',
  [CaseStatus.IN_PROGRESS]: '#FFB800',
  [CaseStatus.FINISHED]: '#00FF94',
  [CaseStatus.NEEDS_EDIT]: '#FF0090',
  [CaseStatus.MILLED]: '#F075FF',
  [CaseStatus.DELIVERED]: '#8B92A0',
  [CaseStatus.READY_FOR_REVIEW]: '#B794FF',
};

const AdminDashboard: React.FC = () => {
  const { cases, technicians, getTechnicianById, generatePaymentNotifications } = useData();

  const caseStatusData = useMemo(() => {
    const statusCounts = cases.reduce((acc, curr) => {
      acc[curr.status] = (acc[curr.status] || 0) + 1;
      return acc;
    }, {} as Record<CaseStatus, number>);

    return Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  }, [cases]);

  const technicianWorkloadData = useMemo(() => {
    return technicians.map(tech => ({
      name: tech.name,
      'Active Cases': cases.filter(c => c.technicianId === tech.id && c.status !== CaseStatus.DELIVERED && c.status !== CaseStatus.FINISHED).length
    }));
  }, [cases, technicians]);
  
  const avgTurnaroundTime = useMemo(() => {
    const completedCases = cases.filter(c => typeof c.completedAt === 'string' && typeof c.createdAt === 'string');
    if (completedCases.length === 0) return 'N/A';
    
    const validTurnarounds = completedCases.map(c => {
        try {
            const completed = new Date(c.completedAt!);
            const created = new Date(c.createdAt);
            const diff = differenceInDays(completed, created);
            return diff >= 0 ? diff : null;
        } catch (e) {
            console.warn(`Could not parse dates for case ${c.id}`, e);
            return null;
        }
    }).filter((days): days is number => days !== null);

    if (validTurnarounds.length === 0) {
        return 'N/A';
    }

    const totalDays = validTurnarounds.reduce((sum, days) => sum + days, 0);
    const avg = totalDays / validTurnarounds.length;
    return `${avg.toFixed(1)} days`;
  }, [cases]);

  const recentCases = [...cases].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
  
  const listVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };


  const StatCard: React.FC<{title: string, value: string | number, color: string}> = ({title, value, color}) => (
    <Card className={`border-t-4 ${color}`} noFloat={true}>
      <p className="text-sm text-text-tertiary font-medium">{title}</p>
      <p className="text-3xl font-bold text-text-primary mt-1">{value}</p>
    </Card>
  )

  return (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-text-primary">Dashboard</h1>
            <Button onClick={generatePaymentNotifications} variant="secondary">Generate Monthly Payment Reminders</Button>
        </div>
      
      <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <motion.div variants={itemVariants}><StatCard title="Total Active Cases" value={cases.filter(c => c.status !== CaseStatus.DELIVERED).length} color="border-primary-glow shadow-glow-primary" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Needs Attention" value={cases.filter(c => c.status === CaseStatus.NEEDS_EDIT || c.status === CaseStatus.READY_FOR_REVIEW).length} color="border-danger shadow-[0_0_20px_rgba(255,77,77,0.4)]" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Avg. Turnaround" value={avgTurnaroundTime} color="border-accent-glow shadow-glow-accent" /></motion.div>
        <motion.div variants={itemVariants}><StatCard title="Finished This Month" value={cases.filter(c => c.completedAt && new Date(c.completedAt).getMonth() === new Date().getMonth()).length} color="border-success shadow-[0_0_20px_rgba(0,255,148,0.4)]" /></motion.div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-8">
         <Card className="lg:col-span-3">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Technician Workload</h2>
            <div style={{ width: '100%', height: 300 }}>
                 <ResponsiveContainer>
                    <BarChart data={technicianWorkloadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                        <CartesianGrid stroke="rgba(255,255,255,0.1)" vertical={false} />
                        <XAxis dataKey="name" tick={{ fill: '#C9CDD4' }} />
                        <YAxis allowDecimals={false} tick={{ fill: '#C9CDD4' }} />
                        <Tooltip
                            cursor={{fill: 'rgba(20,245,232,0.1)'}}
                            contentStyle={{ backgroundColor: 'rgba(10,10,11,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                            labelStyle={{ color: '#FAFBFC' }}
                        />
                        <Bar dataKey="Active Cases" fill="url(#colorUv)" radius={[4, 4, 0, 0]} />
                        <defs>
                            <linearGradient id="colorUv" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#14F5E8" stopOpacity={0.8}/>
                                <stop offset="95%" stopColor="#0CD9CC" stopOpacity={0.3}/>
                            </linearGradient>
                        </defs>
                    </BarChart>
                </ResponsiveContainer>
            </div>
         </Card>
         <Card className="lg:col-span-2">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Case Status Overview</h2>
          <div style={{ width: '100%', height: 300 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={caseStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={100}
                  innerRadius={60}
                  paddingAngle={5}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                >
                  {caseStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as CaseStatus]} stroke={COLORS[entry.name as CaseStatus]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,11,0.8)', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }} itemStyle={{color: '#FAFBFC'}}/>
                <Legend iconType="circle" formatter={(value) => <span className="text-text-secondary">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
      
      <Card>
          <h2 className="text-xl font-semibold text-text-primary mb-4">Recent Cases</h2>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left">
               <thead className="text-xs text-text-tertiary uppercase">
                 <tr>
                   <th scope="col" className="px-6 py-3">Case Name</th>
                   <th scope="col" className="px-6 py-3">Technician</th>
                   <th scope="col" className="px-6 py-3">Due Date</th>
                   <th scope="col" className="px-6 py-3">Status</th>
                 </tr>
               </thead>
               <tbody>
                 {recentCases.map(c => (
                   <tr key={c.id} className="border-t border-border-color">
                     <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                        <Link to={`/admin/cases/${c.id}`} className="hover:text-primary hover:underline">
                            {c.caseName}
                        </Link>
                    </td>
                     <td className="px-6 py-4">{getTechnicianById(c.technicianId)?.name || 'N/A'}</td>
                     <td className="px-6 py-4">{format(new Date(c.dueDate), 'MMM dd, yyyy')}</td>
                     <td className="px-6 py-4"><Badge status={c.status} /></td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
        </Card>
    </div>
  );
};

export default AdminDashboard;