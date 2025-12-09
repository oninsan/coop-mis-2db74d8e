import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Plus, 
  Eye,
  ArrowDownCircle,
  ArrowUpCircle,
  PiggyBank,
  Receipt
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import moment from 'moment';

export default function Savings() {
  const [accounts, setAccounts] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionType, setTransactionType] = useState('Deposit');
  const [filterType, setFilterType] = useState('all');
  const [formData, setFormData] = useState({
    member_id: '',
    account_type: 'Regular Savings',
    interest_rate: 2,
    minimum_balance: 500,
    initial_deposit: ''
  });
  const [transactionData, setTransactionData] = useState({
    amount: '',
    description: '',
    payment_method: 'Cash'
  });
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [accountsData, membersData] = await Promise.all([
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.Member.filter({ status: 'Active' })
      ]);
      setAccounts(accountsData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateAccountNumber = (type) => {
    const prefix = type === 'Regular Savings' ? 'SA' : 
                   type === 'Time Deposit' ? 'TD' : 
                   type === 'Special Savings' ? 'SS' : 'CS';
    const random = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    return `${prefix}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const member = members.find(m => m.id === formData.member_id);
      const initialDeposit = parseFloat(formData.initial_deposit) || 0;
      
      const accountData = {
        account_number: generateAccountNumber(formData.account_type),
        member_id: formData.member_id,
        member_name: `${member?.first_name} ${member?.last_name}`,
        account_type: formData.account_type,
        balance: initialDeposit,
        interest_rate: parseFloat(formData.interest_rate),
        minimum_balance: parseFloat(formData.minimum_balance),
        status: 'Active',
        opened_date: new Date().toISOString().split('T')[0],
        last_transaction_date: initialDeposit > 0 ? new Date().toISOString().split('T')[0] : null,
        total_deposits: initialDeposit,
        total_withdrawals: 0,
        total_interest_earned: 0
      };
      
      const newAccount = await base44.entities.SavingsAccount.create(accountData);
      
      // Create initial deposit transaction if any
      if (initialDeposit > 0) {
        await base44.entities.Transaction.create({
          transaction_number: `TXN-${Date.now()}`,
          transaction_type: 'Deposit',
          member_id: formData.member_id,
          member_name: `${member?.first_name} ${member?.last_name}`,
          account_id: newAccount.id,
          account_number: accountData.account_number,
          amount: initialDeposit,
          running_balance: initialDeposit,
          transaction_date: new Date().toISOString().split('T')[0],
          description: 'Initial deposit',
          payment_method: 'Cash',
          status: 'Completed'
        });
      }
      
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating account:', error);
    }
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    try {
      const amount = parseFloat(transactionData.amount);
      const currentBalance = selectedAccount.balance || 0;
      const newBalance = transactionType === 'Deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;
      
      if (transactionType === 'Withdrawal' && newBalance < (selectedAccount.minimum_balance || 0)) {
        alert('Insufficient balance. Minimum balance required.');
        return;
      }
      
      // Create transaction
      await base44.entities.Transaction.create({
        transaction_number: `TXN-${Date.now()}`,
        transaction_type: transactionType,
        member_id: selectedAccount.member_id,
        member_name: selectedAccount.member_name,
        account_id: selectedAccount.id,
        account_number: selectedAccount.account_number,
        amount: amount,
        running_balance: newBalance,
        transaction_date: new Date().toISOString().split('T')[0],
        description: transactionData.description || `${transactionType} transaction`,
        payment_method: transactionData.payment_method,
        status: 'Completed'
      });
      
      // Update account balance
      const updateData = {
        balance: newBalance,
        last_transaction_date: new Date().toISOString().split('T')[0]
      };
      
      if (transactionType === 'Deposit') {
        updateData.total_deposits = (selectedAccount.total_deposits || 0) + amount;
      } else {
        updateData.total_withdrawals = (selectedAccount.total_withdrawals || 0) + amount;
      }
      
      await base44.entities.SavingsAccount.update(selectedAccount.id, updateData);
      
      setShowTransactionModal(false);
      setTransactionData({ amount: '', description: '', payment_method: 'Cash' });
      loadData();
    } catch (error) {
      console.error('Error processing transaction:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      account_type: 'Regular Savings',
      interest_rate: 2,
      minimum_balance: 500,
      initial_deposit: ''
    });
  };

  const handleView = async (account) => {
    setSelectedAccount(account);
    try {
      const txns = await base44.entities.Transaction.filter({ account_id: account.id }, '-created_date', 50);
      setTransactions(txns);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setTransactions([]);
    }
    setShowViewModal(true);
  };

  const openTransactionModal = (account, type) => {
    setSelectedAccount(account);
    setTransactionType(type);
    setShowTransactionModal(true);
  };

  const filteredAccounts = filterType === 'all' 
    ? accounts 
    : accounts.filter(a => a.account_type === filterType);

  const columns = [
    {
      header: 'Account Number',
      accessor: 'account_number',
      sortable: true,
      cell: (value) => <span className="font-mono text-sm text-slate-600">{value}</span>
    },
    {
      header: 'Member',
      accessor: 'member_name',
      sortable: true,
      cell: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
            <PiggyBank className="w-4 h-4 text-purple-600" />
          </div>
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'account_type',
      sortable: true
    },
    {
      header: 'Balance',
      accessor: 'balance',
      sortable: true,
      cell: (value) => <span className="font-medium text-emerald-600">₱{(value || 0).toLocaleString()}</span>
    },
    {
      header: 'Interest Rate',
      accessor: 'interest_rate',
      cell: (value) => `${value || 0}% p.a.`
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => <StatusBadge status={value} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(row); }} title="View">
            <Eye className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openTransactionModal(row, 'Deposit'); }} title="Deposit" className="text-emerald-600">
            <ArrowDownCircle className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openTransactionModal(row, 'Withdrawal'); }} title="Withdraw" className="text-amber-600">
            <ArrowUpCircle className="w-4 h-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Savings Accounts</h1>
          <p className="text-slate-500">Manage member savings accounts and transactions</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          Open Account
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Accounts</p>
            <p className="text-2xl font-bold text-slate-900">{accounts.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{accounts.filter(a => a.status === 'Active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Deposits</p>
            <p className="text-2xl font-bold text-blue-600">₱{accounts.reduce((sum, a) => sum + (a.total_deposits || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Balance</p>
            <p className="text-2xl font-bold text-purple-600">₱{accounts.reduce((sum, a) => sum + (a.balance || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Regular Savings">Regular Savings</SelectItem>
            <SelectItem value="Time Deposit">Time Deposit</SelectItem>
            <SelectItem value="Special Savings">Special Savings</SelectItem>
            <SelectItem value="Christmas Savings">Christmas Savings</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredAccounts}
        isLoading={isLoading}
        searchPlaceholder="Search accounts..."
        onRowClick={handleView}
        emptyMessage="No savings accounts found."
      />

      {/* Add Account Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Open Savings Account</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>Member *</Label>
              <Select value={formData.member_id} onValueChange={(v) => setFormData({...formData, member_id: v})}>
                <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                <SelectContent>
                  {members.map(m => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.first_name} {m.last_name} ({m.member_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Account Type *</Label>
              <Select value={formData.account_type} onValueChange={(v) => setFormData({...formData, account_type: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Regular Savings">Regular Savings</SelectItem>
                  <SelectItem value="Time Deposit">Time Deposit</SelectItem>
                  <SelectItem value="Special Savings">Special Savings</SelectItem>
                  <SelectItem value="Christmas Savings">Christmas Savings</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (%)</Label>
                <Input
                  type="number"
                  step="0.1"
                  value={formData.interest_rate}
                  onChange={(e) => setFormData({...formData, interest_rate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Min Balance</Label>
                <Input
                  type="number"
                  value={formData.minimum_balance}
                  onChange={(e) => setFormData({...formData, minimum_balance: e.target.value})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Initial Deposit</Label>
              <Input
                type="number"
                value={formData.initial_deposit}
                onChange={(e) => setFormData({...formData, initial_deposit: e.target.value})}
                placeholder="0.00"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Open Account</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Transaction Modal */}
      <Dialog open={showTransactionModal} onOpenChange={setShowTransactionModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {transactionType === 'Deposit' ? (
                <ArrowDownCircle className="w-5 h-5 text-emerald-600" />
              ) : (
                <ArrowUpCircle className="w-5 h-5 text-amber-600" />
              )}
              {transactionType}
            </DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <form onSubmit={handleTransaction} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="text-sm text-slate-500">Account</p>
                <p className="font-mono font-medium">{selectedAccount.account_number}</p>
                <p className="text-sm text-slate-500 mt-2">Current Balance</p>
                <p className="text-xl font-bold text-emerald-600">₱{(selectedAccount.balance || 0).toLocaleString()}</p>
              </div>
              
              <div className="space-y-2">
                <Label>Amount *</Label>
                <Input
                  type="number"
                  value={transactionData.amount}
                  onChange={(e) => setTransactionData({...transactionData, amount: e.target.value})}
                  placeholder="0.00"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label>Payment Method</Label>
                <Select value={transactionData.payment_method} onValueChange={(v) => setTransactionData({...transactionData, payment_method: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Description</Label>
                <Input
                  value={transactionData.description}
                  onChange={(e) => setTransactionData({...transactionData, description: e.target.value})}
                  placeholder="Optional description"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowTransactionModal(false)}>Cancel</Button>
                <Button type="submit" className={transactionType === 'Deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}>
                  Process {transactionType}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* View Account Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Account Details</DialogTitle>
          </DialogHeader>
          {selectedAccount && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-slate-500">{selectedAccount.account_number}</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedAccount.member_name}</h3>
                  <p className="text-slate-500">{selectedAccount.account_type}</p>
                </div>
                <StatusBadge status={selectedAccount.status} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-600">Balance</p>
                  <p className="text-xl font-bold text-emerald-700">₱{(selectedAccount.balance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-600">Total Deposits</p>
                  <p className="text-xl font-bold text-blue-700">₱{(selectedAccount.total_deposits || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-lg">
                  <p className="text-sm text-amber-600">Total Withdrawals</p>
                  <p className="text-xl font-bold text-amber-700">₱{(selectedAccount.total_withdrawals || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg">
                  <p className="text-sm text-purple-600">Interest Earned</p>
                  <p className="text-xl font-bold text-purple-700">₱{(selectedAccount.total_interest_earned || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Interest Rate</p>
                  <p className="font-medium">{selectedAccount.interest_rate}% per annum</p>
                </div>
                <div>
                  <p className="text-slate-500">Minimum Balance</p>
                  <p className="font-medium">₱{(selectedAccount.minimum_balance || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Opened Date</p>
                  <p className="font-medium">{selectedAccount.opened_date ? moment(selectedAccount.opened_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Last Transaction</p>
                  <p className="font-medium">{selectedAccount.last_transaction_date ? moment(selectedAccount.last_transaction_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
              </div>

              {/* Transaction History */}
              <div>
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Receipt className="w-4 h-4" />
                  Transaction History
                </h4>
                <div className="max-h-64 overflow-y-auto border rounded-lg">
                  {transactions.length === 0 ? (
                    <p className="text-center py-8 text-slate-500">No transactions yet</p>
                  ) : (
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">Date</th>
                          <th className="px-3 py-2 text-left">Type</th>
                          <th className="px-3 py-2 text-right">Amount</th>
                          <th className="px-3 py-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {transactions.map((txn, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{moment(txn.transaction_date).format('MMM DD, YYYY')}</td>
                            <td className="px-3 py-2">
                              <span className={`inline-flex items-center gap-1 ${txn.transaction_type === 'Deposit' ? 'text-emerald-600' : 'text-amber-600'}`}>
                                {txn.transaction_type === 'Deposit' ? <ArrowDownCircle className="w-3 h-3" /> : <ArrowUpCircle className="w-3 h-3" />}
                                {txn.transaction_type}
                              </span>
                            </td>
                            <td className={`px-3 py-2 text-right font-medium ${txn.transaction_type === 'Deposit' ? 'text-emerald-600' : 'text-red-600'}`}>
                              {txn.transaction_type === 'Deposit' ? '+' : '-'}₱{(txn.amount || 0).toLocaleString()}
                            </td>
                            <td className="px-3 py-2 text-right">₱{(txn.running_balance || 0).toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            <Button onClick={() => { setShowViewModal(false); openTransactionModal(selectedAccount, 'Deposit'); }} className="bg-emerald-600 hover:bg-emerald-700">
              <ArrowDownCircle className="w-4 h-4 mr-2" />
              Deposit
            </Button>
            <Button onClick={() => { setShowViewModal(false); openTransactionModal(selectedAccount, 'Withdrawal'); }} className="bg-amber-600 hover:bg-amber-700">
              <ArrowUpCircle className="w-4 h-4 mr-2" />
              Withdraw
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}