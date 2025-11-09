

import React, { useState, useEffect, useRef } from 'react';
import { useData } from '../../hooks/useData';
import { useAuth } from '../../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { BellIcon } from '../icons/IconComponents';
import { formatDistanceToNow } from 'date-fns';

const NotificationBell: React.FC = () => {
  const { notifications, markNotificationAsRead } = useData();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const userNotifications = user ? notifications.filter(n => !n.recipientId || n.recipientId === user.id) : [];
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleNotificationClick = (notification: any) => {
    markNotificationAsRead(notification.id);
    navigate(notification.link);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="relative text-text-tertiary hover:text-text-primary p-2 rounded-full transition-colors hover:bg-white/10">
        <BellIcon className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-danger ring-2 ring-surface-elevated animate-pulse"></span>
        )}
      </button>
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 rounded-xl shadow-lg bg-surface-elevated/80 backdrop-blur-xl border border-border-color z-10">
          <div className="p-2 font-semibold border-b border-border-color">Notifications</div>
          <div className="max-h-96 overflow-y-auto">
            {userNotifications.length > 0 ? (
                userNotifications.map(n => (
                    <div
                        key={n.id}
                        onClick={() => handleNotificationClick(n)}
                        className={`p-3 cursor-pointer hover:bg-white/5 ${!n.isRead ? 'font-bold' : ''}`}
                    >
                        <p className="text-sm">{n.message}</p>
                        <p className="text-xs text-text-tertiary mt-1">{formatDistanceToNow(new Date(n.timestamp), { addSuffix: true })}</p>
                    </div>
                ))
            ) : (
                <p className="p-4 text-sm text-center text-text-tertiary">No new notifications</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
