import Dashboard from './pages/Dashboard';
import Members from './pages/Members';
import Loans from './pages/Loans';
import Savings from './pages/Savings';
import Transactions from './pages/Transactions';
import Reports from './pages/Reports';
import AuditLogs from './pages/AuditLogs';
import Settings from './pages/Settings';
import MemberPortal from './pages/MemberPortal';
import TellerDashboard from './pages/TellerDashboard';
import LoanOfficerDashboard from './pages/LoanOfficerDashboard';
import ManagerDashboard from './pages/ManagerDashboard';
import AuditorDashboard from './pages/AuditorDashboard';
import UserManagement from './pages/UserManagement';
import SystemArchitecture from './pages/SystemArchitecture';
import __Layout from './Layout.jsx';


export const PAGES = {
    "Dashboard": Dashboard,
    "Members": Members,
    "Loans": Loans,
    "Savings": Savings,
    "Transactions": Transactions,
    "Reports": Reports,
    "AuditLogs": AuditLogs,
    "Settings": Settings,
    "MemberPortal": MemberPortal,
    "TellerDashboard": TellerDashboard,
    "LoanOfficerDashboard": LoanOfficerDashboard,
    "ManagerDashboard": ManagerDashboard,
    "AuditorDashboard": AuditorDashboard,
    "UserManagement": UserManagement,
    "SystemArchitecture": SystemArchitecture,
}

export const pagesConfig = {
    mainPage: "Dashboard",
    Pages: PAGES,
    Layout: __Layout,
};