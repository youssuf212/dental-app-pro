import React, { createContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from '../types';
import { base, TABLE_NAMES } from '../airtable-config';

interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<User | null>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean, message: string }>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Failed to parse user from localStorage", error);
      return null;
    }
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = async (username: string, password: string): Promise<User | null> => {
    try {
        const records = await base(TABLE_NAMES.USERS)
            .select({
                filterByFormula: `{Email} = "${username}"`,
                maxRecords: 1,
            })
            .firstPage();

        if (records.length === 0) {
            console.error("User not found:", username);
            return null;
        }

        const record = records[0];
        const storedPassword = record.fields.Password as string;

        if (storedPassword === password) {
            const foundUser: User = {
                id: record.id,
                name: record.fields['User Name'] as string,
                username: record.fields.Email as string,
                role: (record.fields.Role as string)?.toLowerCase() === 'manager' ? UserRole.ADMIN : UserRole.TECHNICIAN,
            };
            setUser(foundUser);
            return foundUser;
        } else {
            console.error("Incorrect password for user:", username);
            return null;
        }
    } catch (error) {
        console.error("Error logging in with Airtable:", error);
        return null;
    }
  };

  const logout = () => {
    setUser(null);
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean, message: string }> => {
    if (!user) {
        return { success: false, message: "No user is logged in." };
    }
    try {
        const record = await base(TABLE_NAMES.USERS).find(user.id);
        const storedPassword = record.fields.Password as string;

        if (storedPassword !== currentPassword) {
            return { success: false, message: "Current password is not correct." };
        }

        await base(TABLE_NAMES.USERS).update(user.id, {
            "Password": newPassword
        });

        return { success: true, message: "Password updated successfully." };

    } catch (error) {
        console.error("Error changing password in Airtable:", error);
        return { success: false, message: "An error occurred while changing the password." };
    }
  };


  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword }}>
      {children}
    </AuthContext.Provider>
  );
};
