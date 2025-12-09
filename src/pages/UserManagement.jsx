import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { 
  Users, 
  Shield, 
  Edit,
  Search,
  UserPlus,
  Mail
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
import DataTable from '@/components/common/DataTable';
import { ROLES, ROLE_LABELS } from '@/components/auth/RoleGuard';
import moment from 'moment';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [members, setMembers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState({
    coop_role: 'member',
    member_id: ''
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [usersData, membersData] = await Promise.all([
        base44.entities.User.list('-created_date', 500),
        base44.entities.Member.filter({ status: 'Active' })
      ]);
      setUsers(usersData);
      setMembers(membersData);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (user) => {
    setSelectedUser(user);
    setFormData({
      coop_role: user.coop_role || 'member',
      member_id: user.member_id || ''
    });
    setShowEditModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await base44.entities.User.update(selectedUser.id, formData);
      setShowEditModal(false);
      loadData();
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  const getRoleBadgeColor = (role) => {
    switch(role?.toLowerCase()) {
      case 'admin': return 'bg-red-100 text-red-700 border-red-200';
      case 'manager': return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'loan_officer': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'teller': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'auditor': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const columns = [
    {
      header: 'User',
      accessor: 'full_name',
      sortable: true,
      cell: (_, row) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-emerald-100 flex items-center justify-center">
            <span className="text-sm font-semibold text-emerald-600">
              {row.full_name?.[0]?.toUpperCase() || 'U'}
            </span>
          </div>
          <div>
            <p className="font-medium text-slate-900">{row.full_name || 'Unnamed'}</p>
            <p className="text-sm text-slate-500">{row.email}</p>
          </div>
        </div>
      )
    },
    {
      header: 'System Role',
      accessor: 'role',
      sortable: true,
      cell: (value) => (
        <Badge variant="outline" className="bg-slate-50">
          {value || 'user'}
        </Badge>
      )
    },
    {
      header: 'Coop Role',
      accessor: 'coop_role',
      sortable: true,
      cell: (value) => (
        <Badge variant="outline" className={getRoleBadgeColor(value)}>
          {ROLE_LABELS[value?.toLowerCase()] || 'Member'}
        </Badge>
      )
    },
    {
      header: 'Joined',
      accessor: 'created_date',
      sortable: true,
      cell: (value) => moment(value).format('MMM DD, YYYY')
    },
    {
      header: 'Actions',
      accessor: 'id',
      cell: (_, row) => (
        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); handleEdit(row); }}>
          <Edit className="w-4 h-4 mr-1" />
          Edit Role
        </Button>
      )
    }
  ];

  const stats = {
    total: users.length,
    admins: users.filter(u => u.coop_role === 'admin' || u.role === 'admin').length,
    staff: users.filter(u => ['manager', 'loan_officer', 'teller', 'auditor'].includes(u.coop_role)).length,
    members: users.filter(u => !u.coop_role || u.coop_role === 'member').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-500">Manage user accounts and assign cooperative roles</p>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-sm text-amber-700">
            <Mail className="w-4 h-4 inline mr-1" />
            To add new users, invite them via <strong>Dashboard → Settings → Users</strong>
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-slate-400" />
              <div>
                <p className="text-sm text-slate-500">Total Users</p>
                <p className="text-2xl font-bold text-slate-900">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Shield className="w-8 h-8 text-red-400" />
              <div>
                <p className="text-sm text-slate-500">Admins</p>
                <p className="text-2xl font-bold text-red-600">{stats.admins}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-blue-400" />
              <div>
                <p className="text-sm text-slate-500">Staff</p>
                <p className="text-2xl font-bold text-blue-600">{stats.staff}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-sm text-slate-500">Members</p>
                <p className="text-2xl font-bold text-emerald-600">{stats.members}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <DataTable
        columns={columns}
        data={users}
        isLoading={isLoading}
        searchPlaceholder="Search users..."
        emptyMessage="No users found"
      />

      {/* Edit Role Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit User Role</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <form onSubmit={handleSave} className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-lg">
                <p className="font-medium">{selectedUser.full_name}</p>
                <p className="text-sm text-slate-500">{selectedUser.email}</p>
              </div>

              <div className="space-y-2">
                <Label>Cooperative Role</Label>
                <Select value={formData.coop_role} onValueChange={(v) => setFormData({...formData, coop_role: v})}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrator</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="loan_officer">Loan Officer</SelectItem>
                    <SelectItem value="teller">Teller</SelectItem>
                    <SelectItem value="auditor">Auditor</SelectItem>
                    <SelectItem value="member">Member</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-slate-500">
                  This determines what pages and features the user can access.
                </p>
              </div>

              {formData.coop_role === 'member' && (
                <div className="space-y-2">
                  <Label>Link to Member Profile</Label>
                  <Select value={formData.member_id} onValueChange={(v) => setFormData({...formData, member_id: v})}>
                    <SelectTrigger><SelectValue placeholder="Select member..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={null}>No linked profile</SelectItem>
                      {members.map(m => (
                        <SelectItem key={m.id} value={m.id}>
                          {m.first_name} {m.last_name} ({m.member_code})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-slate-500">
                    Link this user to a member profile for self-service access.
                  </p>
                </div>
              )}

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setShowEditModal(false)}>Cancel</Button>
                <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700">Save Changes</Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}