import { Building2, CirclePlus, Heart, KeyRound, LayoutDashboard, MessageSquare, Shield, User } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import DashboardShell from '../components/dashboard/DashboardShell';
import { useAuth } from '../context/AuthContext';
import inquiryService from '../services/inquiryService';
import queryKeys from '../hooks/queryKeys';

export default function DashboardLayout() {
  const { isAdmin } = useAuth();
  const params = { box: 'received', limit: 1 };
  const { data } = useQuery({ queryKey: queryKeys.my.inquiries(params), queryFn: () => inquiryService.mine(params), staleTime: 60_000 });

  const nav = [
    { to: '/dashboard', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/dashboard/properties', label: 'My properties', icon: Building2, end: true },
    { to: '/dashboard/properties/new', label: 'Add listing', icon: CirclePlus },
    { to: '/dashboard/favorites', label: 'Favorites', icon: Heart },
    { to: '/dashboard/inquiries', label: 'Inquiries', icon: MessageSquare, badge: data?.meta?.unread },
    { section: 'Account' },
    { to: '/dashboard/profile', label: 'Profile', icon: User },
    { to: '/dashboard/password', label: 'Change password', icon: KeyRound },
  ];

  return (
    <DashboardShell
      title="My dashboard"
      nav={nav}
      footerLink={isAdmin ? { to: '/admin', label: 'Admin panel', icon: Shield } : undefined}
    />
  );
}
