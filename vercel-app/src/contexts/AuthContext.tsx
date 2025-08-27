'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  firstName: string
  lastName: string
  company?: string
  phone?: string
  role: 'customer' | 'admin' | 'super_admin'
  isVerified: boolean
  createdAt: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  phone: string
  company?: string
  password: string
}

export interface ShipmentHistory {
  id: string
  trackingNumber: string
  carrier: string
  status: string
  origin: string
  destination: string
  createdAt: string
  deliveredAt?: string
  cost: number
}

export interface InvoiceHistory {
  id: string
  invoiceNumber: string
  amount: number
  status: 'paid' | 'pending' | 'overdue'
  createdAt: string
  dueDate: string
  shipments: string[]
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (data: RegisterData) => Promise<boolean>
  loading: boolean
  isAuthenticated: boolean
  updateProfile: (data: Partial<User>) => Promise<boolean>
  getShipmentHistory: () => Promise<ShipmentHistory[]>
  getInvoiceHistory: () => Promise<InvoiceHistory[]>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing session on mount
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('auth_token')
        if (token) {
          // In a real app, validate token with backend
          const mockUser: User = {
            id: '1',
            name: 'Demo User',
            firstName: 'Demo',
            lastName: 'User',
            email: 'demo@songo-enterprise.com',
            company: 'Demo Corp',
            phone: '+1-555-0123',
            role: 'customer',
            isVerified: true,
            createdAt: '2024-01-01T00:00:00Z'
          }
          setUser(mockUser)
        }
      } catch (error) {
        console.error('Auth check failed:', error)
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [])

  const login = async (email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Mock login - in real app, call your authentication API
      if (email && password) {
        const mockUser: User = {
          id: '1',
          name: email.split('@')[0],
          firstName: email.split('@')[0],
          lastName: 'User',
          email,
          role: 'customer',
          isVerified: true,
          createdAt: new Date().toISOString()
        }
        
        setUser(mockUser)
        localStorage.setItem('auth_token', 'mock_jwt_token')
        return true
      }
      return false
    } catch (error) {
      console.error('Login failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterData): Promise<boolean> => {
    setLoading(true)
    try {
      // Mock registration - in real app, call your registration API
      const mockUser: User = {
        id: Date.now().toString(),
        name: `${data.firstName} ${data.lastName}`,
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        company: data.company,
        phone: data.phone,
        role: 'customer',
        isVerified: false,
        createdAt: new Date().toISOString()
      }

      setUser(mockUser)
      localStorage.setItem('auth_token', 'mock_jwt_token')
      return true
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const updateProfile = async (data: Partial<User>): Promise<boolean> => {
    try {
      if (user) {
        const updatedUser = { ...user, ...data }
        setUser(updatedUser)
        return true
      }
      return false
    } catch (error) {
      console.error('Profile update error:', error)
      return false
    }
  }

  const getShipmentHistory = async (): Promise<ShipmentHistory[]> => {
    return [
      {
        id: '1',
        trackingNumber: '1Z999AA1234567890',
        carrier: 'UPS',
        status: 'DELIVERED',
        origin: 'New York, NY',
        destination: 'Los Angeles, CA',
        createdAt: '2024-01-15T10:00:00Z',
        deliveredAt: '2024-01-18T14:30:00Z',
        cost: 45.99
      },
      {
        id: '2',
        trackingNumber: '123456789012',
        carrier: 'FedEx',
        status: 'IN_TRANSIT',
        origin: 'Chicago, IL',
        destination: 'Miami, FL',
        createdAt: '2024-01-20T09:15:00Z',
        cost: 32.50
      },
      {
        id: '3',
        trackingNumber: 'D420352470001072202001',
        carrier: 'Canpar',
        status: 'OUT_FOR_DELIVERY',
        origin: 'Toronto, ON',
        destination: 'Vancouver, BC',
        createdAt: '2024-01-22T11:30:00Z',
        cost: 28.75
      }
    ]
  }

  const getInvoiceHistory = async (): Promise<InvoiceHistory[]> => {
    return [
      {
        id: '1',
        invoiceNumber: 'INV-2024-001',
        amount: 78.49,
        status: 'paid',
        createdAt: '2024-01-15T10:00:00Z',
        dueDate: '2024-02-15T10:00:00Z',
        shipments: ['1', '2']
      },
      {
        id: '2',
        invoiceNumber: 'INV-2024-002',
        amount: 28.75,
        status: 'pending',
        createdAt: '2024-01-22T11:30:00Z',
        dueDate: '2024-02-22T11:30:00Z',
        shipments: ['3']
      }
    ]
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('auth_token')
  }

  const value: AuthContextType = {
    user,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user,
    updateProfile,
    getShipmentHistory,
    getInvoiceHistory
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
