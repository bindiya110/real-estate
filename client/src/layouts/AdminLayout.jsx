import { Building2, LayoutDashboard, Mail, MessageSquare, Quote, Settings, Tag, UserCog, Users } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '../components/dashboard/DashboardShell';
import adminService from '../services/adminService';
import queryKeys from '../hooks/queryKeys';

export default function AdminLayout() {
  const { data } = useQuery({ queryKey: queryKeys.admin.dashboard, queryFn: adminService.dashboard, staleTime: 60_000 });
  const totals = data?.data?.totals;

  const nav = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { section: 'Manage' },
    { to: '/admin/properties', label: 'Properties', icon: Building2, badge: totals?.pending },
    { to: '/admin/users', label: 'Users', icon: Users },
    { to: '/admin/inquiries', label: 'Inquiries & messages', icon: MessageSquare, badge: totals?.newMessages },
    { section: 'Content' },
    { to: '/admin/categories', label: 'Categories', icon: Tag },
    { to: '/admin/testimonials', label: 'Testimonials', icon: Quote },
    { to: '/admin/newsletter', label: 'Newsletter', icon: Mail },
    { to: '/admin/settings', label: 'Site settings', icon: Settings },
  ];

  return <DashboardShell title="Administration" nav={nav} footerLink={{ to: '/dashboard', label: 'My dashboard', icon: UserCog }} />;
}
