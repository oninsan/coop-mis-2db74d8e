import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from './utils';
import { base44 } from '@/api/base44Client';
import { ROLES, ROLE_LABELS, hasPermission } from '@/components/auth/RoleGuard';
import { 
  LayoutDashboard, 
  Users, 
  Wallet, 
  PiggyBank, 
  Receipt, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X,
  ChevronDown,
  Bell,
  Shield,
  Building2,
  UserCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

const getNavigationForRole = (role, coopRole) => {
  // Use coop_role if available, otherwise fall back to role
  const r = coopRole?.toLowerCase() || role?.toLowerCase() || 'member';
  
  // Member only sees Member Portal
  if (r === 'member') {
    return [
      { name: 'My Dashboard', href: 'MemberPortal', icon: UserCircle },
    ];
  }
  
  // Teller navigation
  if (r === 'teller') {
    return [
      { name: 'Dashboard', href: 'TellerDashboard', icon: LayoutDashboard },
      { name: 'Members', href: 'Members', icon: Users },
      { name: 'Savings', href: 'Savings', icon: PiggyBank },
      { name: 'Transactions', href: 'Transactions', icon: Receipt },
    ];
  }
  
  // Loan Officer navigation
  if (r === 'loan_officer') {
    return [
      { name: 'Dashboard', href: 'LoanOfficerDashboard', icon: LayoutDashboard },
      { name: 'Members', href: 'Members', icon: Users },
      { name: 'Loans', href: 'Loans', icon: Wallet },
      { name: 'Reports', href: 'Reports', icon: FileText },
    ];
  }
  
  // Auditor navigation
  if (r === 'auditor') {
    return [
      { name: 'Dashboard', href: 'AuditorDashboard', icon: LayoutDashboard },
      { name: 'Transactions', href: 'Transactions', icon: Receipt },
      { name: 'Reports', href: 'Reports', icon: FileText },
      { name: 'Audit Logs', href: 'AuditLogs', icon: Shield },
    ];
  }
  
  // Manager navigation
  if (r === 'manager') {
    return [
      { name: 'Dashboard', href: 'ManagerDashboard', icon: LayoutDashboard },
      { name: 'Members', href: 'Members', icon: Users },
      { name: 'Loans', href: 'Loans', icon: Wallet },
      { name: 'Savings', href: 'Savings', icon: PiggyBank },
      { name: 'Transactions', href: 'Transactions', icon: Receipt },
      { name: 'Reports', href: 'Reports', icon: FileText },
      { name: 'Audit Logs', href: 'AuditLogs', icon: Shield },
      { name: 'User Management', href: 'UserManagement', icon: Users },
      { name: 'Settings', href: 'Settings', icon: Settings },
    ];
  }
  
  // Admin gets everything
  return [
    { name: 'Dashboard', href: 'Dashboard', icon: LayoutDashboard },
    { name: 'Manager View', href: 'ManagerDashboard', icon: LayoutDashboard },
    { name: 'Members', href: 'Members', icon: Users },
    { name: 'Loans', href: 'Loans', icon: Wallet },
    { name: 'Savings', href: 'Savings', icon: PiggyBank },
    { name: 'Transactions', href: 'Transactions', icon: Receipt },
    { name: 'Reports', href: 'Reports', icon: FileText },
    { name: 'Audit Logs', href: 'AuditLogs', icon: Shield },
    { name: 'User Management', href: 'UserManagement', icon: Users },
    { name: 'Settings', href: 'Settings', icon: Settings },
  ];
};

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const currentUser = await base44.auth.me();
      setUser(currentUser);
    } catch (error) {
      console.log('User not authenticated');
    }
  };

  const handleLogout = () => {
    base44.auth.logout();
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed top-0 left-0 z-50 h-full w-72 bg-white border-r border-slate-200 
        transform transition-transform duration-300 ease-in-out
        lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Logo */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-slate-200">
          <Link to={createPageUrl('Dashboard')} className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
              <Building2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900">CoopMIS</h1>
              <p className="text-xs text-slate-500">Credit Cooperative</p>
            </div>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-1">
          {getNavigationForRole(user?.role, user?.coop_role).map((item) => {
            const isActive = currentPageName === item.href;
            return (
              <Link
                key={item.name}
                to={createPageUrl(item.href)}
                onClick={() => setSidebarOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* User Profile at bottom */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50">
            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-emerald-100 text-emerald-700 font-semibold">
                {getInitials(user?.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">
                {user?.full_name || 'User'}
              </p>
              <p className="text-xs text-slate-500 truncate capitalize">
                {ROLE_LABELS[user?.coop_role?.toLowerCase()] || ROLE_LABELS[user?.role?.toLowerCase()] || user?.role || 'Member'}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-white/80 backdrop-blur-md border-b border-slate-200">
          <div className="h-full px-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {currentPageName || 'Dashboard'}
                </h2>
                <p className="text-xs text-slate-500">
                  {new Date().toLocaleDateString('en-PH', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2 pl-2 pr-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-emerald-100 text-emerald-700 text-sm font-semibold">
                        {getInitials(user?.full_name)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="hidden sm:block text-sm font-medium text-slate-700">
                      {user?.full_name || 'User'}
                    </span>
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div>
                      <p className="font-medium">{user?.full_name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to={createPageUrl('Settings')} className="cursor-pointer">
                      <Settings className="w-4 h-4 mr-2" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>

      <style>{`
        :root {
          --color-primary: #10b981;
          --color-primary-dark: #059669;
        }
      `}</style>
    </div>
  );
}