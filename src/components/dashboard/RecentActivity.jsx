import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  UserPlus, 
  Wallet, 
  ArrowDownCircle, 
  ArrowUpCircle,
  CheckCircle,
  Clock
} from 'lucide-react';
import moment from 'moment';

const activityIcons = {
  'member_registration': UserPlus,
  'loan_application': Wallet,
  'deposit': ArrowDownCircle,
  'withdrawal': ArrowUpCircle,
  'loan_approval': CheckCircle,
  'loan_payment': Wallet,
};

const activityColors = {
  'member_registration': 'bg-blue-50 text-blue-600',
  'loan_application': 'bg-purple-50 text-purple-600',
  'deposit': 'bg-emerald-50 text-emerald-600',
  'withdrawal': 'bg-amber-50 text-amber-600',
  'loan_approval': 'bg-green-50 text-green-600',
  'loan_payment': 'bg-indigo-50 text-indigo-600',
};

export default function RecentActivity({ activities = [] }) {
  if (activities.length === 0) {
    return (
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Clock className="w-12 h-12 text-slate-200 mb-3" />
            <p className="text-slate-500">No recent activity</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold text-slate-900">Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity, index) => {
          const Icon = activityIcons[activity.type] || Clock;
          const colorClass = activityColors[activity.type] || 'bg-slate-50 text-slate-600';
          
          return (
            <div key={index} className="flex items-start gap-4">
              <div className={`p-2 rounded-lg ${colorClass}`}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {activity.title}
                </p>
                <p className="text-sm text-slate-500 truncate">
                  {activity.description}
                </p>
              </div>
              <div className="text-right">
                {activity.amount && (
                  <p className={`text-sm font-semibold ${
                    activity.type === 'deposit' || activity.type === 'loan_payment' 
                      ? 'text-emerald-600' 
                      : activity.type === 'withdrawal' || activity.type === 'loan_application'
                        ? 'text-red-600'
                        : 'text-slate-900'
                  }`}>
                    ₱{activity.amount.toLocaleString()}
                  </p>
                )}
                <p className="text-xs text-slate-400">
                  {moment(activity.date).fromNow()}
                </p>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}