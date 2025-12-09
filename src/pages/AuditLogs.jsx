import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Shield,
  Download,
  Filter,
  Eye,
  Edit,
  Trash2,
  LogIn,
  LogOut,
  CheckCircle,
  XCircle,
  FileText
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import DataTable from '@/components/common/DataTable';
import moment from 'moment';

const actionIcons = {
  'CREATE': <Edit className="w-4 h-4 text-emerald-600" />,
  'UPDATE': <Edit className="w-4 h-4 text-blue-600" />,
  'DELETE': <Trash2 className="w-4 h-4 text-red-600" />,
  'LOGIN': <LogIn className="w-4 h-4 text-purple-600" />,
  'LOGOUT': <LogOut className="w-4 h-4 text-slate-600" />,
  'APPROVE': <CheckCircle className="w-4 h-4 text-emerald-600" />,
  'REJECT': <XCircle className="w-4 h-4 text-red-600" />,
  'DISBURSE': <FileText className="w-4 h-4 text-blue-600" />,
  'VIEW': <Eye className="w-4 h-4 text-slate-500" />,
  'EXPORT': <Download className="w-4 h-4 text-amber-600" />
};

const actionColors = {
  'CREATE': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'UPDATE': 'bg-blue-50 text-blue-700 border-blue-200',
  'DELETE': 'bg-red-50 text-red-700 border-red-200',
  'LOGIN': 'bg-purple-50 text-purple-700 border-purple-200',
  'LOGOUT': 'bg-slate-50 text-slate-700 border-slate-200',
  'APPROVE': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  'REJECT': 'bg-red-50 text-red-700 border-red-200',
  'DISBURSE': 'bg-blue-50 text-blue-700 border-blue-200',
  'VIEW': 'bg-slate-50 text-slate-700 border-slate-200',
  'EXPORT': 'bg-amber-50 text-amber-700 border-amber-200'
};

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterAction, setFilterAction] = useState('all');
  const [filterModule, setFilterModule] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    try {
      setIsLoading(true);
      const data = await base44.entities.AuditLog.list('-created_date', 500);
      setLogs(data);
    } catch (error) {
      console.error('Error loading audit logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterAction !== 'all' && log.action !== filterAction) return false;
    if (filterModule !== 'all' && log.module !== filterModule) return false;
    if (filterDateFrom && moment(log.created_date).isBefore(filterDateFrom, 'day')) return false;
    if (filterDateTo && moment(log.created_date).isAfter(filterDateTo, 'day')) return false;
    return true;
  });

  const columns = [
    {
      header: 'Timestamp',
      accessor: 'created_date',
      sortable: true,
      cell: (value) => (
        <div>
          <p className="font-medium text-slate-900">{moment(value).format('MMM DD, YYYY')}</p>
          <p className="text-xs text-slate-500">{moment(value).format('hh:mm:ss A')}</p>
        </div>
      )
    },
    {
      header: 'Action',
      accessor: 'action',
      sortable: true,
      cell: (value) => (
        <Badge variant="outline" className={`${actionColors[value] || actionColors['VIEW']} flex items-center gap-1 w-fit`}>
          {actionIcons[value]}
          {value}
        </Badge>
      )
    },
    {
      header: 'Module',
      accessor: 'module',
      sortable: true,
      cell: (value) => (
        <span className="px-2 py-1 bg-slate-100 rounded text-sm text-slate-700">{value}</span>
      )
    },
    {
      header: 'Description',
      accessor: 'description',
      cell: (value) => <span className="text-slate-600">{value}</span>
    },
    {
      header: 'User',
      accessor: 'user_email',
      sortable: true,
      cell: (value, row) => (
        <div>
          <p className="font-medium text-slate-900">{value || 'System'}</p>
          {row.user_role && (
            <p className="text-xs text-slate-500">{row.user_role}</p>
          )}
        </div>
      )
    },
    {
      header: 'IP Address',
      accessor: 'ip_address',
      cell: (value) => <span className="font-mono text-sm text-slate-500">{value || '-'}</span>
    }
  ];

  const actionCounts = {
    total: filteredLogs.length,
    create: filteredLogs.filter(l => l.action === 'CREATE').length,
    update: filteredLogs.filter(l => l.action === 'UPDATE').length,
    delete: filteredLogs.filter(l => l.action === 'DELETE').length,
    login: filteredLogs.filter(l => l.action === 'LOGIN').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Audit Logs</h1>
          <p className="text-slate-500">Track all system activities and changes</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export Logs
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Events</p>
            <p className="text-2xl font-bold text-slate-900">{actionCounts.total}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Creates</p>
            <p className="text-2xl font-bold text-emerald-600">{actionCounts.create}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Updates</p>
            <p className="text-2xl font-bold text-blue-600">{actionCounts.update}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Deletes</p>
            <p className="text-2xl font-bold text-red-600">{actionCounts.delete}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Logins</p>
            <p className="text-2xl font-bold text-purple-600">{actionCounts.login}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl shadow-sm">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Action</Label>
          <Select value={filterAction} onValueChange={setFilterAction}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="CREATE">Create</SelectItem>
              <SelectItem value="UPDATE">Update</SelectItem>
              <SelectItem value="DELETE">Delete</SelectItem>
              <SelectItem value="LOGIN">Login</SelectItem>
              <SelectItem value="LOGOUT">Logout</SelectItem>
              <SelectItem value="APPROVE">Approve</SelectItem>
              <SelectItem value="REJECT">Reject</SelectItem>
              <SelectItem value="VIEW">View</SelectItem>
              <SelectItem value="EXPORT">Export</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Module</Label>
          <Select value={filterModule} onValueChange={setFilterModule}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="Members">Members</SelectItem>
              <SelectItem value="Loans">Loans</SelectItem>
              <SelectItem value="Savings">Savings</SelectItem>
              <SelectItem value="Transactions">Transactions</SelectItem>
              <SelectItem value="Reports">Reports</SelectItem>
              <SelectItem value="Settings">Settings</SelectItem>
              <SelectItem value="Authentication">Authentication</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">From Date</Label>
          <Input
            type="date"
            value={filterDateFrom}
            onChange={(e) => setFilterDateFrom(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">To Date</Label>
          <Input
            type="date"
            value={filterDateTo}
            onChange={(e) => setFilterDateTo(e.target.value)}
            className="w-40"
          />
        </div>
        <Button 
          variant="outline" 
          onClick={() => {
            setFilterAction('all');
            setFilterModule('all');
            setFilterDateFrom('');
            setFilterDateTo('');
          }}
        >
          Clear Filters
        </Button>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLogs}
        isLoading={isLoading}
        searchPlaceholder="Search logs..."
        pageSize={20}
        emptyMessage="No audit logs found."
      />
    </div>
  );
}