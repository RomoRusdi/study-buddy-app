import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TaskDialog } from './TaskDialog';
import { useTasks } from '@/contexts/TaskContext';
import type { Task } from '@/types/task';
import { cn } from '@/lib/utils';

export function CalendarView() {
  const { tasks } = useTasks();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>();

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const calendarStart = startOfWeek(monthStart);
    const calendarEnd = endOfWeek(monthEnd);

    return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  }, [currentMonth]);

  const tasksByDate = useMemo(() => {
    const map = new Map<string, Task[]>();
    tasks.forEach(task => {
      const dateKey = format(new Date(task.dueDate), 'yyyy-MM-dd');
      const existing = map.get(dateKey) || [];
      map.set(dateKey, [...existing, task]);
    });
    return map;
  }, [tasks]);

  const selectedDateTasks = useMemo(() => {
    if (!selectedDate) return [];
    const dateKey = format(selectedDate, 'yyyy-MM-dd');
    return tasksByDate.get(dateKey) || [];
  }, [selectedDate, tasksByDate]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setIsDialogOpen(true);
  };

  const priorityDotColors = {
    low: 'bg-priority-low',
    medium: 'bg-priority-medium',
    high: 'bg-priority-high',
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between">
        <h2 className="font-display text-2xl font-semibold">
          {format(currentMonth, 'MMMM yyyy')}
        </h2>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handlePrevMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentMonth(new Date())}
          >
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={handleNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Calendar Grid */}
        <div className="lg:col-span-2">
          <div className="rounded-xl border bg-card p-4 card-shadow">
            {/* Weekday Headers */}
            <div className="mb-2 grid grid-cols-7 text-center text-sm font-medium text-muted-foreground">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map(day => {
                const dateKey = format(day, 'yyyy-MM-dd');
                const dayTasks = tasksByDate.get(dateKey) || [];
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const hasHighPriority = dayTasks.some(t => t.priority === 'high' && t.status !== 'complete');

                return (
                  <motion.button
                    key={dateKey}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedDate(day)}
                    className={cn(
                      'relative flex h-16 flex-col items-center justify-start rounded-lg p-1 transition-colors',
                      !isSameMonth(day, currentMonth) && 'opacity-40',
                      isToday(day) && 'bg-accent',
                      isSelected && 'ring-2 ring-primary',
                      'hover:bg-accent/50'
                    )}
                  >
                    <span
                      className={cn(
                        'text-sm font-medium',
                        isToday(day) && 'text-primary font-semibold'
                      )}
                    >
                      {format(day, 'd')}
                    </span>

                    {dayTasks.length > 0 && (
                      <div className="mt-1 flex gap-0.5">
                        {dayTasks.slice(0, 3).map((task, i) => (
                          <span
                            key={i}
                            className={cn(
                              'h-1.5 w-1.5 rounded-full',
                              task.status === 'complete'
                                ? 'bg-status-complete'
                                : priorityDotColors[task.priority]
                            )}
                          />
                        ))}
                        {dayTasks.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">
                            +{dayTasks.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {hasHighPriority && (
                      <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-priority-high animate-pulse-soft" />
                    )}
                  </motion.button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Date Tasks */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-medium">
              {selectedDate ? format(selectedDate, 'EEEE, MMM d') : 'Select a date'}
            </h3>
            {selectedDate && (
              <Button
                size="sm"
                onClick={() => setIsDialogOpen(true)}
                className="gap-1"
              >
                <Plus className="h-4 w-4" />
                Add
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {selectedDateTasks.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="rounded-lg border border-dashed p-6 text-center"
                >
                  <p className="text-sm text-muted-foreground">
                    {selectedDate ? 'No tasks due on this day' : 'Click a date to see tasks'}
                  </p>
                </motion.div>
              ) : (
                selectedDateTasks.map(task => (
                  <motion.div
                    key={task.id}
                    layout
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    onClick={() => handleEditTask(task)}
                    className={cn(
                      'cursor-pointer rounded-lg border bg-card p-3 transition-all hover:shadow-md',
                      task.status === 'complete' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'font-medium truncate',
                            task.status === 'complete' && 'line-through'
                          )}
                        >
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {task.course}
                        </p>
                      </div>
                      <Badge
                        variant="outline"
                        className={cn(
                          'shrink-0',
                          task.priority === 'high' && 'priority-badge-high',
                          task.priority === 'medium' && 'priority-badge-medium',
                          task.priority === 'low' && 'priority-badge-low'
                        )}
                      >
                        {task.priority}
                      </Badge>
                    </div>
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <TaskDialog
        open={isDialogOpen}
        onOpenChange={() => {
          setIsDialogOpen(false);
          setEditingTask(undefined);
        }}
        task={editingTask}
      />
    </div>
  );
}
