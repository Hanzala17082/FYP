'use client'

import { ReactNode } from 'react'
import { useAuth } from '@/shared/contexts/AuthContext'
import { ProtectedRoute } from './ProtectedRoute'
import { UserRole } from '@/types/entities/user.entity'

interface RoleLayoutProps {
  children: ReactNode
  allowedRoles: UserRole[]
  redirectTo?: string
}

export function RoleLayout({ children, allowedRoles, redirectTo }: RoleLayoutProps) {
  return (
    <ProtectedRoute allowedRoles={allowedRoles} redirectTo={redirectTo}>
      {children}
    </ProtectedRoute>
  )
}
