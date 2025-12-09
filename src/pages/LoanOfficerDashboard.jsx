import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Wallet, 
  Clock, 
  CheckCircle, 
  XCircle,
  Eye,
  Brain,
  TrendingUp,
  AlertTriangle,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import StatusBadge from '@/components/common/StatusBadge';
import LoanEligibilityAnalyzer from '@/components/loans/LoanEligibilityAnalyzer';
import moment from 'moment';

export default function LoanOfficerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    pending: 0,
    approved: 0,
    active: 0,
    thisMonth: 0
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loansData, membersData, savingsData, transactionsData] = await Promise.all([
        base44.entities.Loan.list('-created_date', 500),
        base44.entities.Member.filter({ status: 'Active' }),
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.Transaction.list('-created_date', 500)
      ]);
      
      setLoans(loansData);
      setMembers(membersData);
      setSavings(savingsData);
      setTransactions(transactionsData);

      // Calculate stats
      const thisMonth = moment().startOf('month');
      setStats({
        pending: loansData.filter(l => l.status === 'Pending').length,
        approved: loansData.filter(l => l.status === 'Approved').length,
        active: loansData.filter(l => ['Active', 'Disbursed'].includes(l.status)).length,
        thisMonth: loansData.filter(l => moment(l.application_date).isSameOrAfter(thisMonth)).length
      });
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const pendingLoans = loans.filter(l => l.status === 'Pending');
  const recentLoans = loans.slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loan Officer Dashboard</h1>
          <p className="text-slate-500">Review and process loan applications</p>
        </div>
        <Link to={createPageUrl('Loans')}>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <FileText className="w-4 h-4 mr-2" />
            View All Loans
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Clock className="w-8 h-8 text-amber-600" />
              <div>
                <p className="text-sm text-amber-600">Pending Review</p>
                <p className="text-2xl font-bold text-amber-700">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-emerald-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-8 h-8 text-emerald-600" />
              <div>
                <p className="text-sm text-emerald-600">Approved</p>
                <p className="text-2xl font-bold text-emerald-700">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-sm text-blue-600">Active Loans</p>
                <p className="text-2xl font-bold text-blue-700">{stats.active}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-purple-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Wallet className="w-8 h-8 text-purple-600" />
              <div>
                <p className="text-sm text-purple-600">This Month</p>
                <p className="text-2xl font-bold text-purple-700">{stats.thisMonth}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert for pending loans */}
      {stats.pending > 0 && (
        <Card className="border-amber-200 bg-amber-50 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center gap-4">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
            <div className="flex-1">
              <p className="font-semibold text-amber-900">{stats.pending} loan application(s) require your review</p>
              <p className="text-sm text-amber-700">Please review and process pending applications</p>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Applications ({pendingLoans.length})</TabsTrigger>
          <TabsTrigger value="analyzer">AI Analyzer</TabsTrigger>
          <TabsTrigger value="recent">Recent Loans</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {pendingLoans.length === 0 ? (
            <Card className="border-0 shadow-sm">
              <CardContent className="p-8 text-center">
                <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending loan applications</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {pendingLoans.map(loan => (
                <Card key={loan.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                          <Wallet className="w-6 h-6 text-amber-600" />
                        </div>
                        <div>
                          <p className="font-mono text-sm text-slate-500">{loan.loan_number}</p>
                          <h3 className="font-semibold text-slate-900">{loan.member_name}</h3>
                          <p className="text-sm text-slate-500">{loan.loan_type_name}</p>
                          <p className="text-sm text-slate-500 mt-1">Purpose: {loan.purpose || 'Not specified'}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-slate-900">₱{(loan.principal_amount || 0).toLocaleString()}</p>
                        <p className="text-sm text-slate-500">{loan.term_months} months</p>
                        <p className="text-xs text-slate-400 mt-1">Applied: {moment(loan.application_date).format('MMM DD, YYYY')}</p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t">
                      <div className="flex gap-4 text-sm">
                        <div>
                          <span className="text-slate-500">Monthly:</span>
                          <span className="font-medium ml-1">₱{(loan.monthly_amortization || 0).toLocaleString()}</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Interest:</span>
                          <span className="font-medium ml-1">{loan.interest_rate}%</span>
                        </div>
                        <div>
                          <span className="text-slate-500">Co-maker:</span>
                          <span className="font-medium ml-1">{loan.comaker_name || 'None'}</span>
                        </div>
                      </div>
                      <Link to={createPageUrl('Loans')}>
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Review
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="analyzer">
          <LoanEligibilityAnalyzer 
            members={members}
            loans={loans}
            savings={savings}
            transactions={transactions}
          />
        </TabsContent>

        <TabsContent value="recent" className="space-y-4">
          <div className="space-y-3">
            {recentLoans.map(loan => (
              <Card key={loan.id} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{loan.member_name}</p>
                        <p className="text-sm text-slate-500">{loan.loan_type_name} • {loan.loan_number}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">₱{(loan.principal_amount || 0).toLocaleString()}</p>
                      <StatusBadge status={loan.status} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}