import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Layers, 
  Database, 
  Shield, 
  Users, 
  Wallet, 
  PiggyBank, 
  Receipt, 
  FileText,
  Settings,
  Eye,
  Monitor,
  Server,
  Cloud,
  Lock,
  CheckCircle,
  ArrowDown,
  ArrowRight
} from 'lucide-react';

export default function SystemArchitecture() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Architecture</h1>
        <p className="text-slate-500">CoopMIS Technical Architecture & Design</p>
      </div>

      {/* Architecture Diagram */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-emerald-600" />
            System Layers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Presentation Layer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              <h3 className="text-lg font-semibold text-slate-900">Presentation Layer</h3>
              <span className="text-sm text-slate-500">(React Frontend)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-7">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Layout System</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• Role-based Navigation</li>
                  <li>• Sidebar & Header</li>
                  <li>• User Profile</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Pages (14)</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• 6 Role Dashboards</li>
                  <li>• Members, Loans, Savings</li>
                  <li>• Transactions, Reports, Audit</li>
                  <li>• Users, Settings</li>
                </ul>
              </div>
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="font-medium text-blue-900">Components</p>
                <ul className="text-sm text-blue-700 mt-2 space-y-1">
                  <li>• DataTable, KPICard</li>
                  <li>• Charts (Recharts)</li>
                  <li>• RoleGuard, StatusBadge</li>
                  <li>• shadcn/ui Library</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>

          {/* Application Layer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Server className="w-5 h-5 text-purple-600" />
              <h3 className="text-lg font-semibold text-slate-900">Application Layer</h3>
              <span className="text-sm text-slate-500">(Base44 SDK)</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pl-7">
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium text-purple-900">Authentication API</p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• base44.auth.me()</li>
                  <li>• base44.auth.updateMe()</li>
                  <li>• base44.auth.logout()</li>
                  <li>• JWT tokens</li>
                </ul>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium text-purple-900">Entities API</p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• list(), filter()</li>
                  <li>• create(), update()</li>
                  <li>• delete(), schema()</li>
                  <li>• CRUD operations</li>
                </ul>
              </div>
              <div className="p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="font-medium text-purple-900">Integrations API</p>
                <ul className="text-sm text-purple-700 mt-2 space-y-1">
                  <li>• InvokeLLM (AI)</li>
                  <li>• UploadFile</li>
                  <li>• SendEmail</li>
                  <li>• GenerateImage</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <ArrowDown className="w-6 h-6 text-slate-400" />
          </div>

          {/* Data Layer */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-emerald-600" />
              <h3 className="text-lg font-semibold text-slate-900">Data Layer</h3>
              <span className="text-sm text-slate-500">(Base44 Entity Storage)</span>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pl-7">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">User</p>
                <p className="text-xs text-emerald-700">Extended built-in</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Users className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">Member</p>
                <p className="text-xs text-emerald-700">Profile + KYC</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">LoanType</p>
                <p className="text-xs text-emerald-700">Products config</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Wallet className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">Loan</p>
                <p className="text-xs text-emerald-700">Applications</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <PiggyBank className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">SavingsAccount</p>
                <p className="text-xs text-emerald-700">Balances + interest</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Receipt className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">Transaction</p>
                <p className="text-xs text-emerald-700">Financial activity</p>
              </div>
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                <Shield className="w-5 h-5 text-emerald-600 mb-2" />
                <p className="font-medium text-emerald-900 text-sm">AuditLog</p>
                <p className="text-xs text-emerald-700">System tracking</p>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                <Database className="w-5 h-5 text-slate-600 mb-2" />
                <p className="font-medium text-slate-900 text-sm">MongoDB</p>
                <p className="text-xs text-slate-700">Document store</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RBAC Matrix */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-emerald-600" />
            Role-Based Access Control (RBAC)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold text-slate-900">Role</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Dashboard</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Members</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Loans</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Savings</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Reports</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Audit</th>
                  <th className="px-4 py-3 text-center font-semibold text-slate-900">Users</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                <tr>
                  <td className="px-4 py-3 font-medium text-red-700">Admin</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-purple-700">Manager</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-blue-700">Loan Officer</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center text-slate-400">View</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-emerald-700">Teller</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center text-slate-400">View</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-amber-700">Auditor</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center text-slate-400">View</td>
                  <td className="px-4 py-3 text-center text-slate-400">View</td>
                  <td className="px-4 py-3 text-center text-slate-400">View</td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center"><CheckCircle className="w-4 h-4 text-green-600 mx-auto" /></td>
                  <td className="px-4 py-3 text-center">—</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-medium text-slate-700">Member</td>
                  <td className="px-4 py-3 text-center text-slate-400">Portal</td>
                  <td className="px-4 py-3 text-center text-slate-400">Own</td>
                  <td className="px-4 py-3 text-center text-slate-400">Own</td>
                  <td className="px-4 py-3 text-center text-slate-400">Own</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                  <td className="px-4 py-3 text-center">—</td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Technology Stack */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Monitor className="w-5 h-5 text-blue-600" />
              Frontend Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>React 18</strong> - UI library</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>Tailwind CSS</strong> - styling</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>shadcn/ui</strong> - component library</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>TanStack Query</strong> - data fetching</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>React Router</strong> - routing</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>Recharts</strong> - data visualization</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-600"></div>
                <span><strong>Lucide React</strong> - icons</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cloud className="w-5 h-5 text-purple-600" />
              Backend Stack
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>Base44 Platform</strong> - BaaS</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>MongoDB</strong> - database</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>JWT Auth</strong> - authentication</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>File Storage</strong> - S3-compatible</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>AI Integration</strong> - LLM API</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>Email Service</strong> - built-in</span>
              </li>
              <li className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-purple-600"></div>
                <span><strong>CDN</strong> - automatic</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Key Features */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-emerald-600" />
            Core Features
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
              <Users className="w-6 h-6 text-blue-600 mb-2" />
              <h4 className="font-semibold text-blue-900">Member Management</h4>
              <p className="text-sm text-blue-700 mt-1">CRUD, KYC, documents, beneficiaries</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-lg">
              <Wallet className="w-6 h-6 text-emerald-600 mb-2" />
              <h4 className="font-semibold text-emerald-900">Loan Processing</h4>
              <p className="text-sm text-emerald-700 mt-1">Calculator, AI analyzer, amortization</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
              <PiggyBank className="w-6 h-6 text-purple-600 mb-2" />
              <h4 className="font-semibold text-purple-900">Savings Accounts</h4>
              <p className="text-sm text-purple-700 mt-1">Multiple types, interest, balances</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-lg">
              <Receipt className="w-6 h-6 text-amber-600 mb-2" />
              <h4 className="font-semibold text-amber-900">Transactions</h4>
              <p className="text-sm text-amber-700 mt-1">Deposits, withdrawals, payments</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-pink-50 to-pink-100 rounded-lg">
              <FileText className="w-6 h-6 text-pink-600 mb-2" />
              <h4 className="font-semibold text-pink-900">Reports & Analytics</h4>
              <p className="text-sm text-pink-700 mt-1">Charts, export, custom reports</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
              <Shield className="w-6 h-6 text-red-600 mb-2" />
              <h4 className="font-semibold text-red-900">Audit & Compliance</h4>
              <p className="text-sm text-red-700 mt-1">Activity logs, change tracking</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-lg">
              <Users className="w-6 h-6 text-indigo-600 mb-2" />
              <h4 className="font-semibold text-indigo-900">User Management</h4>
              <p className="text-sm text-indigo-700 mt-1">Role assignment, permissions</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-slate-50 to-slate-100 rounded-lg">
              <Settings className="w-6 h-6 text-slate-600 mb-2" />
              <h4 className="font-semibold text-slate-900">System Settings</h4>
              <p className="text-sm text-slate-700 mt-1">Loan types, rates, notifications</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Features */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-red-600" />
            Security Architecture
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Authentication</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• JWT-based auth</li>
                <li>• Session management</li>
                <li>• Secure logout</li>
              </ul>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Authorization</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Role-based access (RBAC)</li>
                <li>• RoleGuard component</li>
                <li>• Permission checks</li>
              </ul>
            </div>
            <div className="p-4 border border-slate-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-2">Audit Trail</h4>
              <ul className="text-sm text-slate-600 space-y-1">
                <li>• Activity logging</li>
                <li>• Change history</li>
                <li>• IP tracking</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}