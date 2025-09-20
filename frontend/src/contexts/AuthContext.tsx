import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

interface Student {
  id: string;
  fullName: string;
  email: string;
  dateOfBirth: string;
  gender: string;
  instituteName: string;
  studentId: string;
  profilePicture?: string;
  isEmailVerified: boolean;
  
  // Contact Information
  parentGuardianName?: string;
  parentPhone?: string;
  parentEmail?: string;
  
  // Emergency Contact
  emergencyContactName?: string;
  emergencyContactRelation?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  
  // Medical Information
  medicalConditions?: string;
  specialAssistance?: string;
  allergies?: string;
  medications?: string;
  emergencyMedicalInfo?: string;
}

interface AuthContextType {
  student: Student | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (studentData: Partial<Student> & { password: string }) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<Student>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [student, setStudent] = useState<Student | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for existing session on mount
    const storedStudent = localStorage.getItem('student');
    if (storedStudent) {
      setStudent(JSON.parse(storedStudent));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      
      if (response.data) {
        // Store auth token
        localStorage.setItem('authToken', response.data.token);
        
        // Check if user is admin
        if (response.data.role === 'admin') {
          // For admin users, create a simple admin profile
          const adminProfile: Student = {
            id: response.data.user_id,
            fullName: 'Admin User',
            email: response.data.email,
            dateOfBirth: '',
            gender: '',
            instituteName: 'System Administration',
            studentId: 'ADMIN',
            isEmailVerified: response.data.is_verified,
          };
          
          setStudent(adminProfile);
          setIsAuthenticated(true);
          localStorage.setItem('student', JSON.stringify(adminProfile));
          
          // Also set admin session for admin-specific routing
          localStorage.setItem('adminSession', JSON.stringify({ 
            email: response.data.email, 
            role: 'admin' 
          }));
          
          return true;
        }
        
        // For regular users, get student profile
        try {
          const userResponse = await apiService.getStudent(response.data.user_id);
          const userData = userResponse.data;
          
          const student: Student = {
            id: userData.id,
            fullName: `${userData.first_name} ${userData.last_name}`,
            email: userData.email,
            dateOfBirth: userData.date_of_birth,
            gender: userData.gender,
            instituteName: userData.institution?.name || '',
            studentId: userData.student_id || '',
            isEmailVerified: userData.is_verified,
          };

          setStudent(student);
          setIsAuthenticated(true);
          localStorage.setItem('student', JSON.stringify(student));
          return true;
        } catch (profileError) {
          // If no student profile exists, create a basic one
          const basicProfile: Student = {
            id: response.data.user_id,
            fullName: 'User',
            email: response.data.email,
            dateOfBirth: '',
            gender: '',
            instituteName: '',
            studentId: '',
            isEmailVerified: response.data.is_verified,
          };
          
          setStudent(basicProfile);
          setIsAuthenticated(true);
          localStorage.setItem('student', JSON.stringify(basicProfile));
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  };

  const register = async (studentData: Partial<Student> & { password: string }): Promise<boolean> => {
    try {
      // First create user account
      const userData = {
        email: studentData.email,
        password: studentData.password,
        role: 'student'
      };
      
      const userResponse = await apiService.register(userData);
      
      if (userResponse.data) {
        // Then create student profile
        const studentProfileData = {
          user_id: userResponse.data.user_id,
          first_name: studentData.fullName?.split(' ')[0] || '',
          last_name: studentData.fullName?.split(' ').slice(1).join(' ') || '',
          gender: studentData.gender || '',
          date_of_birth: studentData.dateOfBirth || '',
          student_id: studentData.studentId || '',
        };
        
        await apiService.createStudent(studentProfileData);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Registration failed:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await apiService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setStudent(null);
      setIsAuthenticated(false);
      localStorage.removeItem('student');
      localStorage.removeItem('authToken');
      localStorage.removeItem('adminSession');
    }
  };

  const updateProfile = (data: Partial<Student>) => {
    if (student) {
      const updatedStudent = { ...student, ...data };
      setStudent(updatedStudent);
      localStorage.setItem('student', JSON.stringify(updatedStudent));
    }
  };

  const value: AuthContextType = {
    student,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};