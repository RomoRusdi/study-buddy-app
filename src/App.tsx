import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TaskProvider, useTasks } from "./contexts/TaskContext";
import { useNotifications } from "./hooks/useNotifications"; // <-- Import ini
import Index from "./pages/Index";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

// Komponen baru untuk menjalankan notifikasi
function NotificationManager() {
  const { tasks } = useTasks();
  const { checkUpcomingDeadlines, requestPermission } = useNotifications();

  useEffect(() => {
    requestPermission();
  }, [requestPermission]);

  useEffect(() => {
    if (tasks.length === 0) return;
    
    // Cek saat pertama kali dibuka
    checkUpcomingDeadlines(tasks);
    
    // Cek berkala setiap 1 jam
    const intervalId = setInterval(() => {
      checkUpcomingDeadlines(tasks);
    }, 60 * 60 * 1000); 

    return () => clearInterval(intervalId);
  }, [tasks, checkUpcomingDeadlines]);

  return null; // Komponen ini tidak menampilkan apa-apa di layar
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TaskProvider>
      {/* Masukkan NotificationManager di dalam TaskProvider */}
      <NotificationManager /> 
      
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </TaskProvider>
  </QueryClientProvider>
);

export default App;