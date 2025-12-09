import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  User, 
  Wallet, 
  PiggyBank, 
  Receipt, 
  FileText,
  Calendar,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import StatusBadge from '@/components/common/StatusBadge';
import moment from 'moment';

export default function MemberPortal() {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [memberProfile, setMemberProfile] = useState(null);
  const [loans, setLoans] = useState([]);
  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    loadMemberData();
  }, []);

  const loadMemberData = async () => {
    try {
      setIsLoading(true);
      const currentUser = await base44.auth.me();
      setUser(currentUser);

      // Find member profile by email
      const members = await base44.entities.Member.filter({ email: currentUser.email });
      if (members.length > 0) {
        const member = members[0];
        setMemberProfile(member);

        // Load member's loans, savings, and transactions
        const [memberLoans, memberSavings, memberTransactions] = await Promise.all([
          base44.entities.Loan.filter({ member_id: member.id }),
          base44.entities.SavingsAccount.filter({ member_id: member.id }),
          base44.entities.Transaction.filter({ member_id: member.id }, '-created_date', 50)
        ]);

        setLoans(memberLoans);
        setSavings(memberSavings);
        setTransactions(memberTransactions);
      }
    } catch (error) {
      console.error('Error loading member data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
          <Skeleton className="h-24" />
        </div>
      </div>
    );
  }

  if (!memberProfile) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-8 text-center">
          <AlertCircle className="w-12 h-12 text-amber-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Member Profile Not Found</h3>
          <p className="text-slate-500">Your account is not linked to a member profile. Please contact the cooperative administrator.</p>
        </CardContent>
      </Card>
    );
  }

  const activeLoans = loans.filter(l => ['Active', 'Disbursed'].includes(l.status));
  const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0);
  const totalSavings = savings.reduce((sum, s) => sum + (s.balance || 0), 0);

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold">
              {memberProfile.first_name?.[0]}{memberProfile.last_name?.[0]}
            </span>
          </div>
          <div>
            <h1 className="text-2xl font-bold">
              Welcome, {memberProfile.first_name}!
            </h1>
            <p className="text-emerald-100">Member since {moment(memberProfile.membership_date).format('MMMM YYYY')}</p>
            <Badge className="mt-2 bg-white/20 text-white border-0">
              {memberProfile.member_code}
            </Badge>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Share Capital</p>
                <p className="text-xl font-bold text-emerald-600">₱{(memberProfile.share_capital || 0).toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <PiggyBank className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Savings</p>
                <p className="text-xl font-bold text-blue-600">₱{totalSavings.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Active Loans</p>
                <p className="text-xl font-bold text-amber-600">{activeLoans.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-red-50 rounded-lg">
                <Receipt className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Outstanding Balance</p>
                <p className="text-xl font-bold text-red-600">₱{totalOutstanding.toLocaleString()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs for different sections */}
      <Tabs defaultValue="loans" className="space-y-4">
        <TabsList>
          <TabsTrigger value="loans">My Loans</TabsTrigger>
          <TabsTrigger value="savings">My Savings</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="profile">My Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="loans" className="space-y-4">
          {loans.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Wallet className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">You don't have any loans yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {loans.map(loan => (
                <Card key={loan.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-mono text-sm text-slate-500">{loan.loan_number}</p>
                        <h3 className="font-semibold text-slate-900">{loan.loan_type_name}</h3>
                        <p className="text-sm text-slate-500">{loan.purpose}</p>
                      </div>
                      <StatusBadge status={loan.status} />
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-slate-500">Principal</p>
                        <p className="font-medium">₱{(loan.principal_amount || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Monthly Payment</p>
                        <p className="font-medium">₱{(loan.monthly_amortization || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Outstanding</p>
                        <p className="font-medium text-red-600">₱{(loan.outstanding_balance || 0).toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Maturity Date</p>
                        <p className="font-medium">{loan.maturity_date ? moment(loan.maturity_date).format('MMM DD, YYYY') : '-'}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="savings" className="space-y-4">
          {savings.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <PiggyBank className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">You don't have any savings accounts yet.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {savings.map(account => (
                <Card key={account.id} className="border-0 shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="font-mono text-sm text-slate-500">{account.account_number}</p>
                        <h3 className="font-semibold text-slate-900">{account.account_type}</h3>
                      </div>
                      <StatusBadge status={account.status} />
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-sm text-emerald-600">Current Balance</p>
                      <p className="text-2xl font-bold text-emerald-700">₱{(account.balance || 0).toLocaleString()}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div>
                        <p className="text-xs text-slate-500">Interest Rate</p>
                        <p className="font-medium">{account.interest_rate}% p.a.</p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-500">Interest Earned</p>
                        <p className="font-medium text-emerald-600">₱{(account.total_interest_earned || 0).toLocaleString()}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="transactions" className="space-y-4">
          {transactions.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <Receipt className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                <p className="text-slate-500">No transactions found.</p>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y">
                  {transactions.map(txn => (
                    <div key={txn.id} className="p-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${
                          txn.transaction_type === 'Deposit' || txn.transaction_type === 'Loan Payment' 
                            ? 'bg-emerald-50' 
                            : 'bg-amber-50'
                        }`}>
                          {txn.transaction_type === 'Deposit' || txn.transaction_type === 'Loan Payment' 
                            ? <TrendingUp className="w-4 h-4 text-emerald-600" />
                            : <Receipt className="w-4 h-4 text-amber-600" />
                          }
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{txn.transaction_type}</p>
                          <p className="text-sm text-slate-500">{moment(txn.transaction_date).format('MMM DD, YYYY')}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-semibold ${
                          txn.transaction_type === 'Deposit' || txn.transaction_type === 'Loan Payment'
                            ? 'text-emerald-600'
                            : 'text-red-600'
                        }`}>
                          {txn.transaction_type === 'Deposit' || txn.transaction_type === 'Loan Payment' ? '+' : '-'}
                          ₱{(txn.amount || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-slate-500">{txn.account_number}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="profile" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-medium">{memberProfile.first_name} {memberProfile.middle_name} {memberProfile.last_name} {memberProfile.suffix}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Member Code</p>
                  <p className="font-medium font-mono">{memberProfile.member_code}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{memberProfile.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mobile Number</p>
                  <p className="font-medium">{memberProfile.mobile_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-medium">{memberProfile.date_of_birth ? moment(memberProfile.date_of_birth).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Civil Status</p>
                  <p className="font-medium">{memberProfile.civil_status || '-'}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-sm text-slate-500">Address</p>
                  <p className="font-medium">
                    {[memberProfile.address, memberProfile.barangay, memberProfile.city_municipality, memberProfile.province].filter(Boolean).join(', ') || '-'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Membership Type</p>
                  <p className="font-medium">{memberProfile.membership_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Membership Date</p>
                  <p className="font-medium">{memberProfile.membership_date ? moment(memberProfile.membership_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}