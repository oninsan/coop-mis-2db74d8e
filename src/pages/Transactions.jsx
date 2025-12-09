import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Download,
  ArrowDownCircle,
  ArrowUpCircle,
  Wallet,
  Receipt,
  Filter
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
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import moment from 'moment';

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState('all');
  const [filterDateFrom, setFilterDateFrom] = useState('');
  const [filterDateTo, setFilterDateTo] = useState('');

  useEffect(() => {
    loadTransactions();
  }, []);

  const loadTransactions = async () => {
    try {
      setIsLoading(true);
      const data = await base44.entities.Transaction.list('-created_date', 1000);
      setTransactions(data);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getTransactionIcon = (type) => {
    switch(type) {
      case 'Deposit':
        return <ArrowDownCircle className="w-4 h-4 text-emerald-600" />;
      case 'Withdrawal':
        return <ArrowUpCircle className="w-4 h-4 text-amber-600" />;
      case 'Loan Payment':
        return <Wallet className="w-4 h-4 text-blue-600" />;
      case 'Loan Disbursement':
        return <Wallet className="w-4 h-4 text-purple-600" />;
      default:
        return <Receipt className="w-4 h-4 text-slate-600" />;
    }
  };

  const getTransactionColor = (type) => {
    switch(type) {
      case 'Deposit':
      case 'Loan Payment':
        return 'text-emerald-600';
      case 'Withdrawal':
      case 'Loan Disbursement':
        return 'text-red-600';
      default:
        return 'text-slate-900';
    }
  };

  const filteredTransactions = transactions.filter(txn => {
    if (filterType !== 'all' && txn.transaction_type !== filterType) return false;
    if (filterDateFrom && moment(txn.transaction_date).isBefore(filterDateFrom)) return false;
    if (filterDateTo && moment(txn.transaction_date).isAfter(filterDateTo)) return false;
    return true;
  });

  const totalDeposits = filteredTransactions
    .filter(t => t.transaction_type === 'Deposit')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalWithdrawals = filteredTransactions
    .filter(t => t.transaction_type === 'Withdrawal')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
  
  const totalLoanPayments = filteredTransactions
    .filter(t => t.transaction_type === 'Loan Payment')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const columns = [
    {
      header: 'Transaction #',
      accessor: 'transaction_number',
      sortable: true,
      cell: (value) => <span className="font-mono text-sm text-slate-600">{value}</span>
    },
    {
      header: 'Date',
      accessor: 'transaction_date',
      sortable: true,
      cell: (value) => moment(value).format('MMM DD, YYYY')
    },
    {
      header: 'Type',
      accessor: 'transaction_type',
      sortable: true,
      cell: (value) => (
        <div className="flex items-center gap-2">
          {getTransactionIcon(value)}
          <span>{value}</span>
        </div>
      )
    },
    {
      header: 'Member',
      accessor: 'member_name',
      sortable: true
    },
    {
      header: 'Account/Loan',
      accessor: 'account_number',
      cell: (value) => <span className="font-mono text-sm">{value || '-'}</span>
    },
    {
      header: 'Amount',
      accessor: 'amount',
      sortable: true,
      cell: (value, row) => (
        <span className={`font-semibold ${getTransactionColor(row.transaction_type)}`}>
          {row.transaction_type === 'Deposit' || row.transaction_type === 'Loan Payment' ? '+' : '-'}
          ₱{(value || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Balance',
      accessor: 'running_balance',
      cell: (value) => value ? `₱${value.toLocaleString()}` : '-'
    },
    {
      header: 'Method',
      accessor: 'payment_method',
      cell: (value) => value || '-'
    },
    {
      header: 'Status',
      accessor: 'status',
      cell: (value) => <StatusBadge status={value} />
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Transactions</h1>
          <p className="text-slate-500">View all financial transactions</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Transactions</p>
            <p className="text-2xl font-bold text-slate-900">{filteredTransactions.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Deposits</p>
            <p className="text-2xl font-bold text-emerald-600">₱{totalDeposits.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Withdrawals</p>
            <p className="text-2xl font-bold text-amber-600">₱{totalWithdrawals.toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Loan Payments</p>
            <p className="text-2xl font-bold text-blue-600">₱{totalLoanPayments.toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-end gap-4 p-4 bg-white rounded-xl shadow-sm">
        <div className="space-y-1">
          <Label className="text-xs text-slate-500">Transaction Type</Label>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Deposit">Deposit</SelectItem>
              <SelectItem value="Withdrawal">Withdrawal</SelectItem>
              <SelectItem value="Loan Payment">Loan Payment</SelectItem>
              <SelectItem value="Loan Disbursement">Loan Disbursement</SelectItem>
              <SelectItem value="Share Capital">Share Capital</SelectItem>
              <SelectItem value="Interest Credit">Interest Credit</SelectItem>
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
            setFilterType('all');
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
        data={filteredTransactions}
        isLoading={isLoading}
        searchPlaceholder="Search transactions..."
        pageSize={20}
        emptyMessage="No transactions found."
      />
    </div>
  );
}