import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Users, 
  Wallet, 
  PiggyBank, 
  TrendingUp,
  ArrowRight,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import KPICard from '@/components/dashboard/KPICard';
import RecentActivity from '@/components/dashboard/RecentActivity';
import LoanPortfolioChart from '@/components/dashboard/LoanPortfolioChart';
import SavingsChart from '@/components/dashboard/SavingsChart';
import StatusBadge from '@/components/common/StatusBadge';

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    activeLoans: 0,
    totalSavings: 0,
    loanPortfolio: 0,
    pendingLoans: 0,
    overdueLoans: 0
  });
  const [recentMembers, setRecentMembers] = useState([]);
  const [recentLoans, setRecentLoans] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load all data in parallel
      const [members, loans, savings, transactions] = await Promise.all([
        base44.entities.Member.list('-created_date', 100),
        base44.entities.Loan.list('-created_date', 100),
        base44.entities.SavingsAccount.list('-created_date', 100),
        base44.entities.Transaction.list('-created_date', 20)
      ]);

      // Calculate stats
      const activeMembers = members.filter(m => m.status === 'Active').length;
      const activeLoans = loans.filter(l => ['Active', 'Disbursed'].includes(l.status));
      const pendingLoans = loans.filter(l => l.status === 'Pending').length;
      const totalSavingsBalance = savings.reduce((sum, acc) => sum + (acc.balance || 0), 0);
      const loanPortfolio = activeLoans.reduce((sum, loan) => sum + (loan.outstanding_balance || 0), 0);

      setStats({
        totalMembers: activeMembers,
        activeLoans: activeLoans.length,
        totalSavings: totalSavingsBalance,
        loanPortfolio: loanPortfolio,
        pendingLoans: pendingLoans,
        overdueLoans: loans.filter(l => l.status === 'Defaulted').length
      });

      setRecentMembers(members.slice(0, 5));
      setRecentLoans(loans.slice(0, 5));

      // Build recent activity from transactions
      const activities = transactions.slice(0, 8).map(txn => ({
        type: txn.transaction_type === 'Deposit' ? 'deposit' : 
              txn.transaction_type === 'Withdrawal' ? 'withdrawal' :
              txn.transaction_type === 'Loan Payment' ? 'loan_payment' :
              txn.transaction_type === 'Loan Disbursement' ? 'loan_application' : 'deposit',
        title: txn.transaction_type,
        description: txn.member_name || 'Member',
        amount: txn.amount,
        date: txn.created_date
      }));
      setRecentActivity(activities);

    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} className="border-0 shadow-sm">
              <CardContent className="p-6">
                <Skeleton className="h-4 w-24 mb-2" />
                <Skeleton className="h-8 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Members"
          value={stats.totalMembers}
          icon={Users}
          iconColor="emerald"
          change="+12%"
          changeType="positive"
        />
        <KPICard
          title="Active Loans"
          value={stats.activeLoans}
          icon={Wallet}
          iconColor="blue"
          change="+5%"
          changeType="positive"
        />
        <KPICard
          title="Total Savings"
          value={stats.totalSavings}
          prefix="₱"
          icon={PiggyBank}
          iconColor="purple"
          change="+8%"
          changeType="positive"
        />
        <KPICard
          title="Loan Portfolio"
          value={stats.loanPortfolio}
          prefix="₱"
          icon={TrendingUp}
          iconColor="amber"
          change="+3%"
          changeType="positive"
        />
      </div>

      {/* Alerts */}
      {(stats.pendingLoans > 0 || stats.overdueLoans > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {stats.pendingLoans > 0 && (
            <Card className="border-amber-200 bg-amber-50 border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-amber-100 rounded-xl">
                  <Clock className="w-6 h-6 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">{stats.pendingLoans} Pending Loan Applications</p>
                  <p className="text-sm text-amber-700">Awaiting review and approval</p>
                </div>
                <Link to={createPageUrl('Loans')}>
                  <Button variant="outline" size="sm" className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    Review
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
          {stats.overdueLoans > 0 && (
            <Card className="border-red-200 bg-red-50 border-0 shadow-sm">
              <CardContent className="p-4 flex items-center gap-4">
                <div className="p-3 bg-red-100 rounded-xl">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-red-900">{stats.overdueLoans} Overdue Loans</p>
                  <p className="text-sm text-red-700">Require immediate attention</p>
                </div>
                <Link to={createPageUrl('Loans')}>
                  <Button variant="outline" size="sm" className="border-red-300 text-red-700 hover:bg-red-100">
                    View
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SavingsChart />
        <LoanPortfolioChart />
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1">
          <RecentActivity activities={recentActivity} />
        </div>

        {/* Recent Loans */}
        <Card className="border-0 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold text-slate-900">Recent Loan Applications</CardTitle>
            <Link to={createPageUrl('Loans')}>
              <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentLoans.length === 0 ? (
                <p className="text-center py-8 text-slate-500">No loan applications yet</p>
              ) : (
                recentLoans.map((loan) => (
                  <div key={loan.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 hover:bg-slate-100 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Wallet className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{loan.member_name || 'Member'}</p>
                        <p className="text-sm text-slate-500">{loan.loan_type_name || 'Loan'}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-slate-900">₱{(loan.principal_amount || 0).toLocaleString()}</p>
                      <StatusBadge status={loan.status} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Members */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-lg font-semibold text-slate-900">New Members</CardTitle>
          <Link to={createPageUrl('Members')}>
            <Button variant="ghost" size="sm" className="text-emerald-600 hover:text-emerald-700">
              View All
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {recentMembers.length === 0 ? (
              <p className="col-span-full text-center py-8 text-slate-500">No members registered yet</p>
            ) : (
              recentMembers.map((member) => (
                <div key={member.id} className="p-4 rounded-xl bg-slate-50 text-center hover:bg-slate-100 transition-colors">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-emerald-100 flex items-center justify-center">
                    <span className="text-lg font-semibold text-emerald-600">
                      {member.first_name?.[0]}{member.last_name?.[0]}
                    </span>
                  </div>
                  <p className="font-medium text-slate-900 truncate">
                    {member.first_name} {member.last_name}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{member.member_code || 'New Member'}</p>
                  <StatusBadge status={member.status} />
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}