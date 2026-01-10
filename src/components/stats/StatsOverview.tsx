import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Clock, AlertTriangle, BookOpen } from 'lucide-react';
import { isPast } from 'date-fns';
import { useTasks } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

export function StatsOverview() {
  const { tasks } = useTasks();

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'complete').length;
    const pending = tasks.filter(t => t.status === 'pending').length;
    const overdue = tasks.filter(
      t => t.status === 'pending' && isPast(new Date(t.dueDate))
    ).length;

    return { total, completed, pending, overdue };
  }, [tasks]);

  const statCards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      icon: BookOpen,
      color: 'text-primary bg-accent',
    },
    {
      label: 'Completed',
      value: stats.completed,
      icon: CheckCircle2,
      color: 'text-status-complete bg-priority-low-bg',
    },
    {
      label: 'Pending',
      value: stats.pending,
      icon: Clock,
      color: 'text-priority-medium bg-priority-medium-bg',
    },
    {
      label: 'Overdue',
      value: stats.overdue,
      icon: AlertTriangle,
      color: 'text-priority-high bg-priority-high-bg',
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {statCards.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="rounded-xl border bg-card p-4 card-shadow"
        >
          <div className="flex items-center gap-3">
            <div className={cn('rounded-lg p-2', stat.color)}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="font-display text-2xl font-semibold">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
