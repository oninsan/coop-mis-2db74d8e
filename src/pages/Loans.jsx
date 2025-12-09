import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Plus, 
  Eye,
  Edit,
  CheckCircle,
  XCircle,
  Wallet,
  Calculator,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import DataTable from '@/components/common/DataTable';
import StatusBadge from '@/components/common/StatusBadge';
import LoanEligibilityAnalyzer from '@/components/loans/LoanEligibilityAnalyzer';
import moment from 'moment';

export default function Loans() {
  const [loans, setLoans] = useState([]);
  const [members, setMembers] = useState([]);
  const [loanTypes, setLoanTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    member_id: '',
    loan_type_id: '',
    principal_amount: '',
    term_months: '',
    purpose: '',
    comaker_name: '',
    comaker_member_id: '',
    collateral_description: '',
    remarks: ''
  });
  const [calculatedLoan, setCalculatedLoan] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const [savings, setSavings] = useState([]);
  const [transactions, setTransactions] = useState([]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [loansData, membersData, loanTypesData, savingsData, transactionsData] = await Promise.all([
        base44.entities.Loan.list('-created_date', 500),
        base44.entities.Member.filter({ status: 'Active' }),
        base44.entities.LoanType.filter({ is_active: true }),
        base44.entities.SavingsAccount.list('-created_date', 500),
        base44.entities.Transaction.list('-created_date', 500)
      ]);
      setLoans(loansData);
      setMembers(membersData);
      setLoanTypes(loanTypesData);
      setSavings(savingsData);
      setTransactions(transactionsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateLoanNumber = () => {
    const year = new Date().getFullYear();
    const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `LN-${year}${month}-${random}`;
  };

  const calculateLoan = () => {
    const principal = parseFloat(formData.principal_amount) || 0;
    const term = parseInt(formData.term_months) || 0;
    const loanType = loanTypes.find(lt => lt.id === formData.loan_type_id);
    const annualRate = loanType?.interest_rate || 12;
    const serviceFeePercent = loanType?.service_fee_percent || 1;
    
    if (principal <= 0 || term <= 0) {
      setCalculatedLoan(null);
      return;
    }

    // Diminishing balance calculation
    const monthlyRate = annualRate / 100 / 12;
    const monthlyPayment = principal * (monthlyRate * Math.pow(1 + monthlyRate, term)) / (Math.pow(1 + monthlyRate, term) - 1);
    const totalPayable = monthlyPayment * term;
    const totalInterest = totalPayable - principal;
    const serviceFee = principal * (serviceFeePercent / 100);
    const netProceeds = principal - serviceFee;

    // Generate amortization schedule
    const schedule = [];
    let balance = principal;
    const startDate = moment().add(1, 'month');
    
    for (let i = 1; i <= term; i++) {
      const interestPayment = balance * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      balance -= principalPayment;
      
      schedule.push({
        installment_no: i,
        due_date: startDate.clone().add(i - 1, 'months').format('YYYY-MM-DD'),
        principal: Math.round(principalPayment * 100) / 100,
        interest: Math.round(interestPayment * 100) / 100,
        total: Math.round(monthlyPayment * 100) / 100,
        balance: Math.max(0, Math.round(balance * 100) / 100),
        status: 'Pending'
      });
    }

    setCalculatedLoan({
      monthly_amortization: Math.round(monthlyPayment * 100) / 100,
      total_interest: Math.round(totalInterest * 100) / 100,
      total_payable: Math.round(totalPayable * 100) / 100,
      service_fee: Math.round(serviceFee * 100) / 100,
      net_proceeds: Math.round(netProceeds * 100) / 100,
      interest_rate: annualRate,
      maturity_date: startDate.clone().add(term - 1, 'months').format('YYYY-MM-DD'),
      amortization_schedule: schedule
    });
  };

  useEffect(() => {
    if (formData.principal_amount && formData.term_months && formData.loan_type_id) {
      calculateLoan();
    }
  }, [formData.principal_amount, formData.term_months, formData.loan_type_id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const member = members.find(m => m.id === formData.member_id);
      const loanType = loanTypes.find(lt => lt.id === formData.loan_type_id);
      
      const loanData = {
        loan_number: generateLoanNumber(),
        member_id: formData.member_id,
        member_name: `${member?.first_name} ${member?.last_name}`,
        loan_type_id: formData.loan_type_id,
        loan_type_name: loanType?.name,
        principal_amount: parseFloat(formData.principal_amount),
        interest_rate: calculatedLoan?.interest_rate,
        term_months: parseInt(formData.term_months),
        purpose: formData.purpose,
        monthly_amortization: calculatedLoan?.monthly_amortization,
        total_interest: calculatedLoan?.total_interest,
        total_payable: calculatedLoan?.total_payable,
        service_fee: calculatedLoan?.service_fee,
        net_proceeds: calculatedLoan?.net_proceeds,
        outstanding_balance: parseFloat(formData.principal_amount),
        status: 'Pending',
        application_date: new Date().toISOString().split('T')[0],
        maturity_date: calculatedLoan?.maturity_date,
        comaker_name: formData.comaker_name,
        comaker_member_id: formData.comaker_member_id,
        collateral_description: formData.collateral_description,
        remarks: formData.remarks,
        amortization_schedule: calculatedLoan?.amortization_schedule
      };
      
      await base44.entities.Loan.create(loanData);
      setShowAddModal(false);
      resetForm();
      loadData();
    } catch (error) {
      console.error('Error creating loan:', error);
    }
  };

  const handleStatusChange = async (loan, newStatus) => {
    try {
      const updateData = { status: newStatus };
      
      if (newStatus === 'Approved') {
        updateData.approval_date = new Date().toISOString().split('T')[0];
      } else if (newStatus === 'Disbursed') {
        updateData.disbursement_date = new Date().toISOString().split('T')[0];
        updateData.status = 'Active';
      }
      
      await base44.entities.Loan.update(loan.id, updateData);
      loadData();
      setShowViewModal(false);
    } catch (error) {
      console.error('Error updating loan status:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      member_id: '',
      loan_type_id: '',
      principal_amount: '',
      term_months: '',
      purpose: '',
      comaker_name: '',
      comaker_member_id: '',
      collateral_description: '',
      remarks: ''
    });
    setCalculatedLoan(null);
    setSelectedLoan(null);
  };

  const handleView = (loan) => {
    setSelectedLoan(loan);
    setShowViewModal(true);
  };

  const filteredLoans = filterStatus === 'all' 
    ? loans 
    : loans.filter(l => l.status === filterStatus);

  const columns = [
    {
      header: 'Loan Number',
      accessor: 'loan_number',
      sortable: true,
      cell: (value) => <span className="font-mono text-sm text-slate-600">{value}</span>
    },
    {
      header: 'Member',
      accessor: 'member_name',
      sortable: true,
      cell: (value) => (
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
            <Wallet className="w-4 h-4 text-blue-600" />
          </div>
          <span className="font-medium text-slate-900">{value}</span>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'loan_type_name',
      sortable: true
    },
    {
      header: 'Principal',
      accessor: 'principal_amount',
      sortable: true,
      cell: (value) => <span className="font-medium">₱{(value || 0).toLocaleString()}</span>
    },
    {
      header: 'Outstanding',
      accessor: 'outstanding_balance',
      sortable: true,
      cell: (value) => <span className="font-medium text-red-600">₱{(value || 0).toLocaleString()}</span>
    },
    {
      header: 'Term',
      accessor: 'term_months',
      cell: (value) => `${value} months`
    },
    {
      header: 'Status',
      accessor: 'status',
      sortable: true,
      cell: (value) => <StatusBadge status={value} />
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(row); }}>
          <Eye className="w-4 h-4 text-slate-500" />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Loans</h1>
          <p className="text-slate-500">Manage loan applications and processing</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <Plus className="w-4 h-4 mr-2" />
          New Loan Application
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Loans</p>
            <p className="text-2xl font-bold text-slate-900">{loans.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-2xl font-bold text-amber-600">{loans.filter(l => l.status === 'Pending').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{loans.filter(l => ['Active', 'Disbursed'].includes(l.status)).length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Portfolio</p>
            <p className="text-2xl font-bold text-blue-600">₱{loans.filter(l => ['Active', 'Disbursed'].includes(l.status)).reduce((sum, l) => sum + (l.outstanding_balance || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Paid</p>
            <p className="text-2xl font-bold text-purple-600">{loans.filter(l => l.status === 'Paid').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* AI Loan Eligibility Analyzer */}
      <LoanEligibilityAnalyzer 
        members={members}
        loans={loans}
        savings={savings}
        transactions={transactions}
      />

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Paid">Paid</SelectItem>
            <SelectItem value="Defaulted">Defaulted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredLoans}
        isLoading={isLoading}
        searchPlaceholder="Search loans..."
        onRowClick={handleView}
        emptyMessage="No loans found."
      />

      {/* Add Loan Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>New Loan Application</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column - Form */}
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Member *</Label>
                  <Select value={formData.member_id} onValueChange={(v) => setFormData({...formData, member_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select member" /></SelectTrigger>
                    <SelectContent>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name} ({m.member_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Loan Type *</Label>
                  <Select value={formData.loan_type_id} onValueChange={(v) => setFormData({...formData, loan_type_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select loan type" /></SelectTrigger>
                    <SelectContent>
                      {loanTypes.map(lt => (
                        <SelectItem key={lt.id} value={lt.id}>
                          {lt.name} ({lt.interest_rate}% p.a.)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Principal Amount *</Label>
                    <Input
                      type="number"
                      value={formData.principal_amount}
                      onChange={(e) => setFormData({...formData, principal_amount: e.target.value})}
                      placeholder="0.00"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Term (Months) *</Label>
                    <Select value={formData.term_months} onValueChange={(v) => setFormData({...formData, term_months: v})}>
                      <SelectTrigger><SelectValue placeholder="Select term" /></SelectTrigger>
                      <SelectContent>
                        {[6, 12, 18, 24, 36, 48, 60].map(t => (
                          <SelectItem key={t} value={t.toString()}>{t} months</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Purpose</Label>
                  <Textarea
                    value={formData.purpose}
                    onChange={(e) => setFormData({...formData, purpose: e.target.value})}
                    placeholder="Describe the purpose of this loan..."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label>Co-maker</Label>
                  <Select value={formData.comaker_member_id} onValueChange={(v) => {
                    const comaker = members.find(m => m.id === v);
                    setFormData({
                      ...formData, 
                      comaker_member_id: v,
                      comaker_name: comaker ? `${comaker.first_name} ${comaker.last_name}` : ''
                    });
                  }}>
                    <SelectTrigger><SelectValue placeholder="Select co-maker (optional)" /></SelectTrigger>
                    <SelectContent>
                      {members.filter(m => m.id !== formData.member_id).map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Collateral (if any)</Label>
                  <Textarea
                    value={formData.collateral_description}
                    onChange={(e) => setFormData({...formData, collateral_description: e.target.value})}
                    placeholder="Describe any collateral..."
                  />
                </div>
              </div>
              
              {/* Right Column - Calculator */}
              <div className="space-y-4">
                <Card className="bg-slate-50 border-0">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Calculator className="w-5 h-5 text-emerald-600" />
                      Loan Calculator
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {calculatedLoan ? (
                      <>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">Monthly Amortization</p>
                            <p className="text-xl font-bold text-emerald-600">₱{calculatedLoan.monthly_amortization.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">Total Interest</p>
                            <p className="text-xl font-bold text-blue-600">₱{calculatedLoan.total_interest.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">Total Payable</p>
                            <p className="text-xl font-bold text-slate-900">₱{calculatedLoan.total_payable.toLocaleString()}</p>
                          </div>
                          <div className="p-3 bg-white rounded-lg">
                            <p className="text-sm text-slate-500">Service Fee</p>
                            <p className="text-xl font-bold text-amber-600">₱{calculatedLoan.service_fee.toLocaleString()}</p>
                          </div>
                        </div>
                        <div className="p-4 bg-emerald-100 rounded-lg">
                          <p className="text-sm text-emerald-700">Net Proceeds (Amount to be released)</p>
                          <p className="text-2xl font-bold text-emerald-700">₱{calculatedLoan.net_proceeds.toLocaleString()}</p>
                        </div>
                        <div className="text-sm text-slate-500">
                          <p>Interest Rate: {calculatedLoan.interest_rate}% per annum (diminishing balance)</p>
                          <p>Maturity Date: {moment(calculatedLoan.maturity_date).format('MMM DD, YYYY')}</p>
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-8 text-slate-400">
                        <Calculator className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>Enter loan details to calculate</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700" disabled={!calculatedLoan}>
                Submit Application
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Loan Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Loan Details</DialogTitle>
          </DialogHeader>
          {selectedLoan && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-mono text-slate-500">{selectedLoan.loan_number}</p>
                  <h3 className="text-xl font-bold text-slate-900">{selectedLoan.member_name}</h3>
                  <p className="text-slate-500">{selectedLoan.loan_type_name}</p>
                </div>
                <StatusBadge status={selectedLoan.status} />
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Principal</p>
                  <p className="text-lg font-bold">₱{(selectedLoan.principal_amount || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Interest Rate</p>
                  <p className="text-lg font-bold">{selectedLoan.interest_rate}% p.a.</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Term</p>
                  <p className="text-lg font-bold">{selectedLoan.term_months} months</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Monthly Payment</p>
                  <p className="text-lg font-bold">₱{(selectedLoan.monthly_amortization || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-red-50 rounded-lg">
                  <p className="text-sm text-red-600">Outstanding Balance</p>
                  <p className="text-xl font-bold text-red-600">₱{(selectedLoan.outstanding_balance || 0).toLocaleString()}</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-lg">
                  <p className="text-sm text-emerald-600">Net Proceeds</p>
                  <p className="text-xl font-bold text-emerald-600">₱{(selectedLoan.net_proceeds || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-slate-500">Application Date</p>
                  <p className="font-medium">{selectedLoan.application_date ? moment(selectedLoan.application_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Maturity Date</p>
                  <p className="font-medium">{selectedLoan.maturity_date ? moment(selectedLoan.maturity_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Purpose</p>
                  <p className="font-medium">{selectedLoan.purpose || '-'}</p>
                </div>
                <div>
                  <p className="text-slate-500">Co-maker</p>
                  <p className="font-medium">{selectedLoan.comaker_name || '-'}</p>
                </div>
              </div>

              {/* Amortization Schedule Preview */}
              {selectedLoan.amortization_schedule && selectedLoan.amortization_schedule.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Amortization Schedule</h4>
                  <div className="max-h-48 overflow-y-auto border rounded-lg">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left">#</th>
                          <th className="px-3 py-2 text-left">Due Date</th>
                          <th className="px-3 py-2 text-right">Principal</th>
                          <th className="px-3 py-2 text-right">Interest</th>
                          <th className="px-3 py-2 text-right">Total</th>
                          <th className="px-3 py-2 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedLoan.amortization_schedule.slice(0, 12).map((row, i) => (
                          <tr key={i} className="border-t">
                            <td className="px-3 py-2">{row.installment_no}</td>
                            <td className="px-3 py-2">{moment(row.due_date).format('MMM DD, YYYY')}</td>
                            <td className="px-3 py-2 text-right">₱{row.principal.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">₱{row.interest.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right font-medium">₱{row.total.toLocaleString()}</td>
                            <td className="px-3 py-2 text-right">₱{row.balance.toLocaleString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            {selectedLoan?.status === 'Pending' && (
              <>
                <Button variant="destructive" onClick={() => handleStatusChange(selectedLoan, 'Rejected')}>
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" onClick={() => handleStatusChange(selectedLoan, 'Approved')}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </>
            )}
            {selectedLoan?.status === 'Approved' && (
              <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => handleStatusChange(selectedLoan, 'Disbursed')}>
                <Wallet className="w-4 h-4 mr-2" />
                Disburse
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}