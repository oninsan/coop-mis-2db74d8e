import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Brain, 
  Loader2, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  TrendingUp,
  Wallet,
  Calculator,
  Info
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export default function LoanEligibilityAnalyzer({ members = [], loans = [], savings = [], transactions = [] }) {
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  const analyzeEligibility = async () => {
    if (!selectedMemberId) return;
    
    setIsAnalyzing(true);
    setAnalysis(null);

    try {
      const member = members.find(m => m.id === selectedMemberId);
      const memberLoans = loans.filter(l => l.member_id === selectedMemberId);
      const memberSavings = savings.filter(s => s.member_id === selectedMemberId);
      const memberTransactions = transactions.filter(t => t.member_id === selectedMemberId);

      // Calculate key metrics
      const activeLoans = memberLoans.filter(l => ['Active', 'Disbursed'].includes(l.status));
      const paidLoans = memberLoans.filter(l => l.status === 'Paid');
      const defaultedLoans = memberLoans.filter(l => l.status === 'Defaulted');
      const totalOutstanding = activeLoans.reduce((sum, l) => sum + (l.outstanding_balance || 0), 0);
      const totalSavingsBalance = memberSavings.reduce((sum, s) => sum + (s.balance || 0), 0);
      const shareCapital = member?.share_capital || 0;
      const monthlyIncome = member?.monthly_income || 0;

      // Calculate loan payment history
      const loanPayments = memberTransactions.filter(t => t.transaction_type === 'Loan Payment');
      const totalPaidAmount = paidLoans.reduce((sum, l) => sum + (l.principal_amount || 0), 0);

      // Prepare data for AI analysis
      const analysisData = {
        member_name: `${member?.first_name} ${member?.last_name}`,
        membership_duration_months: member?.membership_date 
          ? Math.floor((new Date() - new Date(member.membership_date)) / (1000 * 60 * 60 * 24 * 30))
          : 0,
        monthly_income: monthlyIncome,
        share_capital: shareCapital,
        total_savings: totalSavingsBalance,
        active_loans_count: activeLoans.length,
        total_outstanding_balance: totalOutstanding,
        paid_loans_count: paidLoans.length,
        defaulted_loans_count: defaultedLoans.length,
        total_loan_payments_made: loanPayments.length,
        total_amount_paid: totalPaidAmount,
        monthly_loan_obligations: activeLoans.reduce((sum, l) => sum + (l.monthly_amortization || 0), 0)
      };

      // Call AI for analysis
      const aiResponse = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a credit cooperative loan analyst AI. Analyze the following member's financial data and determine their loan eligibility and recommended reloanable amount.

MEMBER DATA:
- Name: ${analysisData.member_name}
- Membership Duration: ${analysisData.membership_duration_months} months
- Monthly Income: ₱${analysisData.monthly_income.toLocaleString()}
- Share Capital: ₱${analysisData.share_capital.toLocaleString()}
- Total Savings: ₱${analysisData.total_savings.toLocaleString()}
- Active Loans: ${analysisData.active_loans_count}
- Outstanding Balance: ₱${analysisData.total_outstanding_balance.toLocaleString()}
- Completed/Paid Loans: ${analysisData.paid_loans_count}
- Defaulted Loans: ${analysisData.defaulted_loans_count}
- Total Loan Payments Made: ${analysisData.total_loan_payments_made}
- Current Monthly Loan Obligations: ₱${analysisData.monthly_loan_obligations.toLocaleString()}

ANALYSIS RULES:
1. Maximum loan amount should not exceed 3x monthly income or 2x share capital, whichever is higher
2. Monthly amortization should not exceed 40% of monthly income
3. Members with defaulted loans should be flagged
4. Consider payment history and membership duration
5. Members must have at least 6 months membership
6. Outstanding balance affects reloanable amount

Provide a comprehensive analysis with specific recommendations.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_eligible: {
              type: "boolean",
              description: "Whether the member is eligible for a new loan"
            },
            eligibility_score: {
              type: "number",
              description: "Score from 0-100 indicating creditworthiness"
            },
            max_reloanable_amount: {
              type: "number",
              description: "Maximum amount the member can borrow"
            },
            recommended_loan_amount: {
              type: "number",
              description: "AI recommended loan amount"
            },
            recommended_term_months: {
              type: "number",
              description: "Recommended loan term in months"
            },
            estimated_monthly_payment: {
              type: "number",
              description: "Estimated monthly amortization at 12% interest"
            },
            risk_level: {
              type: "string",
              description: "Risk assessment: low, medium, high"
            },
            strengths: {
              type: "array",
              items: { type: "string" },
              description: "Positive factors for the member"
            },
            concerns: {
              type: "array",
              items: { type: "string" },
              description: "Risk factors or concerns"
            },
            recommendations: {
              type: "array",
              items: { type: "string" },
              description: "Specific recommendations for the loan officer"
            },
            denial_reasons: {
              type: "array",
              items: { type: "string" },
              description: "Reasons for denial if not eligible"
            }
          },
          required: ["is_eligible", "eligibility_score", "max_reloanable_amount", "risk_level"]
        }
      });

      setAnalysis({
        ...aiResponse,
        memberData: analysisData
      });

    } catch (error) {
      console.error('Error analyzing eligibility:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (risk) => {
    switch(risk) {
      case 'low': return 'text-emerald-600 bg-emerald-50';
      case 'medium': return 'text-amber-600 bg-amber-50';
      case 'high': return 'text-red-600 bg-red-50';
      default: return 'text-slate-600 bg-slate-50';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'bg-emerald-500';
    if (score >= 60) return 'bg-blue-500';
    if (score >= 40) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg flex items-center gap-2">
          <Brain className="w-5 h-5 text-purple-600" />
          AI Loan Eligibility Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Member Selection */}
        <div className="flex gap-4 items-end">
          <div className="flex-1 space-y-2">
            <Label>Select Member to Analyze</Label>
            <Select value={selectedMemberId} onValueChange={setSelectedMemberId}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a member..." />
              </SelectTrigger>
              <SelectContent>
                {members.filter(m => m.status === 'Active').map(m => (
                  <SelectItem key={m.id} value={m.id}>
                    {m.first_name} {m.last_name} ({m.member_code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button 
            onClick={analyzeEligibility} 
            disabled={!selectedMemberId || isAnalyzing}
            className="bg-purple-600 hover:bg-purple-700"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Brain className="w-4 h-4 mr-2" />
                Analyze Eligibility
              </>
            )}
          </Button>
        </div>

        {/* Analysis Results */}
        {analysis && (
          <div className="space-y-6 pt-4 border-t">
            {/* Eligibility Status */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {analysis.is_eligible ? (
                  <div className="p-3 bg-emerald-50 rounded-xl">
                    <CheckCircle className="w-8 h-8 text-emerald-600" />
                  </div>
                ) : (
                  <div className="p-3 bg-red-50 rounded-xl">
                    <XCircle className="w-8 h-8 text-red-600" />
                  </div>
                )}
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {analysis.is_eligible ? 'Eligible for Reloan' : 'Not Eligible'}
                  </h3>
                  <p className="text-slate-500">
                    {analysis.memberData.member_name}
                  </p>
                </div>
              </div>
              <div className={`px-4 py-2 rounded-full font-medium ${getRiskColor(analysis.risk_level)}`}>
                {analysis.risk_level?.toUpperCase()} RISK
              </div>
            </div>

            {/* Score & Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-slate-500">Credit Score</span>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <Info className="w-4 h-4 text-slate-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Based on payment history, income, and membership</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-3xl font-bold text-slate-900">{analysis.eligibility_score}</p>
                <Progress value={analysis.eligibility_score} className={`h-2 mt-2 ${getScoreColor(analysis.eligibility_score)}`} />
              </div>

              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Wallet className="w-4 h-4 text-purple-600" />
                  <span className="text-sm text-purple-600">Max Reloanable</span>
                </div>
                <p className="text-2xl font-bold text-purple-700">
                  ₱{(analysis.max_reloanable_amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-emerald-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span className="text-sm text-emerald-600">Recommended Amount</span>
                </div>
                <p className="text-2xl font-bold text-emerald-700">
                  ₱{(analysis.recommended_loan_amount || 0).toLocaleString()}
                </p>
              </div>

              <div className="p-4 bg-blue-50 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <Calculator className="w-4 h-4 text-blue-600" />
                  <span className="text-sm text-blue-600">Est. Monthly Payment</span>
                </div>
                <p className="text-2xl font-bold text-blue-700">
                  ₱{(analysis.estimated_monthly_payment || 0).toLocaleString()}
                </p>
                <p className="text-xs text-blue-500 mt-1">
                  {analysis.recommended_term_months} months @ 12% p.a.
                </p>
              </div>
            </div>

            {/* Strengths & Concerns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {analysis.strengths && analysis.strengths.length > 0 && (
                <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100">
                  <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    Strengths
                  </h4>
                  <ul className="space-y-2">
                    {analysis.strengths.map((item, i) => (
                      <li key={i} className="text-sm text-emerald-700 flex items-start gap-2">
                        <span className="text-emerald-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {analysis.concerns && analysis.concerns.length > 0 && (
                <div className="p-4 bg-amber-50/50 rounded-xl border border-amber-100">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4" />
                    Concerns
                  </h4>
                  <ul className="space-y-2">
                    {analysis.concerns.map((item, i) => (
                      <li key={i} className="text-sm text-amber-700 flex items-start gap-2">
                        <span className="text-amber-500 mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {analysis.recommendations && analysis.recommendations.length > 0 && (
              <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                <h4 className="font-semibold text-blue-800 mb-3">AI Recommendations</h4>
                <ul className="space-y-2">
                  {analysis.recommendations.map((item, i) => (
                    <li key={i} className="text-sm text-blue-700 flex items-start gap-2">
                      <span className="text-blue-500 mt-1">→</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Denial Reasons */}
            {!analysis.is_eligible && analysis.denial_reasons && analysis.denial_reasons.length > 0 && (
              <div className="p-4 bg-red-50/50 rounded-xl border border-red-100">
                <h4 className="font-semibold text-red-800 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Reasons for Denial
                </h4>
                <ul className="space-y-2">
                  {analysis.denial_reasons.map((item, i) => (
                    <li key={i} className="text-sm text-red-700 flex items-start gap-2">
                      <span className="text-red-500 mt-1">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Member Financial Summary */}
            <div className="p-4 bg-slate-50 rounded-xl">
              <h4 className="font-semibold text-slate-800 mb-3">Member Financial Summary</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Monthly Income</p>
                  <p className="font-medium">₱{analysis.memberData.monthly_income.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Share Capital</p>
                  <p className="font-medium">₱{analysis.memberData.share_capital.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Total Savings</p>
                  <p className="font-medium">₱{analysis.memberData.total_savings.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Outstanding Balance</p>
                  <p className="font-medium text-red-600">₱{analysis.memberData.total_outstanding_balance.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-slate-500">Membership Duration</p>
                  <p className="font-medium">{analysis.memberData.membership_duration_months} months</p>
                </div>
                <div>
                  <p className="text-slate-500">Paid Loans</p>
                  <p className="font-medium text-emerald-600">{analysis.memberData.paid_loans_count}</p>
                </div>
                <div>
                  <p className="text-slate-500">Active Loans</p>
                  <p className="font-medium">{analysis.memberData.active_loans_count}</p>
                </div>
                <div>
                  <p className="text-slate-500">Monthly Obligations</p>
                  <p className="font-medium">₱{analysis.memberData.monthly_loan_obligations.toLocaleString()}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {!analysis && !isAnalyzing && (
          <div className="text-center py-8 text-slate-400">
            <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <p>Select a member and click "Analyze Eligibility" to get AI-powered loan recommendations</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}