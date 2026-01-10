import { Header } from '@/components/layout/Header';
import { StatsOverview } from '@/components/stats/StatsOverview';
import { TaskList } from '@/components/tasks/TaskList';
import { CalendarView } from '@/components/tasks/CalendarView';
import { useTasks } from '@/contexts/TaskContext';

const Index = () => {
  const { viewMode } = useTasks();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-6 space-y-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl font-bold text-foreground">
            My Assignments
          </h1>
          <p className="text-muted-foreground">
            Track and manage your college tasks efficiently
          </p>
        </div>

        <StatsOverview />

        {viewMode === 'list' ? <TaskList /> : <CalendarView />}
      </main>
    </div>
  );
};

export default Index;
