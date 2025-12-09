import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { 
  Shield, 
  FileText, 
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  BarChart3,
  TrendingUp,
  Users,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import moment from 'moment';

export default function AuditorDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalLoans: 0,
    totalSavings: 0,
    auditLogs: 0
  });
  const [recentLogs, setRecentLogs] = useState([]);
  const [flaggedItems, setFlaggedItems] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [members, loans, savings, logs, transactions] = await Promise.all([
        base44.entities.Member.list('-created_date', 500),
        base44.entities.Loan.list('-created_date', 500),
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.AuditLog.list('-created_date', 50),
        base44.entities.Transaction.list('-created_date', 100)
      ]);

      setStats({
        totalMembers: members.length,
        totalLoans: loans.length,
        totalSavings: savings.reduce((sum, s) => sum + (s.balance || 0), 0),
        auditLogs: logs.length
      });

      setRecentLogs(logs.slice(0, 10));

      // Generate flagged items for audit attention
      const flagged = [];
      
      // Large transactions
      const largeTransactions = transactions.filter(t => (t.amount || 0) > 100000);
      largeTransactions.forEach(t => {
        flagged.push({
          type: 'transaction',
          severity: 'warning',
          title: `Large ${t.transaction_type}: ₱${(t.amount || 0).toLocaleString()}`,
          description: `By ${t.member_name} on ${moment(t.transaction_date).format('MMM DD, YYYY')}`,
          date: t.created_date
        });
      });

      // Defaulted loans
      const defaultedLoans = loans.filter(l => l.status === 'Defaulted');
      defaultedLoans.forEach(l => {
        flagged.push({
          type: 'loan',
          severity: 'error',
          title: `Defaulted Loan: ${l.loan_number}`,
          description: `${l.member_name} - ₱${(l.outstanding_balance || 0).toLocaleString()} outstanding`,
          date: l.updated_date
        });
      });

      setFlaggedItems(flagged.slice(0, 10));

    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getActionColor = (action) => {
    switch(action) {
      case 'CREATE': return 'bg-emerald-50 text-emerald-700';
      case 'UPDATE': return 'bg-blue-50 text-blue-700';
      case 'DELETE': return 'bg-red-50 text-red-700';
      case 'APPROVE': return 'bg-emerald-50 text-emerald-700';
      case 'REJECT': return 'bg-red-50 text-red-700';
      default: return 'bg-slate-50 text-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Auditor Dashboard</h1>
          <p className="text-slate-500">Monitor system activities and compliance</p>
        </div>
        <div className="flex gap-2">
          <Link to={createPageUrl('AuditLogs')}>
            <Button variant="outline">
              <Shield className="w-4 h-4 mr-2" />
              Full Audit Log
            </Button>
          </Link>
          <Link to={createPageUrl('Reports')}>
            <Button className="bg-emerald-600 hover:bg-emerald-700">
              <FileText className="w-4 h-4 mr-2" />
              Reports
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Members</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalMembers}</p>
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
                <p className="text-sm text-slate-500">Total Loans</p>
                <p className="text-2xl font-bold text-slate-900">{stats.totalLoans}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <TrendingUp className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Savings</p>
                <p className="text-2xl font-bold text-slate-900">₱{(stats.totalSavings / 1000000).toFixed(2)}M</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Shield className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Audit Events</p>
                <p className="text-2xl font-bold text-slate-900">{stats.auditLogs}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Flagged Items */}
      {flaggedItems.length > 0 && (
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Items Requiring Attention
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {flaggedItems.map((item, index) => (
                <div key={index} className={`p-4 rounded-lg border-l-4 ${
                  item.severity === 'error' ? 'bg-red-50 border-red-500' : 'bg-amber-50 border-amber-500'
                }`}>
                  <div className="flex items-start justify-between">
                    <div>
                      <p className={`font-medium ${item.severity === 'error' ? 'text-red-900' : 'text-amber-900'}`}>
                        {item.title}
                      </p>
                      <p className={`text-sm ${item.severity === 'error' ? 'text-red-700' : 'text-amber-700'}`}>
                        {item.description}
                      </p>
                    </div>
                    <Badge variant="outline" className={item.severity === 'error' ? 'border-red-300 text-red-700' : 'border-amber-300 text-amber-700'}>
                      {item.type}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="logs" className="space-y-4">
        <TabsList>
          <TabsTrigger value="logs">Recent Activity</TabsTrigger>
          <TabsTrigger value="reports">Quick Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="logs">
          <Card className="border-0 shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Recent Audit Logs</CardTitle>
              <Link to={createPageUrl('AuditLogs')}>
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentLogs.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge className={getActionColor(log.action)}>
                        {log.action}
                      </Badge>
                      <div>
                        <p className="font-medium text-slate-900">{log.description}</p>
                        <p className="text-sm text-slate-500">{log.module} • {log.user_email || 'System'}</p>
                      </div>
                    </div>
                    <p className="text-sm text-slate-400">
                      {moment(log.created_date).fromNow()}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Link to={createPageUrl('Reports')}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <FileText className="w-8 h-8 text-emerald-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">Financial Statements</h3>
                  <p className="text-sm text-slate-500 mt-1">Balance sheet and income statement</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('Reports')}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <BarChart3 className="w-8 h-8 text-blue-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">Loan Portfolio Report</h3>
                  <p className="text-sm text-slate-500 mt-1">Loan performance and collection status</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('Reports')}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Shield className="w-8 h-8 text-purple-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">Compliance Report</h3>
                  <p className="text-sm text-slate-500 mt-1">CDA regulatory compliance</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('Transactions')}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <TrendingUp className="w-8 h-8 text-amber-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">Transaction Summary</h3>
                  <p className="text-sm text-slate-500 mt-1">All financial transactions</p>
                </CardContent>
              </Card>
            </Link>
            <Link to={createPageUrl('AuditLogs')}>
              <Card className="border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <Eye className="w-8 h-8 text-red-600 mb-3" />
                  <h3 className="font-semibold text-slate-900">System Audit Trail</h3>
                  <p className="text-sm text-slate-500 mt-1">Complete activity history</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}