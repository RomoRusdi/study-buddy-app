import { motion } from 'framer-motion';
import { format, isToday, isTomorrow, isPast } from 'date-fns';
import { Calendar, Clock, Trash2, Edit2, AlertTriangle, CheckSquare } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import type { Task } from '@/types/task';
import { useTasks } from '@/contexts/TaskContext';
import { cn } from '@/lib/utils';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
}

export function TaskCard({ task, onEdit }: TaskCardProps) {
  const { toggleTaskStatus, deleteTask, toggleSubtask } = useTasks();

  const dueDate = new Date(task.dueDate);
  const isOverdue = isPast(dueDate) && task.status !== 'complete';
  const isDueToday = isToday(dueDate);
  const isDueTomorrow = isTomorrow(dueDate);

  const subtasks = task.subtasks ?? [];
  const completedSubtasks = subtasks.filter(s => s.completed).length;
  const subtaskProgress = subtasks.length > 0 ? (completedSubtasks / subtasks.length) * 100 : 0;

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
        'group relative rounded-xl border bg-card transition-all card-shadow hover:card-shadow-lg overflow-hidden',
        task.status === 'complete' && 'opacity-60',
        isOverdue && 'border-destructive/50'
      )}
    >
      {/* Overdue: garis merah di sisi kiri */}
      {isOverdue && (
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-destructive rounded-l-xl" />
      )}

      <div className={cn('p-4', isOverdue && 'pl-5')}>
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

            {/* Badge baris bawah */}
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={priorityClasses[task.priority]}>
                {task.priority}
              </Badge>

              {/* Overdue badge yang lebih mencolok */}
              {isOverdue ? (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Overdue
                </Badge>
              ) : (
                <div
                  className={cn(
                    'flex items-center gap-1 text-xs',
                    isDueToday ? 'text-priority-medium' : 'text-muted-foreground'
                  )}
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>{getDueDateLabel()}</span>
                </div>
              )}

              {/* Ikon subtask jika ada */}
              {subtasks.length > 0 && (
                <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                  <CheckSquare className="h-3.5 w-3.5" />
                  <span>{completedSubtasks}/{subtasks.length}</span>
                </div>
              )}
            </div>

            {/* Subtask checklist */}
            {subtasks.length > 0 && (
              <div className="mt-3 space-y-2">
                {/* Progress bar */}
                <Progress value={subtaskProgress} className="h-1.5" />

                {/* Daftar subtask */}
                <div className="space-y-1.5">
                  {subtasks.map(subtask => (
                    <div
                      key={subtask.id}
                      className="flex items-center gap-2 cursor-pointer group/sub"
                      onClick={() => toggleSubtask(task.id, subtask.id)}
                    >
                      <Checkbox
                        checked={subtask.completed}
                        onCheckedChange={() => toggleSubtask(task.id, subtask.id)}
                        className="h-3.5 w-3.5 shrink-0"
                        onClick={e => e.stopPropagation()}
                      />
                      <span
                        className={cn(
                          'text-xs transition-colors',
                          subtask.completed
                            ? 'line-through text-muted-foreground'
                            : 'text-foreground group-hover/sub:text-primary'
                        )}
                      >
                        {subtask.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
