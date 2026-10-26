import { lazy, Suspense } from 'react';
import { Route, Routes } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute, { GuestRoute } from './ProtectedRoute';
import AdminRoute from './AdminRoute';
import { PageLoader } from '../components/common/States';

const page = (loader) => lazy(loader);

// Public
const HomePage = page(() => import('../pages/public/HomePage'));
const BuyPropertiesPage = page(() => import('../pages/public/BuyPropertiesPage'));
const RentPropertiesPage = page(() => import('../pages/public/RentPropertiesPage'));
const PropertyDetailsPage = page(() => import('../pages/public/PropertyDetailsPage'));
const SellPage = page(() => import('../pages/public/SellPage'));
const AgentsPage = page(() => import('../pages/public/AgentsPage'));
const AgentDetailsPage = page(() => import('../pages/public/AgentDetailsPage'));
const AboutPage = page(() => import('../pages/public/AboutPage'));
const ContactPage = page(() => import('../pages/public/ContactPage'));
const FAQPage = page(() => import('../pages/public/FAQPage'));
const NotFoundPage = page(() => import('../pages/public/NotFoundPage'));
const PrivacyPolicyPage = page(() => import('../pages/legal/PrivacyPolicyPage'));
const TermsPage = page(() => import('../pages/legal/TermsPage'));

// Auth
const LoginPage = page(() => import('../pages/auth/LoginPage'));
const RegisterPage = page(() => import('../pages/auth/RegisterPage'));
const ForgotPasswordPage = page(() => import('../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = page(() => import('../pages/auth/ResetPasswordPage'));
const VerifyEmailPage = page(() => import('../pages/auth/VerifyEmailPage'));

// User dashboard
const UserDashboardPage = page(() => import('../pages/user/UserDashboardPage'));
const MyPropertiesPage = page(() => import('../pages/user/MyPropertiesPage'));
const CreatePropertyPage = page(() => import('../pages/user/CreatePropertyPage'));
const EditPropertyPage = page(() => import('../pages/user/EditPropertyPage'));
const FavoritesPage = page(() => import('../pages/user/FavoritesPage'));
const MyInquiriesPage = page(() => import('../pages/user/MyInquiriesPage'));
const ProfilePage = page(() => import('../pages/user/ProfilePage'));
const ChangePasswordPage = page(() => import('../pages/user/ChangePasswordPage'));

// Admin
const AdminDashboardPage = page(() => import('../pages/admin/AdminDashboardPage'));
const AdminPropertiesPage = page(() => import('../pages/admin/AdminPropertiesPage'));
const AdminEditPropertyPage = page(() => import('../pages/admin/AdminEditPropertyPage'));
const AdminUsersPage = page(() => import('../pages/admin/AdminUsersPage'));
const AdminInquiriesPage = page(() => import('../pages/admin/AdminInquiriesPage'));
const AdminCategoriesPage = page(() => import('../pages/admin/AdminCategoriesPage'));
const AdminTestimonialsPage = page(() => import('../pages/admin/AdminTestimonialsPage'));
const AdminNewsletterPage = page(() => import('../pages/admin/AdminNewsletterPage'));
const AdminSettingsPage = page(() => import('../pages/admin/AdminSettingsPage'));

export default function AppRouter() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="buy" element={<BuyPropertiesPage />} />
          <Route path="rent" element={<RentPropertiesPage />} />
          <Route path="properties/:slug" element={<PropertyDetailsPage />} />
          <Route path="sell" element={<SellPage />} />
          <Route path="agents" element={<AgentsPage />} />
          <Route path="agents/:id" element={<AgentDetailsPage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="contact" element={<ContactPage />} />
          <Route path="faq" element={<FAQPage />} />
          <Route path="privacy" element={<PrivacyPolicyPage />} />
          <Route path="terms" element={<TermsPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route element={<GuestRoute />}>
            <Route path="login" element={<LoginPage />} />
            <Route path="register" element={<RegisterPage />} />
          </Route>
          <Route path="forgot-password" element={<ForgotPasswordPage />} />
          <Route path="reset-password" element={<ResetPasswordPage />} />
          <Route path="verify-email" element={<VerifyEmailPage />} />
        </Route>

        <Route element={<ProtectedRoute />}>
          <Route path="dashboard" element={<DashboardLayout />}>
            <Route index element={<UserDashboardPage />} />
            <Route path="properties" element={<MyPropertiesPage />} />
            <Route path="properties/new" element={<CreatePropertyPage />} />
            <Route path="properties/:id/edit" element={<EditPropertyPage />} />
            <Route path="favorites" element={<FavoritesPage />} />
            <Route path="inquiries" element={<MyInquiriesPage />} />
            <Route path="profile" element={<ProfilePage />} />
            <Route path="password" element={<ChangePasswordPage />} />
          </Route>
        </Route>

        <Route element={<AdminRoute />}>
          <Route path="admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="properties" element={<AdminPropertiesPage />} />
            <Route path="properties/:id/edit" element={<AdminEditPropertyPage />} />
            <Route path="users" element={<AdminUsersPage />} />
            <Route path="inquiries" element={<AdminInquiriesPage />} />
            <Route path="categories" element={<AdminCategoriesPage />} />
            <Route path="testimonials" element={<AdminTestimonialsPage />} />
            <Route path="newsletter" element={<AdminNewsletterPage />} />
            <Route path="settings" element={<AdminSettingsPage />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
}
