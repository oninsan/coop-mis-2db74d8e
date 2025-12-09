import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  FileText,
  Download,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Wallet,
  PiggyBank,
  Calendar,
  Printer
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RechartsPie, Pie, Cell, Legend, LineChart, Line } from 'recharts';
import moment from 'moment';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Reports() {
  const [isLoading, setIsLoading] = useState(true);
  const [members, setMembers] = useState([]);
  const [loans, setLoans] = useState([]);
  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [reportPeriod, setReportPeriod] = useState('monthly');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [membersData, loansData, savingsData, transactionsData] = await Promise.all([
        base44.entities.Member.list('-created_date', 1000),
        base44.entities.Loan.list('-created_date', 1000),
        base44.entities.SavingsAccount.list('-created_date', 1000),
        base44.entities.Transaction.list('-created_date', 1000)
      ]);
      setMembers(membersData);
      setLoans(loansData);
      setSavings(savingsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate membership statistics
  const membershipStats = {
    total: members.length,
    active: members.filter(m => m.status === 'Active').length,
    regular: members.filter(m => m.membership_type === 'Regular').length,
    associate: members.filter(m => m.membership_type === 'Associate').length,
    newThisMonth: members.filter(m => moment(m.created_date).isSame(moment(), 'month')).length
  };

  // Calculate loan statistics
  const loanStats = {
    total: loans.length,
    active: loans.filter(l => ['Active', 'Disbursed'].includes(l.status)).length,
    pending: loans.filter(l => l.status === 'Pending').length,
    paid: loans.filter(l => l.status === 'Paid').length,
    defaulted: loans.filter(l => l.status === 'Defaulted').length,
    totalPortfolio: loans.filter(l => ['Active', 'Disbursed'].includes(l.status)).reduce((sum, l) => sum + (l.outstanding_balance || 0), 0),
    totalDisbursed: loans.filter(l => ['Active', 'Disbursed', 'Paid'].includes(l.status)).reduce((sum, l) => sum + (l.principal_amount || 0), 0)
  };

  // Calculate savings statistics
  const savingsStats = {
    totalAccounts: savings.length,
    activeAccounts: savings.filter(s => s.status === 'Active').length,
    totalBalance: savings.reduce((sum, s) => sum + (s.balance || 0), 0),
    totalDeposits: savings.reduce((sum, s) => sum + (s.total_deposits || 0), 0),
    totalWithdrawals: savings.reduce((sum, s) => sum + (s.total_withdrawals || 0), 0)
  };

  // Loan portfolio by type
  const loansByType = loans.reduce((acc, loan) => {
    const type = loan.loan_type_name || 'Other';
    if (!acc[type]) acc[type] = { count: 0, amount: 0 };
    acc[type].count++;
    acc[type].amount += loan.principal_amount || 0;
    return acc;
  }, {});

  const loanTypeChartData = Object.entries(loansByType).map(([name, data]) => ({
    name,
    value: data.count,
    amount: data.amount
  }));

  // Monthly transaction trends
  const monthlyTransactions = [];
  for (let i = 5; i >= 0; i--) {
    const month = moment().subtract(i, 'months');
    const monthTransactions = transactions.filter(t => moment(t.transaction_date).isSame(month, 'month'));
    monthlyTransactions.push({
      month: month.format('MMM'),
      deposits: monthTransactions.filter(t => t.transaction_type === 'Deposit').reduce((sum, t) => sum + (t.amount || 0), 0),
      withdrawals: monthTransactions.filter(t => t.transaction_type === 'Withdrawal').reduce((sum, t) => sum + (t.amount || 0), 0),
      loanPayments: monthTransactions.filter(t => t.transaction_type === 'Loan Payment').reduce((sum, t) => sum + (t.amount || 0), 0)
    });
  }

  // Member growth data
  const memberGrowth = [];
  for (let i = 5; i >= 0; i--) {
    const month = moment().subtract(i, 'months');
    const newMembers = members.filter(m => moment(m.created_date).isSame(month, 'month')).length;
    memberGrowth.push({
      month: month.format('MMM'),
      new: newMembers,
      total: members.filter(m => moment(m.created_date).isSameOrBefore(month, 'month')).length
    });
  }

  const reportCards = [
    {
      title: 'Membership Report',
      icon: Users,
      description: 'Member demographics and growth analysis',
      color: 'emerald'
    },
    {
      title: 'Loan Portfolio Report',
      icon: Wallet,
      description: 'Loan performance and collection status',
      color: 'blue'
    },
    {
      title: 'Savings Report',
      icon: PiggyBank,
      description: 'Savings mobilization and interest analysis',
      color: 'purple'
    },
    {
      title: 'Financial Statements',
      icon: BarChart3,
      description: 'Balance sheet and income statement',
      color: 'amber'
    },
    {
      title: 'CDA Compliance Report',
      icon: FileText,
      description: 'Regulatory compliance and submissions',
      color: 'red'
    },
    {
      title: 'Transaction Summary',
      icon: TrendingUp,
      description: 'Daily, weekly, and monthly transactions',
      color: 'indigo'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reports & Analytics</h1>
          <p className="text-slate-500">Generate and view comprehensive cooperative reports</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[2024, 2023, 2022].map(y => (
                <SelectItem key={y} value={y.toString()}>{y}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button className="bg-emerald-600 hover:bg-emerald-700">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Report Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {reportCards.map((report, index) => (
          <Card key={index} className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-xl bg-${report.color}-50`}>
                  <report.icon className={`w-6 h-6 text-${report.color}-600`} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{report.title}</h3>
                  <p className="text-sm text-slate-500 mt-1">{report.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Dashboard */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="membership">Membership</TabsTrigger>
          <TabsTrigger value="loans">Loans</TabsTrigger>
          <TabsTrigger value="savings">Savings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-emerald-50 rounded-lg">
                    <Users className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Members</p>
                    <p className="text-2xl font-bold text-slate-900">{membershipStats.total}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Wallet className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Loan Portfolio</p>
                    <p className="text-2xl font-bold text-slate-900">₱{(loanStats.totalPortfolio / 1000000).toFixed(2)}M</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-50 rounded-lg">
                    <PiggyBank className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Total Savings</p>
                    <p className="text-2xl font-bold text-slate-900">₱{(savingsStats.totalBalance / 1000000).toFixed(2)}M</p>
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
                    <p className="text-sm text-slate-500">Collection Rate</p>
                    <p className="text-2xl font-bold text-slate-900">{loanStats.total > 0 ? ((loanStats.paid / loanStats.total) * 100).toFixed(1) : 0}%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Monthly Transaction Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTransactions}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} tickFormatter={(v) => `₱${(v/1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value) => `₱${value.toLocaleString()}`} />
                      <Legend />
                      <Bar dataKey="deposits" name="Deposits" fill="#10b981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="withdrawals" name="Withdrawals" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="loanPayments" name="Loan Payments" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="text-lg">Loan Portfolio by Type</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={loanTypeChartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {loanTypeChartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value, name, props) => [`${value} loans (₱${props.payload.amount.toLocaleString()})`, name]} />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Member Growth */}
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Member Growth Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={memberGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="total" name="Total Members" stroke="#10b981" strokeWidth={2} dot={{ fill: '#10b981' }} />
                    <Line type="monotone" dataKey="new" name="New Members" stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="membership" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Membership Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Members</span>
                    <span className="font-medium">{membershipStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Members</span>
                    <span className="font-medium text-emerald-600">{membershipStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Regular Members</span>
                    <span className="font-medium">{membershipStats.regular}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Associate Members</span>
                    <span className="font-medium">{membershipStats.associate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">New This Month</span>
                    <span className="font-medium text-blue-600">{membershipStats.newThisMonth}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loans" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Loan Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Loans</span>
                    <span className="font-medium">{loanStats.total}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Loans</span>
                    <span className="font-medium text-blue-600">{loanStats.active}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Pending Approval</span>
                    <span className="font-medium text-amber-600">{loanStats.pending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Fully Paid</span>
                    <span className="font-medium text-emerald-600">{loanStats.paid}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Defaulted</span>
                    <span className="font-medium text-red-600">{loanStats.defaulted}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Portfolio Value</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outstanding Balance</span>
                    <span className="font-medium">₱{loanStats.totalPortfolio.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Disbursed</span>
                    <span className="font-medium">₱{loanStats.totalDisbursed.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="savings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="border-0 shadow-sm">
              <CardContent className="p-6">
                <h3 className="font-semibold text-slate-900 mb-4">Savings Summary</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Accounts</span>
                    <span className="font-medium">{savingsStats.totalAccounts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Accounts</span>
                    <span className="font-medium text-emerald-600">{savingsStats.activeAccounts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Balance</span>
                    <span className="font-medium">₱{savingsStats.totalBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Deposits</span>
                    <span className="font-medium text-emerald-600">₱{savingsStats.totalDeposits.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Withdrawals</span>
                    <span className="font-medium text-amber-600">₱{savingsStats.totalWithdrawals.toLocaleString()}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}