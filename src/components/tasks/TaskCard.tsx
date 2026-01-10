import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, Clock, Trash2, Edit2 } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Task } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleTaskStatus, deleteTask } = useTasks();

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'complete';
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);

  const getDueDateLabel = () => {
    if (isDueToday) return 'Today';
    if (isDueTomorrow) return 'Tomorrow';
    return format(dueDate, 'MMM d, yyyy');
  };

  const priorityClasses = {
    low: 'priority-badge-low',
    medium: 'priority-badge-medium',
    high: 'priority-badge-high',
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className={cn(
        'group relative rounded-xl border bg-card p-4 transition-all card-shadow hover:card-shadow-lg',
        task.status === 'complete' && 'opacity-60'
      )}
    >
      <div className="flex gap-4">
        <div className="pt-1">
          <Checkbox
            checked={task.status === 'complete'}
            onCheckedChange={() => toggleTaskStatus(task.id)}
            className="h-5 w-5 rounded-full border-2"
          />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <h3
                className={cn(
                  'font-medium text-foreground truncate',
                  task.status === 'complete' && 'line-through text-muted-foreground'
                )}
              >
                {task.title}
              </h3>
              <p className="text-sm text-muted-foreground mt-0.5">{task.course}</p>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(task)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive"
                onClick={() => deleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {task.description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {task.description}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Badge variant="outline" className={priorityClasses[task.priority]}>
              {task.priority}
            </Badge>

            <div
              className={cn(
                'flex items-center gap-1 text-xs',
                isOverdue ? 'text-destructive' : isDueToday ? 'text-priority-medium' : 'text-muted-foreground'
              )}
            >
              {isOverdue ? (
                <Clock className="h-3.5 w-3.5" />
              ) : (
                <Calendar className="h-3.5 w-3.5" />
              )}
              <span>{isOverdue ? 'Overdue' : getDueDateLabel()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
