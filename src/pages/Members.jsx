import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Edit,
  UserPlus,
  X
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
import moment from 'moment';

export default function Members() {
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    first_name: '',
    middle_name: '',
    last_name: '',
    suffix: '',
    gender: '',
    date_of_birth: '',
    civil_status: '',
    email: '',
    mobile_number: '',
    address: '',
    barangay: '',
    city_municipality: '',
    province: '',
    zip_code: '',
    tin_number: '',
    sss_number: '',
    occupation: '',
    employer: '',
    monthly_income: '',
    membership_type: 'Regular',
    membership_date: new Date().toISOString().split('T')[0],
    share_capital: 0,
    status: 'Active'
  });

  useEffect(() => {
    loadMembers();
  }, []);

  const loadMembers = async () => {
    try {
      setIsLoading(true);
      const data = await base44.entities.Member.list('-created_date', 500);
      setMembers(data);
    } catch (error) {
      console.error('Error loading members:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const generateMemberCode = () => {
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    return `MEM-${year}-${random}`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const memberData = {
        ...formData,
        member_code: generateMemberCode(),
        monthly_income: parseFloat(formData.monthly_income) || 0,
        share_capital: parseFloat(formData.share_capital) || 0
      };
      
      if (selectedMember) {
        await base44.entities.Member.update(selectedMember.id, memberData);
      } else {
        await base44.entities.Member.create(memberData);
      }
      
      setShowAddModal(false);
      resetForm();
      loadMembers();
    } catch (error) {
      console.error('Error saving member:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      first_name: '',
      middle_name: '',
      last_name: '',
      suffix: '',
      gender: '',
      date_of_birth: '',
      civil_status: '',
      email: '',
      mobile_number: '',
      address: '',
      barangay: '',
      city_municipality: '',
      province: '',
      zip_code: '',
      tin_number: '',
      sss_number: '',
      occupation: '',
      employer: '',
      monthly_income: '',
      membership_type: 'Regular',
      membership_date: new Date().toISOString().split('T')[0],
      share_capital: 0,
      status: 'Active'
    });
    setSelectedMember(null);
  };

  const handleEdit = (member) => {
    setSelectedMember(member);
    setFormData({
      ...member,
      monthly_income: member.monthly_income?.toString() || '',
      share_capital: member.share_capital?.toString() || '0'
    });
    setShowAddModal(true);
  };

  const handleView = (member) => {
    setSelectedMember(member);
    setShowViewModal(true);
  };

  const filteredMembers = filterStatus === 'all' 
    ? members 
    : members.filter(m => m.status === filterStatus);

  const columns = [
    {
      header: 'Member Code',
      accessor: 'member_code',
      sortable: true,
      cell: (value) => <span className="font-mono text-sm text-slate-600">{value || '-'}</span>
    },
    {
      header: 'Name',
      accessor: 'first_name',
      sortable: true,
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-emerald-600">
              {row.first_name?.[0]}{row.last_name?.[0]}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">
              {row.first_name} {row.middle_name?.[0] ? `${row.middle_name[0]}.` : ''} {row.last_name} {row.suffix || ''}
            </p>
            <p className="text-sm text-slate-500">{row.email || row.mobile_number}</p>
          </div>
        </div>
      )
    },
    {
      header: 'Type',
      accessor: 'membership_type',
      sortable: true
    },
    {
      header: 'Share Capital',
      accessor: 'share_capital',
      sortable: true,
      cell: (value) => <span className="font-medium">₱{(value || 0).toLocaleString()}</span>
    },
    {
      header: 'Member Since',
      accessor: 'membership_date',
      sortable: true,
      cell: (value) => value ? moment(value).format('MMM DD, YYYY') : '-'
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
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleView(row); }}>
            <Eye className="w-4 h-4 text-slate-500" />
          </Button>
          <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
            <Edit className="w-4 h-4 text-slate-500" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Members</h1>
          <p className="text-slate-500">Manage cooperative members and their information</p>
        </div>
        <Button onClick={() => { resetForm(); setShowAddModal(true); }} className="bg-emerald-600 hover:bg-emerald-700">
          <UserPlus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Members</p>
            <p className="text-2xl font-bold text-slate-900">{members.length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Active</p>
            <p className="text-2xl font-bold text-emerald-600">{members.filter(m => m.status === 'Active').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Regular</p>
            <p className="text-2xl font-bold text-blue-600">{members.filter(m => m.membership_type === 'Regular').length}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <p className="text-sm text-slate-500">Total Share Capital</p>
            <p className="text-2xl font-bold text-purple-600">₱{members.reduce((sum, m) => sum + (m.share_capital || 0), 0).toLocaleString()}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Inactive">Inactive</SelectItem>
            <SelectItem value="Suspended">Suspended</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={filteredMembers}
        isLoading={isLoading}
        searchPlaceholder="Search members..."
        onRowClick={handleView}
        emptyMessage="No members found. Add your first member to get started."
      />

      {/* Add/Edit Modal */}
      <Dialog open={showAddModal} onOpenChange={setShowAddModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedMember ? 'Edit Member' : 'Add New Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit}>
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="personal">Personal Info</TabsTrigger>
                <TabsTrigger value="contact">Contact & Address</TabsTrigger>
                <TabsTrigger value="membership">Membership</TabsTrigger>
              </TabsList>
              
              <TabsContent value="personal" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>First Name *</Label>
                    <Input
                      value={formData.first_name}
                      onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Middle Name</Label>
                    <Input
                      value={formData.middle_name}
                      onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Last Name *</Label>
                    <Input
                      value={formData.last_name}
                      onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Suffix</Label>
                    <Input
                      value={formData.suffix}
                      onChange={(e) => setFormData({...formData, suffix: e.target.value})}
                      placeholder="Jr., Sr., III"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Gender</Label>
                    <Select value={formData.gender} onValueChange={(v) => setFormData({...formData, gender: v})}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date of Birth *</Label>
                    <Input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({...formData, date_of_birth: e.target.value})}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Civil Status</Label>
                    <Select value={formData.civil_status} onValueChange={(v) => setFormData({...formData, civil_status: v})}>
                      <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Single">Single</SelectItem>
                        <SelectItem value="Married">Married</SelectItem>
                        <SelectItem value="Widowed">Widowed</SelectItem>
                        <SelectItem value="Separated">Separated</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>TIN Number</Label>
                    <Input
                      value={formData.tin_number}
                      onChange={(e) => setFormData({...formData, tin_number: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>SSS Number</Label>
                    <Input
                      value={formData.sss_number}
                      onChange={(e) => setFormData({...formData, sss_number: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="contact" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Mobile Number *</Label>
                    <Input
                      value={formData.mobile_number}
                      onChange={(e) => setFormData({...formData, mobile_number: e.target.value})}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    placeholder="Street address"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label>Barangay</Label>
                    <Input
                      value={formData.barangay}
                      onChange={(e) => setFormData({...formData, barangay: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City/Municipality</Label>
                    <Input
                      value={formData.city_municipality}
                      onChange={(e) => setFormData({...formData, city_municipality: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Province</Label>
                    <Input
                      value={formData.province}
                      onChange={(e) => setFormData({...formData, province: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>ZIP Code</Label>
                    <Input
                      value={formData.zip_code}
                      onChange={(e) => setFormData({...formData, zip_code: e.target.value})}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Occupation</Label>
                    <Input
                      value={formData.occupation}
                      onChange={(e) => setFormData({...formData, occupation: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Employer</Label>
                    <Input
                      value={formData.employer}
                      onChange={(e) => setFormData({...formData, employer: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Monthly Income</Label>
                    <Input
                      type="number"
                      value={formData.monthly_income}
                      onChange={(e) => setFormData({...formData, monthly_income: e.target.value})}
                    />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="membership" className="space-y-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Membership Type *</Label>
                    <Select value={formData.membership_type} onValueChange={(v) => setFormData({...formData, membership_type: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Regular">Regular</SelectItem>
                        <SelectItem value="Associate">Associate</SelectItem>
                        <SelectItem value="Honorary">Honorary</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Membership Date</Label>
                    <Input
                      type="date"
                      value={formData.membership_date}
                      onChange={(e) => setFormData({...formData, membership_date: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Active">Active</SelectItem>
                        <SelectItem value="Inactive">Inactive</SelectItem>
                        <SelectItem value="Suspended">Suspended</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Initial Share Capital</Label>
                  <Input
                    type="number"
                    value={formData.share_capital}
                    onChange={(e) => setFormData({...formData, share_capital: e.target.value})}
                  />
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setShowAddModal(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">
                {selectedMember ? 'Update Member' : 'Add Member'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Modal */}
      <Dialog open={showViewModal} onOpenChange={setShowViewModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Member Details</DialogTitle>
          </DialogHeader>
          {selectedMember && (
            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
                  <span className="text-2xl font-bold text-emerald-600">
                    {selectedMember.first_name?.[0]}{selectedMember.last_name?.[0]}
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900">
                    {selectedMember.first_name} {selectedMember.middle_name} {selectedMember.last_name} {selectedMember.suffix}
                  </h3>
                  <p className="text-slate-500">{selectedMember.member_code}</p>
                  <StatusBadge status={selectedMember.status} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-medium">{selectedMember.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Mobile</p>
                  <p className="font-medium">{selectedMember.mobile_number || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-medium">{selectedMember.date_of_birth ? moment(selectedMember.date_of_birth).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Civil Status</p>
                  <p className="font-medium">{selectedMember.civil_status || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Membership Type</p>
                  <p className="font-medium">{selectedMember.membership_type || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Member Since</p>
                  <p className="font-medium">{selectedMember.membership_date ? moment(selectedMember.membership_date).format('MMM DD, YYYY') : '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Share Capital</p>
                  <p className="font-medium text-emerald-600">₱{(selectedMember.share_capital || 0).toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Monthly Income</p>
                  <p className="font-medium">₱{(selectedMember.monthly_income || 0).toLocaleString()}</p>
                </div>
              </div>
              
              <div>
                <p className="text-sm text-slate-500">Address</p>
                <p className="font-medium">
                  {[selectedMember.address, selectedMember.barangay, selectedMember.city_municipality, selectedMember.province, selectedMember.zip_code].filter(Boolean).join(', ') || '-'}
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowViewModal(false)}>Close</Button>
            <Button onClick={() => { setShowViewModal(false); handleEdit(selectedMember); }} className="bg-emerald-600 hover:bg-emerald-700">
              Edit Member
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}