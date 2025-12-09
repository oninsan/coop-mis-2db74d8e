import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Wallet, 
  PiggyBank, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3,
  ArrowRight,
  Shield
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import KPICard from '@/components/dashboard/KPICard';
import LoanPortfolioChart from '@/components/dashboard/LoanPortfolioChart';
import SavingsChart from '@/components/dashboard/SavingsChart';
import StatusBadge from '@/components/common/StatusBadge';
import moment from 'moment';

export default function ManagerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalSavings: 0,
    loanPortfolio: 0,
    pendingLoans: 0,
    collectionRate: 0
  });
  const [pendingLoans, setPendingLoans] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [members, loans, savings, transactions] = await Promise.all([
        base44.entities.Member.list('-created_date', 500),
        base44.entities.Loan.list('-created_date', 500),
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.Transaction.list('-created_date', 20)
      ]);

      const activeMembers = members.filter(m => m.status === 'Active').length;
      const activeLoans = loans.filter(l => ['Active', 'Disbursed'].includes(l.status));
      const pendingLoansList = loans.filter(l => l.status === 'Pending');
      const paidLoans = loans.filter(l => l.status === 'Paid').length;
      const totalLoans = loans.filter(l => ['Active', 'Disbursed', 'Paid'].includes(l.status)).length;
      const totalSavingsBalance = savings.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      const loanPortfolio = activeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);

      setStats({
        totalMembers: activeMembers,
        activeLoans: activeLoans.length,
        totalSavings: totalSavingsBalance,
        loanPortfolio: loanPortfolio,
        pendingLoans: pendingLoansList.length,
        collectionRate: totalLoans > 0 ? Math.round((paidLoans / totalLoans) * 100) : 0
      });

      setPendingLoans(pendingLoansList.slice(0, 5));

      // Build activity feed
      const activities = transactions.slice(0, 8).map(txn => ({
        type: txn.transaction_type,
        title: txn.member_name,
        amount: txn.amount,
        date: txn.created_date
      }));
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveLoan = async (loan) => {
    try {
      await base44.entities.Loan.update(loan.id, {
        status: 'Approved',
        approval_date: new Date().toISOString().split('T')[0]
      });
      loadData();
    } catch (error) {
      console.error('Error approving loan:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Manager Dashboard</h1>
          <p className="text-slate-500">Overview of cooperative operations and approvals</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('Reports')}>
            <Button variant="outline">
              <BarChart3 className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
          <Link to={createPageUrl('AuditLogs')}>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Audit Logs
            </Button>
          </Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          iconColor="emerald"
        />
        <KPICard
          title="Active Loans"
          value={stats.activeLoans}
          icon={Wallet}
          iconColor="blue"
        />
        <KPICard
          title="Total Savings"
          value={stats.totalSavings}
          prefix="₱"
          icon={PiggyBank}
          iconColor="purple"
        />
        <KPICard
          title="Loan Portfolio"
          value={stats.loanPortfolio}
          prefix="₱"
          icon={TrendingUp}
          iconColor="amber"
        />
      </div>

      {/* Alerts & Pending Approvals */}
      {stats.pendingLoans > 0 && (
        <Card className="border-amber-200 bg-amber-50 border-0 shadow-sm">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-100 rounded-xl">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <div>
                <p className="font-semibold text-amber-900">{stats.pendingLoans} Loan(s) Pending Approval</p>
                <p className="text-sm text-amber-700">Review and approve loan applications</p>
              </div>
            </div>
            <Link to={createPageUrl('Loans')}>
              <Button className="bg-amber-600 hover:bg-amber-700">
                Review Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pending Approvals */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg">Pending Loan Approvals</CardTitle>
            <Link to={createPageUrl('Loans')}>
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {pendingLoans.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 text-emerald-300 mx-auto mb-3" />
                <p className="text-slate-500">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingLoans.map(loan => (
                  <div key={loan.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-amber-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{loan.member_name}</p>
                        <p className="text-sm text-slate-500">{loan.loan_type_name}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-slate-900">₱{(loan.principal_amount || 0).toLocaleString()}</p>
                      <p className="text-xs text-slate-500">{loan.term_months} months</p>
                    </div>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        className="bg-emerald-600 hover:bg-emerald-700"
                        onClick={() => handleApproveLoan(loan)}
                      >
                        <CheckCircle className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Performance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Collection Rate</span>
                <span className="text-sm font-medium">{stats.collectionRate}%</span>
              </div>
              <Progress value={stats.collectionRate} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Member Growth</span>
                <span className="text-sm font-medium text-emerald-600">+12%</span>
              </div>
              <Progress value={72} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm text-slate-500">Loan Utilization</span>
                <span className="text-sm font-medium">85%</span>
              </div>
              <Progress value={85} className="h-2" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsChart />
        <LoanPortfolioChart />
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link to={createPageUrl('Members')}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Users className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="font-medium">Members</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('Loans')}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <Wallet className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="font-medium">Loans</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('Savings')}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <PiggyBank className="w-8 h-8 text-purple-600 mx-auto mb-2" />
              <p className="font-medium">Savings</p>
            </CardContent>
          </Card>
        </Link>
        <Link to={createPageUrl('Settings')}>
          <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-4 text-center">
              <BarChart3 className="w-8 h-8 text-amber-600 mx-auto mb-2" />
              <p className="font-medium">Settings</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}