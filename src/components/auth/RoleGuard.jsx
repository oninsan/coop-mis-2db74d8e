import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

// Role hierarchy and permissions
export const ROLES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  LOAN_OFFICER: 'loan_officer',
  TELLER: 'teller',
  AUDITOR: 'auditor',
  MEMBER: 'member'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.MANAGER]: 'Manager',
  [ROLES.LOAN_OFFICER]: 'Loan Officer',
  [ROLES.TELLER]: 'Teller',
  [ROLES.AUDITOR]: 'Auditor',
  [ROLES.MEMBER]: 'Member'
};

export const ROLE_PERMISSIONS = {
  [ROLES.ADMIN]: ['all'],
  [ROLES.MANAGER]: ['dashboard', 'members', 'loans', 'savings', 'transactions', 'reports', 'audit_logs', 'settings', 'approve_loans'],
  [ROLES.LOAN_OFFICER]: ['dashboard', 'members', 'loans', 'reports'],
  [ROLES.TELLER]: ['dashboard', 'members', 'savings', 'transactions'],
  [ROLES.AUDITOR]: ['dashboard', 'reports', 'audit_logs', 'transactions'],
  [ROLES.MEMBER]: ['member_portal']
};

export const hasPermission = (userRole, permission) => {
  const role = userRole?.toLowerCase() || ROLES.MEMBER;
  const permissions = ROLE_PERMISSIONS[role] || ROLE_PERMISSIONS[ROLES.MEMBER];
  return permissions.includes('all') || permissions.includes(permission);
};

export const canAccessPage = (userRole, pageName) => {
  const role = userRole?.toLowerCase() || ROLES.MEMBER;
  const permissions = ROLE_PERMISSIONS[role] || [];
  
  if (permissions.includes('all')) return true;
  
  const pagePermissionMap = {
    'Dashboard': 'dashboard',
    'ManagerDashboard': 'dashboard',
    'LoanOfficerDashboard': 'dashboard',
    'TellerDashboard': 'dashboard',
    'AuditorDashboard': 'dashboard',
    'MemberPortal': 'member_portal',
    'Members': 'members',
    'Loans': 'loans',
    'Savings': 'savings',
    'Transactions': 'transactions',
    'Reports': 'reports',
    'AuditLogs': 'audit_logs',
    'Settings': 'settings'
  };
  
  const requiredPermission = pagePermissionMap[pageName];
  return requiredPermission ? permissions.includes(requiredPermission) : false;
};

export default function RoleGuard({ children, allowedRoles = [], userRole, fallback }) {
  const role = userRole?.toLowerCase() || ROLES.MEMBER;
  
  if (allowedRoles.length === 0 || allowedRoles.includes(role) || role === ROLES.ADMIN) {
    return children;
  }
  
  if (fallback) return fallback;
  
  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-8 text-center">
        <ShieldAlert className="w-12 h-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-slate-900 mb-2">Access Denied</h3>
        <p className="text-slate-500">You don't have permission to access this section.</p>
      </CardContent>
    </Card>
  );
}