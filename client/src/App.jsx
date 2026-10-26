import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import AppRouter from './routes/AppRouter';
import ScrollToTop from './components/common/ScrollToTop';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      // Don't retry client errors (4xx); retry transient failures once.
      retry: (count, error) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return count < 1;
      },
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <ScrollToTop />
          <AppRouter />
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 3500,
              style: { borderRadius: '10px', background: '#15233f', color: '#fff', fontSize: '14px' },
              success: { iconTheme: { primary: '#34d399', secondary: '#15233f' } },
              error: { iconTheme: { primary: '#f87171', secondary: '#15233f' } },
            }}
          />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
