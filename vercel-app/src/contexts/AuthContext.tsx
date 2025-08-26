'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

interface User {
  id: string
  name: string
  email: string
  role: 'customer' | 'admin' | 'super_admin'
}

interface AuthContextType {
  user: User | null
  login: (email: string, password: string) => Promise<boolean>
  logout: () => void
  register: (name: string, email: string, password: string) => Promise<boolean>
  loading: boolean
  isAuthenticated: boolean
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
            email: 'demo@songo-enterprise.com',
            role: 'customer'
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
          email,
          role: 'customer'
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

  const register = async (name: string, email: string, password: string): Promise<boolean> => {
    setLoading(true)
    try {
      // Mock registration - in real app, call your registration API
      if (name && email && password) {
        const mockUser: User = {
          id: Date.now().toString(),
          name,
          email,
          role: 'customer'
        }
        
        setUser(mockUser)
        localStorage.setItem('auth_token', 'mock_jwt_token')
        return true
      }
      return false
    } catch (error) {
      console.error('Registration failed:', error)
      return false
    } finally {
      setLoading(false)
    }
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
    isAuthenticated: !!user
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
