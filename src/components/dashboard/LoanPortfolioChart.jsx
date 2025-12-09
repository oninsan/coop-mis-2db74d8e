import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function LoanPortfolioChart({ data = [] }) {
  const defaultData = [
    { name: 'Regular Loans', value: 45, color: '#10b981' },
    { name: 'Emergency', value: 20, color: '#3b82f6' },
    { name: 'Educational', value: 15, color: '#f59e0b' },
    { name: 'Housing', value: 12, color: '#8b5cf6' },
    { name: 'Others', value: 8, color: '#64748b' },
  ];

  const chartData = data.length > 0 ? data : defaultData;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white px-3 py-2 shadow-lg rounded-lg border border-slate-200">
          <p className="text-sm font-medium text-slate-900">{payload[0].name}</p>
          <p className="text-sm text-slate-600">{payload[0].value}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-slate-900">Loan Portfolio Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend 
                layout="vertical" 
                align="right" 
                verticalAlign="middle"
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-sm text-slate-600">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}