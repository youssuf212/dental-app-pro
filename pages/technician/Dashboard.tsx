import React, { useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import { Case, CaseStatus } from '../../types';
import Card from '../../components/ui/Card';
import { Link } from 'react-router-dom';
import { SettingsIcon, ClockIcon } from '../../components/icons/IconComponents';
import Button from '../../components/ui/Button';
import { formatDistanceToNow } from 'date-fns';

const motivationalQuotes = [
    "The journey of a thousand smiles begins with a single crown.",
    "Precision is not an act, but a habit.",
    "Crafting confidence, one tooth at a time.",
    "Every case is a canvas, and you are the artist.",
    "Your hands create the art that science makes possible."
];

const TechDashboard: React.FC = () => {
    const { user } = useAuth();
    const { cases, technicians, updateCase } = useData();
    const [quote] = React.useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);

    const techProfile = useMemo(() => technicians.find(t => t.userId === user?.id), [technicians, user]);

    const myCases = useMemo(() => {
        if (!techProfile) return [];
        return cases.filter(c => c.technicianId === techProfile.id);
    }, [cases, techProfile]);

    const newRequests = myCases.filter(c => c.status === CaseStatus.NEW);
    const needsEdit = myCases.filter(c => c.status === CaseStatus.NEEDS_EDIT);
    
    const recentActivity = useMemo(() => {
        if (!user) return [];
        return myCases
            .flatMap(c => (c.activityLog || []).map(log => ({ ...log, caseId: c.id, caseName: c.caseName })))
            .filter(log => log && log.timestamp && !isNaN(new Date(log.timestamp).getTime()) && log.authorName !== user.name)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 7);
    }, [myCases, user]);
    
    const handleAccept = (caseToUpdate: Case) => {
        if (user) {
            updateCase({ ...caseToUpdate, status: CaseStatus.IN_PROGRESS }, user.name);
        }
    };
    
    const ActionCard: React.FC<{title: string, cases: Case[]}> = ({title, cases}) => (
        <Card>
            <h2 className="text-xl font-semibold text-text-primary mb-4">{title} ({cases.length})</h2>
            {cases.length > 0 ? (
                <ul className="space-y-3 max-h-48 overflow-y-auto">
                    {cases.map(c => (
                        <li key={c.id} className="p-3 bg-white/5 rounded-xl">
                            <Link to={`/technician/cases/${c.id}`} className="font-semibold hover:text-primary">{c.caseName}</Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-sm text-text-tertiary">No cases require your attention here.</p>
            )}
        </Card>
    );

    return (
        <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Welcome back, {user?.name.split(' ')[0]}!</h1>
            <p className="text-text-secondary mb-6 italic">"{quote}"</p>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card>
                    <h2 className="text-xl font-semibold text-text-primary mb-4">New Case Requests ({newRequests.length})</h2>
                    {newRequests.length > 0 ? (
                        <ul className="space-y-3 max-h-48 overflow-y-auto">
                            {newRequests.map(c => (
                                <li key={c.id} className="p-3 bg-white/5 rounded-xl flex justify-between items-center">
                                    <Link to={`/technician/cases/${c.id}`} className="font-semibold hover:text-primary">{c.caseName}</Link>
                                    <Button onClick={() => handleAccept(c)} className="py-1 px-3 text-xs">Accept</Button>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-tertiary">No new cases to accept.</p>
                    )}
                </Card>
                <ActionCard title="Needs Revisions" cases={needsEdit} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                 <Card>
                    <h3 className="font-semibold text-lg mb-2 flex items-center text-text-primary"><ClockIcon className="w-5 h-5 mr-2 text-primary"/> Recent Admin Activity</h3>
                    {recentActivity.length > 0 ? (
                        <ul className="space-y-2">
                            {recentActivity.map(log => (
                                <li key={log.id} className="text-sm text-text-secondary">
                                    <Link to={`/technician/cases/${log.caseId}`} className="hover:underline">
                                        Admin {log.activity.toLowerCase()} on case "{log.caseName}".
                                    </Link>
                                    <span className="text-xs text-text-tertiary ml-2">{formatDistanceToNow(new Date(log.timestamp), { addSuffix: true })}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-text-tertiary">No recent activity from admins.</p>
                    )}
                </Card>
                <Card>
                    <h3 className="font-semibold text-lg mb-2 flex items-center text-text-primary"><SettingsIcon className="w-5 h-5 mr-2 text-primary"/> Quick Links</h3>
                     <div className="flex flex-col space-y-2">
                        <Link to="/technician/all-cases"><Button variant="secondary" className="w-full justify-start">View All My Cases</Button></Link>
                        <Link to="/technician/settings"><Button variant="secondary" className="w-full justify-start">My Settings</Button></Link>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default TechDashboard;
