import React, { useState } from 'react';
import Card from '../../components/ui/Card';
import { useAuth } from '../../hooks/useAuth';
import { useData } from '../../hooks/useData';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import ThemeToggle from '../../components/ui/ThemeToggle';


const TechSettings: React.FC = () => {
  const { user, changePassword } = useAuth();
  const { technicians } = useData();

  const techProfile = technicians.find(t => t.userId === user?.id);

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

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


  return (
    <div>
      <h1 className="text-3xl font-bold text-text-primary mb-6">Settings</h1>
      <div className="max-w-4xl mx-auto space-y-8">
        {techProfile && (
            <Card>
                <h2 className="text-xl font-semibold text-text-primary border-b border-border-color pb-4 mb-4">My Profile</h2>
                <div className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-text-tertiary">Name:</span>
                        <span className="col-span-2 text-text-secondary">{techProfile.name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-text-tertiary">Email:</span>
                        <span className="col-span-2 text-text-secondary">{techProfile.email}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <span className="font-medium text-text-tertiary">Phone:</span>
                        <span className="col-span-2 text-text-secondary">{techProfile.phone}</span>
                    </div>
                </div>
            </Card>
        )}

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
            <h2 className="text-xl font-semibold text-text-primary border-b border-border-color pb-4 mb-4">Preferences</h2>
             <div className="flex items-center justify-between">
                <div>
                    <p className="font-medium text-text-secondary">Theme</p>
                    <p className="text-sm text-text-tertiary">Choose between light and dark mode.</p>
                </div>
                <ThemeToggle />
            </div>
        </Card>
      </div>
    </div>
  );
};

export default TechSettings;
