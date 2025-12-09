import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function KPICard({ 
  title, 
  value, 
  change, 
  changeType = 'neutral', 
  icon: Icon,
  iconColor = 'emerald',
  prefix = '',
  suffix = ''
}) {
  const colorClasses = {
    emerald: 'bg-emerald-50 text-emerald-600',
    blue: 'bg-blue-50 text-blue-600',
    purple: 'bg-purple-50 text-purple-600',
    amber: 'bg-amber-50 text-amber-600',
    red: 'bg-red-50 text-red-600',
    slate: 'bg-slate-50 text-slate-600',
  };

  return (
    <Card className="relative overflow-hidden border-0 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900">
              {prefix}{typeof value === 'number' ? value.toLocaleString() : value}{suffix}
            </p>
            {change !== undefined && (
              <div className="flex items-center gap-1">
                {changeType === 'positive' ? (
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                ) : changeType === 'negative' ? (
                  <TrendingDown className="w-4 h-4 text-red-500" />
                ) : null}
                <span className={`text-sm font-medium ${
                  changeType === 'positive' ? 'text-emerald-600' :
                  changeType === 'negative' ? 'text-red-600' : 'text-slate-500'
                }`}>
                  {change}
                </span>
                <span className="text-sm text-slate-400">vs last month</span>
              </div>
            )}
          </div>
          {Icon && (
            <div className={`p-3 rounded-xl ${colorClasses[iconColor]}`}>
              <Icon className="w-6 h-6" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}