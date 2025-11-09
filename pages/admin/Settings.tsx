import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import ThemeToggle from '../../components/ui/ThemeToggle';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Modal from '../../components/ui/Modal';
import { PlusIcon } from '../../components/icons/IconComponents';
import { MillingCenter } from '../../types';


const MillingCenterForm: React.FC<{
    onSave: (center: Omit<MillingCenter, 'id'>) => void;
}> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');

    const handleSave = () => {
        if (name && phoneNumber) {
            onSave({ name, phoneNumber });
        }
    };

    return (
        <div className="space-y-4">
            <Input label="Center Name" value={name} onChange={e => setName(e.target.value)} required />
            <Input label="Phone Number" value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)} required />
            <div className="flex justify-end pt-2">
                <Button onClick={handleSave}>Save Center</Button>
            </div>
        </div>
    );
};

const AdminSettings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { millingCenters, addMillingCenter } = useData();
  const [emailNotifications, setEmailNotifications] = useState(true);
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isMillingModalOpen, setIsMillingModalOpen] = useState(false);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordMessage({ type: '', text: '' });

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters long.' });
      return;
    }

    setIsChangingPassword(true);
    const result = await changePassword(currentPassword, newPassword);
    setIsChangingPassword(false);

    if (result.success) {
      setPasswordMessage({ type: 'success', text: result.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordMessage({ type: 'error', text: result.message });
    }
  };
  
  const handleAddMillingCenter = async (center: Omit<MillingCenter, 'id'>) => {
      await addMillingCenter(center);
      setIsMillingModalOpen(false);
  };

  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Settings</h1>
      <div className="max-w-4xl mx-auto space-y-8">
        <Card>
            <h2 className="text-xl font-semibold text-text-primary border-b border-border-color pb-4 mb-4">Profile</h2>
            <div className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                    <span className="font-medium text-text-tertiary">Name:</span>
                    <span className="col-span-2 text-text-secondary">{user?.name}</span>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <span className="font-medium text-text-tertiary">Email:</span>
                    <span className="col-span-2 text-text-secondary">{user?.username}</span>
                </div>
                 <div className="grid grid-cols-3 gap-4">
                    <span className="font-medium text-text-tertiary">Role:</span>
                    <span className="col-span-2 capitalize text-text-secondary">{user?.role}</span>
                </div>
            </div>
        </Card>

        <Card>
            <h2 className="text-xl font-semibold text-text-primary border-b border-border-color pb-4 mb-6">Change Password</h2>
             <form className="space-y-4" onSubmit={handlePasswordChange}>
                {passwordMessage.text && (
                  <p className={`text-sm p-3 rounded-lg ${passwordMessage.type === 'success' ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                    {passwordMessage.text}
                  </p>
                )}
                <Input
                    label="Current Password"
                    type="password"
                    id="current-password"
                    autoComplete="current-password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                />
                <Input
                    label="New Password"
                    type="password"
                    id="new-password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                />
                <Input
                    label="Confirm New Password"
                    type="password"
                    id="confirm-password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                />
                <div className="pt-2 text-right">
                    <Button type="submit" disabled={isChangingPassword}>
                        {isChangingPassword ? 'Updating...' : 'Update Password'}
                    </Button>
                </div>
            </form>
        </Card>

         <Card>
            <div className="flex justify-between items-center border-b border-border-color pb-4 mb-4">
                <h2 className="text-xl font-semibold text-text-primary">Milling Center Management</h2>
                <Button onClick={() => setIsMillingModalOpen(true)} variant="secondary">
                    <PlusIcon className="w-5 h-5 mr-2" /> Add Center
                </Button>
            </div>
            <div className="space-y-3">
                {millingCenters.map(center => (
                    <div key={center.id} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                        <span className="font-medium">{center.name}</span>
                        <span className="text-text-tertiary">{center.phoneNumber}</span>
                    </div>
                ))}
                {millingCenters.length === 0 && <p className="text-center text-text-tertiary">No milling centers added yet.</p>}
            </div>
        </Card>

        <Card>
            <h2 className="text-xl font-semibold text-text-primary border-b border-border-color pb-4 mb-4">Application Preferences</h2>
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-medium text-text-secondary">Theme</p>
                        <p className="text-sm text-text-tertiary">Choose between light and dark mode.</p>
                    </div>
                    <ThemeToggle />
                </div>
                <div className="flex items-center justify-between">
                     <div>
                        <p className="font-medium text-text-secondary">Email Notifications</p>
                        <p className="text-sm text-text-tertiary">Receive email alerts for critical updates.</p>
                    </div>
                    <label htmlFor="email-toggle" className="flex items-center cursor-pointer">
                        <div className="relative">
                            <input type="checkbox" id="email-toggle" className="sr-only" checked={emailNotifications} onChange={() => setEmailNotifications(!emailNotifications)} />
                            <div className={`block w-14 h-8 rounded-full ${emailNotifications ? 'bg-primary' : 'bg-surface-elevated'}`}></div>
                            <div className={`dot absolute left-1 top-1 bg-white w-6 h-6 rounded-full transition-transform ${emailNotifications ? 'translate-x-6' : ''}`}></div>
                        </div>
                    </label>
                </div>
            </div>
        </Card>
      </div>

       <Modal isOpen={isMillingModalOpen} onClose={() => setIsMillingModalOpen(false)} title="Add Milling Center">
            <MillingCenterForm onSave={handleAddMillingCenter} />
        </Modal>
    </div>
  );
};

export default AdminSettings;
