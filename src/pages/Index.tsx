import { Header } from '@/components/layout/Header';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TaskList } from '@/components/tasks/TaskList';
import { CalendarView } from '@/components/tasks/CalendarView';
import { useTasks } from '@/contexts/TaskContext';
import QuickAdd from '@/components/tasks/QuickAdd';

const Index = () => {
  const { viewMode } = useTasks();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6 max-w-5xl mx-auto">
        {/* Bagian Judul */}
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Assignments
          </h1>
          <p className="text-muted-foreground">
            Track and manage your college tasks efficiently
          </p>
        </div>

        {/* Fitur Input Cepat (Quick Add) diletakkan di sini */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <QuickAdd />
        </section>

        {/* Statistik Tugas */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-100 fill-mode-both">
          <StatsOverview />
        </section>

        {/* Daftar Tugas atau Kalender berdasarkan View Mode */}
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200 fill-mode-both">
          {viewMode === 'list' ? <TaskList /> : <CalendarView />}
        </section>
      </main>
    </div>
  );
};

export default Index;