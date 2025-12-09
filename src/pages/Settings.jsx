import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Settings as SettingsIcon,
  Building2,
  Percent,
  Save,
  Plus,
  Edit,
  Trash2,
  Shield,
  Bell,
  Database
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';

export default function Settings() {
  const [loanTypes, setLoanTypes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showLoanTypeModal, setShowLoanTypeModal] = useState(false);
  const [selectedLoanType, setSelectedLoanType] = useState(null);
  const [loanTypeForm, setLoanTypeForm] = useState({
    name: '',
    code: '',
    description: '',
    interest_rate: '',
    min_amount: '',
    max_amount: '',
    min_term_months: '',
    max_term_months: '',
    service_fee_percent: '',
    requires_collateral: false,
    requires_comaker: true,
    is_active: true
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const loanTypesData = await base44.entities.LoanType.list();
      setLoanTypes(loanTypesData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLoanType = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...loanTypeForm,
        interest_rate: parseFloat(loanTypeForm.interest_rate) || 0,
        min_amount: parseFloat(loanTypeForm.min_amount) || 0,
        max_amount: parseFloat(loanTypeForm.max_amount) || 0,
        min_term_months: parseInt(loanTypeForm.min_term_months) || 0,
        max_term_months: parseInt(loanTypeForm.max_term_months) || 0,
        service_fee_percent: parseFloat(loanTypeForm.service_fee_percent) || 0
      };

      if (selectedLoanType) {
        await base44.entities.LoanType.update(selectedLoanType.id, data);
      } else {
        await base44.entities.LoanType.create(data);
      }

      setShowLoanTypeModal(false);
      resetLoanTypeForm();
      loadData();
    } catch (error) {
      console.error('Error saving loan type:', error);
    }
  };

  const handleDeleteLoanType = async (loanType) => {
    if (confirm('Are you sure you want to delete this loan type?')) {
      try {
        await base44.entities.LoanType.delete(loanType.id);
        loadData();
      } catch (error) {
        console.error('Error deleting loan type:', error);
      }
    }
  };

  const handleEditLoanType = (loanType) => {
    setSelectedLoanType(loanType);
    setLoanTypeForm({
      name: loanType.name || '',
      code: loanType.code || '',
      description: loanType.description || '',
      interest_rate: loanType.interest_rate?.toString() || '',
      min_amount: loanType.min_amount?.toString() || '',
      max_amount: loanType.max_amount?.toString() || '',
      min_term_months: loanType.min_term_months?.toString() || '',
      max_term_months: loanType.max_term_months?.toString() || '',
      service_fee_percent: loanType.service_fee_percent?.toString() || '',
      requires_collateral: loanType.requires_collateral || false,
      requires_comaker: loanType.requires_comaker !== false,
      is_active: loanType.is_active !== false
    });
    setShowLoanTypeModal(true);
  };

  const resetLoanTypeForm = () => {
    setSelectedLoanType(null);
    setLoanTypeForm({
      name: '',
      code: '',
      description: '',
      interest_rate: '',
      min_amount: '',
      max_amount: '',
      min_term_months: '',
      max_term_months: '',
      service_fee_percent: '',
      requires_collateral: false,
      requires_comaker: true,
      is_active: true
    });
  };

  const loanTypeColumns = [
    {
      header: 'Code',
      accessor: 'code',
      cell: (value) => <span className="font-mono font-medium">{value}</span>
    },
    {
      header: 'Name',
      accessor: 'name',
      cell: (value) => <span className="font-medium text-slate-900">{value}</span>
    },
    {
      header: 'Interest Rate',
      accessor: 'interest_rate',
      cell: (value) => <span className="text-emerald-600 font-medium">{value}% p.a.</span>
    },
    {
      header: 'Amount Range',
      accessor: 'min_amount',
      cell: (_, row) => (
        <span className="text-sm">
          ₱{(row.min_amount || 0).toLocaleString()} - ₱{(row.max_amount || 0).toLocaleString()}
        </span>
      )
    },
    {
      header: 'Term Range',
      accessor: 'min_term_months',
      cell: (_, row) => (
        <span className="text-sm">
          {row.min_term_months || 0} - {row.max_term_months || 0} months
        </span>
      )
    },
    {
      header: 'Status',
      accessor: 'is_active',
      cell: (value) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${value ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {value ? 'Active' : 'Inactive'}
        </span>
      )
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => handleEditLoanType(row)}>
            <Edit className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={() => handleDeleteLoanType(row)}>
            <Trash2 className="w-4 h-4 text-red-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500">Configure system settings and parameters</p>
      </div>

      <Tabs defaultValue="loan-types" className="space-y-6">
        <TabsList>
          <TabsTrigger value="loan-types">
            <Percent className="w-4 h-4 mr-2" />
            Loan Types
          </TabsTrigger>
          <TabsTrigger value="cooperative">
            <Building2 className="w-4 h-4 mr-2" />
            Cooperative Info
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="w-4 h-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="w-4 h-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        <TabsContent value="loan-types" className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Loan Types</h2>
              <p className="text-sm text-slate-500">Manage loan products and interest rates</p>
            </div>
            <Button onClick={() => { resetLoanTypeForm(); setShowLoanTypeModal(true); }} className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-2" />
              Add Loan Type
            </Button>
          </div>

          <DataTable
            columns={loanTypeColumns}
            data={loanTypes}
            isLoading={isLoading}
            searchable={false}
            emptyMessage="No loan types configured. Add your first loan type to get started."
          />
        </TabsContent>

        <TabsContent value="cooperative" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Cooperative Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cooperative Name</Label>
                  <Input placeholder="Sample Credit Cooperative" />
                </div>
                <div className="space-y-2">
                  <Label>Registration Number</Label>
                  <Input placeholder="CDA Reg. No. 9520-123456789" />
                </div>
                <div className="space-y-2">
                  <Label>TIN Number</Label>
                  <Input placeholder="000-000-000-000" />
                </div>
                <div className="space-y-2">
                  <Label>Contact Number</Label>
                  <Input placeholder="+63 XXX XXX XXXX" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label>Address</Label>
                  <Textarea placeholder="Complete cooperative address" />
                </div>
              </div>
              <div className="flex justify-end">
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Security Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Two-Factor Authentication</p>
                  <p className="text-sm text-slate-500">Require 2FA for all admin users</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Session Timeout</p>
                  <p className="text-sm text-slate-500">Automatically log out inactive users</p>
                </div>
                <Select defaultValue="30">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">1 hour</SelectItem>
                    <SelectItem value="120">2 hours</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Password Policy</p>
                  <p className="text-sm text-slate-500">Minimum password requirements</p>
                </div>
                <Select defaultValue="strong">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="strong">Strong</SelectItem>
                    <SelectItem value="strict">Strict</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Audit Logging</p>
                  <p className="text-sm text-slate-500">Log all user activities</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Notification Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Email Notifications</p>
                  <p className="text-sm text-slate-500">Send email alerts for important events</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">SMS Notifications</p>
                  <p className="text-sm text-slate-500">Send SMS alerts for loan due dates</p>
                </div>
                <Switch />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">Payment Reminders</p>
                  <p className="text-sm text-slate-500">Days before due date to send reminder</p>
                </div>
                <Select defaultValue="3">
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 day</SelectItem>
                    <SelectItem value="3">3 days</SelectItem>
                    <SelectItem value="7">7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-slate-900">New Member Welcome</p>
                  <p className="text-sm text-slate-500">Send welcome email to new members</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Loan Type Modal */}
      <Dialog open={showLoanTypeModal} onOpenChange={setShowLoanTypeModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedLoanType ? 'Edit Loan Type' : 'Add Loan Type'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSaveLoanType} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Name *</Label>
                <Input
                  value={loanTypeForm.name}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, name: e.target.value})}
                  placeholder="Regular Loan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Code *</Label>
                <Input
                  value={loanTypeForm.code}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, code: e.target.value})}
                  placeholder="RL"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={loanTypeForm.description}
                onChange={(e) => setLoanTypeForm({...loanTypeForm, description: e.target.value})}
                placeholder="Describe this loan type..."
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Interest Rate (% p.a.) *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={loanTypeForm.interest_rate}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, interest_rate: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Min Amount</Label>
                <Input
                  type="number"
                  value={loanTypeForm.min_amount}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, min_amount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Amount</Label>
                <Input
                  type="number"
                  value={loanTypeForm.max_amount}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, max_amount: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Min Term (months)</Label>
                <Input
                  type="number"
                  value={loanTypeForm.min_term_months}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, min_term_months: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Max Term (months)</Label>
                <Input
                  type="number"
                  value={loanTypeForm.max_term_months}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, max_term_months: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>Service Fee (%)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={loanTypeForm.service_fee_percent}
                  onChange={(e) => setLoanTypeForm({...loanTypeForm, service_fee_percent: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-2">
                <Switch
                  checked={loanTypeForm.requires_collateral}
                  onCheckedChange={(checked) => setLoanTypeForm({...loanTypeForm, requires_collateral: checked})}
                />
                <Label>Requires Collateral</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={loanTypeForm.requires_comaker}
                  onCheckedChange={(checked) => setLoanTypeForm({...loanTypeForm, requires_comaker: checked})}
                />
                <Label>Requires Co-maker</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={loanTypeForm.is_active}
                  onCheckedChange={(checked) => setLoanTypeForm({...loanTypeForm, is_active: checked})}
                />
                <Label>Active</Label>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowLoanTypeModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {selectedLoanType ? 'Update' : 'Create'} Loan Type
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}