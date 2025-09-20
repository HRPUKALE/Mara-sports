import React, { createContext, useContext, useState, ReactNode } from 'react';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'sport_enrollment' | 'payment' | 'sponsorship' | 'system';
  timestamp: string;
  status: string;
  read: boolean;
  metadata?: {
    sport?: string;
    subCategory?: string;
    amount?: number;
    [key: string]: any;
  };
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  getNotifications: () => Notification[];
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Enrolled in Football (Under 17 - 9v9)',
      message: 'Successfully enrolled in Football tournament',
      type: 'sport_enrollment',
      timestamp: new Date().toISOString(),
      status: 'Successfully Enrolled',
      read: false,
      metadata: {
        sport: 'Football',
        subCategory: 'Under 17 - 9v9'
      }
    },
    {
      id: '2',
      title: 'Payment Confirmation',
      message: 'Payment of ₹150 confirmed for Football registration',
      type: 'payment',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      status: 'Payment Successful',
      read: false,
      metadata: {
        amount: 150,
        sport: 'Football'
      }
    }
  ]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      read: false
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotifications = () => notifications;

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      getNotifications
    }}>
      {children}
    </NotificationContext.Provider>
  );
};