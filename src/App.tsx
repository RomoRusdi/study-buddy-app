import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { TaskProvider, useTasks } from "./contexts/TaskContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { useNotifications } from "./hooks/useNotifications";
import { useTheme } from "./hooks/useTheme"; // <-- 1. Import useTheme
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";

const queryClient = new QueryClient();

// Komponen baru: Menjalankan logika tema di seluruh aplikasi saat dimuat
function ThemeManager() {
  useTheme();
  return null;
}

// Komponen menjalankan notifikasi
function NotificationManager() {
  const { tasks } = useTasks();
  const { checkUpcomingDeadlines, requestPermission, notificationsEnabled } = useNotifications();

  // Minta izin notifikasi saat pertama kali dibuka
  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  // Cek deadline saat tasks berubah ATAU saat notifikasi baru diaktifkan
  // notificationsEnabled dimasukkan ke deps agar cek diulang setelah izin diberikan
  useEffect(() => {
    if (tasks.length === 0) return;

    checkUpcomingDeadlines(tasks);

    // Cek setiap 30 menit (lebih sering dari sebelumnya yang 1 jam)
    const intervalId = setInterval(() => {
      checkUpcomingDeadlines(tasks);
    }, 30 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [tasks, checkUpcomingDeadlines, notificationsEnabled]);

  return null;
}

// Komponen memproteksi route
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TaskProvider>
        {/* 2. Sisipkan ThemeManager di sini agar tema langsung diproses tanpa terlihat UI-nya */}
        <ThemeManager />
        <NotificationManager /> 
        
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              
              <Route 
                path="/" 
                element={
                  <ProtectedRoute>
                    <Index />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/settings" 
                element={
                  <ProtectedRoute>
                    <Settings />
                  </ProtectedRoute>
                } 
              />
              
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </TaskProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;