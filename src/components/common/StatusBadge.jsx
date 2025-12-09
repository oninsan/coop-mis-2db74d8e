import React from 'react';
import { Badge } from '@/components/ui/badge';

const statusStyles = {
  // Member statuses
  'Active': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Inactive': 'bg-slate-50 text-slate-700 border-slate-200',
  'Suspended': 'bg-red-50 text-red-700 border-red-200',
  'Terminated': 'bg-red-50 text-red-700 border-red-200',
  
  // Loan statuses
  'Pending': 'bg-amber-50 text-amber-700 border-amber-200',
  'Under Review': 'bg-blue-50 text-blue-700 border-blue-200',
  'Approved': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Rejected': 'bg-red-50 text-red-700 border-red-200',
  'Disbursed': 'bg-purple-50 text-purple-700 border-purple-200',
  'Paid': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Defaulted': 'bg-red-50 text-red-700 border-red-200',
  'Restructured': 'bg-orange-50 text-orange-700 border-orange-200',
  
  // Account statuses
  'Dormant': 'bg-slate-50 text-slate-700 border-slate-200',
  'Frozen': 'bg-blue-50 text-blue-700 border-blue-200',
  'Closed': 'bg-slate-50 text-slate-700 border-slate-200',
  
  // Transaction statuses
  'Completed': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'Reversed': 'bg-amber-50 text-amber-700 border-amber-200',
  'Failed': 'bg-red-50 text-red-700 border-red-200',
  
  // Default
  'default': 'bg-slate-50 text-slate-700 border-slate-200',
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || statusStyles['default'];
  
  return (
    <Badge variant="outline" className={`${style} font-medium`}>
      {status}
    </Badge>
  );
}