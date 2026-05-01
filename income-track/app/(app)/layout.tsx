import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { Header } from '@/components/layout/Header';
import { BottomNav } from '@/components/layout/BottomNav';
import { Sidebar } from '@/components/layout/Sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <Header className="lg:hidden" />
            <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
              {children}
            </main>
          </div>
        </div>
        <BottomNav />
      </div>
    </ProtectedRoute>
  );
}
