import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  ArrowDownCircle, 
  ArrowUpCircle, 
  Receipt, 
  Users,
  Search,
  Loader2,
  Clock
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
import StatusBadge from '@/components/common/StatusBadge';
import moment from 'moment';

export default function TellerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [savings, setSavings] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState(null);
  const [memberAccounts, setMemberAccounts] = useState([]);
  const [showTransactionModal, setShowTransactionModal] = useState(false);
  const [transactionType, setTransactionType] = useState('Deposit');
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [transactionData, setTransactionData] = useState({
    amount: '',
    description: '',
    payment_method: 'Cash'
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [todayStats, setTodayStats] = useState({ deposits: 0, withdrawals: 0, count: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [membersData, savingsData, transactionsData] = await Promise.all([
        base44.entities.Member.filter({ status: 'Active' }),
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.Transaction.list('-created_date', 50)
      ]);
      setMembers(membersData);
      setSavings(savingsData);
      setRecentTransactions(transactionsData);

      // Calculate today's stats
      const today = moment().format('YYYY-MM-DD');
      const todayTxns = transactionsData.filter(t => t.transaction_date === today);
      setTodayStats({
        deposits: todayTxns.filter(t => t.transaction_type === 'Deposit').reduce((sum, t) => sum + (t.amount || 0), 0),
        withdrawals: todayTxns.filter(t => t.transaction_type === 'Withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0),
        count: todayTxns.length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMemberSearch = (term) => {
    setSearchTerm(term);
    if (term.length >= 2) {
      const filtered = members.filter(m => 
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(term.toLowerCase()) ||
        m.member_code?.toLowerCase().includes(term.toLowerCase())
      );
      if (filtered.length === 1) {
        selectMember(filtered[0]);
      }
    } else {
      setSelectedMember(null);
      setMemberAccounts([]);
    }
  };

  const selectMember = (member) => {
    setSelectedMember(member);
    const accounts = savings.filter(s => s.member_id === member.id);
    setMemberAccounts(accounts);
  };

  const openTransaction = (account, type) => {
    setSelectedAccount(account);
    setTransactionType(type);
    setTransactionData({ amount: '', description: '', payment_method: 'Cash' });
    setShowTransactionModal(true);
  };

  const handleTransaction = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    try {
      const amount = parseFloat(transactionData.amount);
      const currentBalance = selectedAccount.balance || 0;
      const newBalance = transactionType === 'Deposit' 
        ? currentBalance + amount 
        : currentBalance - amount;

      if (transactionType === 'Withdrawal' && newBalance < (selectedAccount.minimum_balance || 0)) {
        alert('Insufficient balance. Minimum balance required: ₱' + (selectedAccount.minimum_balance || 0).toLocaleString());
        setIsProcessing(false);
        return;
      }

      // Create transaction
      await base44.entities.Transaction.create({
        transaction_number: `TXN-${Date.now()}`,
        transaction_type: transactionType,
        member_id: selectedMember.id,
        member_name: `${selectedMember.first_name} ${selectedMember.last_name}`,
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
      loadData();
      selectMember(selectedMember); // Refresh member accounts
    } catch (error) {
      console.error('Error processing transaction:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const filteredMembers = searchTerm.length >= 2 
    ? members.filter(m => 
        `${m.first_name} ${m.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.member_code?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Teller Dashboard</h1>
        <p className="text-slate-500">Process deposits, withdrawals, and member transactions</p>
      </div>

      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowDownCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-emerald-600">Today's Deposits</p>
                <p className="text-2xl font-bold text-emerald-700">₱{todayStats.deposits.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <ArrowUpCircle className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-amber-600">Today's Withdrawals</p>
                <p className="text-2xl font-bold text-amber-700">₱{todayStats.withdrawals.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Receipt className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Transactions Today</p>
                <p className="text-2xl font-bold text-blue-700">{todayStats.count}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">Current Time</p>
                <p className="text-2xl font-bold text-purple-700">{moment().format('hh:mm A')}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Transaction Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Member Search & Accounts */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Quick Transaction</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search member by name or code..."
                value={searchTerm}
                onChange={(e) => handleMemberSearch(e.target.value)}
                className="pl-9"
              />
            </div>

            {/* Search Results */}
            {filteredMembers.length > 0 && !selectedMember && (
              <div className="border rounded-lg divide-y max-h-48 overflow-y-auto">
                {filteredMembers.map(member => (
                  <div 
                    key={member.id}
                    className="p-3 hover:bg-slate-50 cursor-pointer"
                    onClick={() => selectMember(member)}
                  >
                    <p className="font-medium">{member.first_name} {member.last_name}</p>
                    <p className="text-sm text-slate-500">{member.member_code}</p>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Member */}
            {selectedMember && (
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                      <span className="font-bold text-emerald-600">
                        {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold">{selectedMember.first_name} {selectedMember.last_name}</p>
                      <p className="text-sm text-slate-500">{selectedMember.member_code}</p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => { setSelectedMember(null); setSearchTerm(''); }}>
                    Clear
                  </Button>
                </div>

                {/* Member Accounts */}
                {memberAccounts.length === 0 ? (
                  <p className="text-center text-slate-500 py-4">No savings accounts found</p>
                ) : (
                  <div className="space-y-3">
                    {memberAccounts.map(account => (
                      <div key={account.id} className="p-3 bg-white rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="font-mono text-sm">{account.account_number}</p>
                            <p className="text-sm text-slate-500">{account.account_type}</p>
                          </div>
                          <p className="text-lg font-bold text-emerald-600">₱{(account.balance || 0).toLocaleString()}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button 
                            size="sm" 
                            className="flex-1 bg-emerald-600 hover:bg-emerald-700"
                            onClick={() => openTransaction(account, 'Deposit')}
                          >
                            <ArrowDownCircle className="w-4 h-4 mr-1" />
                            Deposit
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            className="flex-1 border-amber-300 text-amber-600 hover:bg-amber-50"
                            onClick={() => openTransaction(account, 'Withdrawal')}
                          >
                            <ArrowUpCircle className="w-4 h-4 mr-1" />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentTransactions.slice(0, 10).map(txn => (
                <div key={txn.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      txn.transaction_type === 'Deposit' ? 'bg-emerald-100' : 'bg-amber-100'
                    }`}>
                      {txn.transaction_type === 'Deposit' 
                        ? <ArrowDownCircle className="w-4 h-4 text-emerald-600" />
                        : <ArrowUpCircle className="w-4 h-4 text-amber-600" />
                      }
                    </div>
                    <div>
                      <p className="font-medium text-sm">{txn.member_name}</p>
                      <p className="text-xs text-slate-500">{txn.transaction_type} • {moment(txn.created_date).fromNow()}</p>
                    </div>
                  </div>
                  <p className={`font-semibold ${
                    txn.transaction_type === 'Deposit' ? 'text-emerald-600' : 'text-amber-600'
                  }`}>
                    {txn.transaction_type === 'Deposit' ? '+' : '-'}₱{(txn.amount || 0).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

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
                  autoFocus
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
                  placeholder="Optional"
                />
              </div>
              
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowTransactionModal(false)}>Cancel</Button>
                <Button 
                  type="submit" 
                  disabled={isProcessing}
                  className={transactionType === 'Deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-amber-600 hover:bg-amber-700'}
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                  Process {transactionType}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}