import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Settings, Calendar, ListTodo, Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTasks } from '@/contexts/TaskContext';
import { useNotifications } from '@/hooks/useNotifications';

export function Header() {
  const location = useLocation();
  const { viewMode, setViewMode, tasks } = useTasks();
  const { notificationsEnabled, requestPermission } = useNotifications();

  const pendingCount = tasks.filter(t => t.status === 'pending').length;

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <motion.div
            whileHover={{ rotate: 10 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl gradient-hero"
          >
            <BookOpen className="h-5 w-5 text-primary-foreground" />
          </motion.div>
          <div>
            <h1 className="font-display text-lg font-semibold text-foreground">TaskFlow</h1>
            <p className="text-xs text-muted-foreground">{pendingCount} tasks pending</p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          {location.pathname === '/' && (
            <div className="flex rounded-lg bg-secondary p-1">
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${viewMode === 'list' ? 'bg-background shadow-sm' : ''}`}
                onClick={() => setViewMode('list')}
              >
                <ListTodo className="h-4 w-4" />
                <span className="hidden sm:inline">List</span>
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`gap-2 ${viewMode === 'calendar' ? 'bg-background shadow-sm' : ''}`}
                onClick={() => setViewMode('calendar')}
              >
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={requestPermission}
            className={notificationsEnabled ? 'text-primary' : 'text-muted-foreground'}
          >
            <Bell className="h-5 w-5" />
          </Button>

          <Link to="/settings">
            <Button variant="ghost" size="icon">
              <Settings className="h-5 w-5" />
            </Button>
          </Link>
        </nav>
      </div>
    </header>
  );
}
