import React, { useState, useMemo } from 'react';
import { useData } from '../../hooks/useData';
import { Case } from '../../types';
import { format, isSameMonth, isToday } from 'date-fns';
import { Link } from 'react-router-dom';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';

const AdminCalendar: React.FC = () => {
  const { cases } = useData();
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const getDaysArrayForMonth = (dateInMonth: Date) => {
      const year = dateInMonth.getFullYear();
      const month = dateInMonth.getMonth();
      const date = new Date(year, month, 1);
      const days = [];
      while (date.getMonth() === month) {
          days.push(new Date(date));
          date.setDate(date.getDate() + 1);
      }
      return days;
  };

  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const daysInMonth = getDaysArrayForMonth(currentMonth);
  const startingDayIndex = firstDay.getDay();

  const prevMonth = () => setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() - 1);
      return d;
  });

  const nextMonth = () => setCurrentMonth(prev => {
      const d = new Date(prev);
      d.setMonth(d.getMonth() + 1);
      return d;
  });

  const casesByDate = useMemo(() => {
    return cases.reduce((acc, curr) => {
      const date = format(new Date(curr.dueDate), 'yyyy-MM-dd');
      if (!acc[date]) acc[date] = [];
      acc[date].push(curr);
      return acc;
    }, {} as Record<string, Case[]>);
  }, [cases]);

  const getWorkloadColor = (count: number) => {
    if (count === 0) return 'bg-opacity-0';
    if (count <= 1) return 'bg-primary/10';
    if (count <= 3) return 'bg-status-progress/10';
    return 'bg-danger/20';
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Case Calendar</h1>
      <Card>
        <div className="flex justify-between items-center mb-4 px-2">
          <Button onClick={prevMonth} variant="secondary" className="px-3 py-1 text-sm">&larr; Previous</Button>
          <h2 className="text-xl font-semibold text-text-primary">{format(currentMonth, 'MMMM yyyy')}</h2>
          <Button onClick={nextMonth} variant="secondary" className="px-3 py-1 text-sm">Next &rarr;</Button>
        </div>
        
        <div className="grid grid-cols-7">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
            <div key={day} className="text-center font-semibold text-sm py-2 text-text-tertiary">{day}</div>
          ))}
          
          {Array.from({ length: startingDayIndex }).map((_, i) => <div key={`empty-${i}`}></div>)}

          {daysInMonth.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayCases = casesByDate[dateStr] || [];
            
            const todayStart = new Date();
            todayStart.setHours(0, 0, 0, 0);
            const isOverdue = dayCases.length > 0 && day < todayStart;

            return (
              <div
                key={day.toString()}
                className={`min-h-[120px] p-1 border border-border-color/50 transition-colors duration-300 ${getWorkloadColor(dayCases.length)} ${isSameMonth(day, currentMonth) ? '' : 'bg-white/5 opacity-50'}`}
              >
                <div className={`text-sm font-semibold ${isToday(day) ? 'bg-primary text-black rounded-full w-6 h-6 flex items-center justify-center' : 'text-text-secondary'}`}>
                  {format(day, 'd')}
                </div>
                <div className="mt-1 space-y-1">
                  {dayCases.map(c => (
                    <Link to={`/admin/cases/${c.id}`} key={c.id} title={c.caseName} className={`block text-xs text-text-primary p-1.5 rounded-md truncate bg-surface-elevated/80 shadow-sm hover:ring-2 hover:ring-primary ${isOverdue ? 'border-l-2 border-danger' : ''}`}>
                      {c.caseName}
                    </Link>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};

export default AdminCalendar;