import { motion } from 'framer-motion';
import { ArrowLeft, Check, Moon, Sun, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useTheme } from '@/hooks/useTheme';
import { useTasks } from '@/contexts/TaskContext';
import { useNotifications } from '@/hooks/useNotifications';
import type { ThemeOption, ThemeColor } from '@/types/task';
import { cn } from '@/lib/utils';

const themeOptions: ThemeOption[] = [
  { id: 'default', name: 'Ocean Blue', primary: '#3b82f6', gradient: 'linear-gradient(135deg, #3b82f6, #8b5cf6)' },
  { id: 'ocean', name: 'Teal Wave', primary: '#14b8a6', gradient: 'linear-gradient(135deg, #14b8a6, #3b82f6)' },
  { id: 'forest', name: 'Forest Green', primary: '#22c55e', gradient: 'linear-gradient(135deg, #22c55e, #14b8a6)' },
  { id: 'sunset', name: 'Sunset Orange', primary: '#f97316', gradient: 'linear-gradient(135deg, #f97316, #eab308)' },
  { id: 'berry', name: 'Berry Pink', primary: '#ec4899', gradient: 'linear-gradient(135deg, #ec4899, #8b5cf6)' },
  { id: 'midnight', name: 'Midnight Purple', primary: '#8b5cf6', gradient: 'linear-gradient(135deg, #8b5cf6, #a855f7)' },
];

export default function Settings() {
  const { theme, setTheme, darkMode, setDarkMode } = useTheme();
  const { courses, addCourse, deleteCourse } = useTasks();
  const { notificationsEnabled, requestPermission } = useNotifications();
  const [newCourseName, setNewCourseName] = useState('');

  const handleAddCourse = () => {
    if (newCourseName.trim()) {
      const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#14b8a6'];
      addCourse({
        name: newCourseName.trim(),
        color: colors[courses.length % colors.length],
      });
      setNewCourseName('');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container flex h-16 items-center gap-4">
          <Link to="/">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="font-display text-xl font-semibold">Settings</h1>
        </div>
      </header>

      <main className="container py-8 space-y-10 max-w-2xl">
        {/* Theme Section */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Appearance</h2>
            <p className="text-muted-foreground">Customize the look and feel of your app</p>
          </div>

          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between rounded-xl border bg-card p-4 card-shadow">
            <div className="flex items-center gap-3">
              {darkMode ? (
                <Moon className="h-5 w-5 text-primary" />
              ) : (
                <Sun className="h-5 w-5 text-primary" />
              )}
              <div>
                <Label className="text-base">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark themes
                </p>
              </div>
            </div>
            <Switch checked={darkMode} onCheckedChange={setDarkMode} />
          </div>

          {/* Color Theme */}
          <div className="space-y-4">
            <Label className="text-base">Color Theme</Label>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              {themeOptions.map((option) => (
                <motion.button
                  key={option.id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setTheme(option.id)}
                  className={cn(
                    'relative flex flex-col items-center gap-3 rounded-xl border p-4 transition-all',
                    theme === option.id
                      ? 'border-primary ring-2 ring-primary ring-offset-2 ring-offset-background'
                      : 'border-border hover:border-primary/50'
                  )}
                >
                  <div
                    className="h-12 w-full rounded-lg"
                    style={{ background: option.gradient }}
                  />
                  <span className="text-sm font-medium">{option.name}</span>
                  {theme === option.id && (
                    <motion.div
                      layoutId="theme-check"
                      className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check className="h-4 w-4" />
                    </motion.div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        </section>

        {/* Notifications Section */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Notifications</h2>
            <p className="text-muted-foreground">Get reminded about upcoming deadlines</p>
          </div>

          <div className="flex items-center justify-between rounded-xl border bg-card p-4 card-shadow">
            <div>
              <Label className="text-base">Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive alerts for tasks due within 24 hours
              </p>
            </div>
            <Switch
              checked={notificationsEnabled}
              onCheckedChange={() => requestPermission()}
            />
          </div>
        </section>

        {/* Courses Section */}
        <section className="space-y-6">
          <div>
            <h2 className="font-display text-2xl font-semibold">Courses</h2>
            <p className="text-muted-foreground">Manage your course list</p>
          </div>

          <div className="space-y-3">
            {courses.map((course) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex items-center justify-between rounded-xl border bg-card p-4 card-shadow"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: course.color }}
                  />
                  <span className="font-medium">{course.name}</span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-destructive hover:text-destructive"
                  onClick={() => deleteCourse(course.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </motion.div>
            ))}

            <div className="flex gap-2">
              <Input
                placeholder="Add a new course..."
                value={newCourseName}
                onChange={(e) => setNewCourseName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddCourse()}
              />
              <Button onClick={handleAddCourse} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" />
                Add
              </Button>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="space-y-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">About</h2>
            <p className="text-muted-foreground">TaskFlow - College Task Tracker</p>
          </div>

          <div className="rounded-xl border bg-card p-4 card-shadow">
            <p className="text-sm text-muted-foreground">
              A modern, feature-rich task management app designed specifically for college students. 
              Keep track of assignments, deadlines, and priorities all in one place.
            </p>
            <p className="mt-3 text-xs text-muted-foreground">Version 1.0.0</p>
          </div>
        </section>
      </main>
    </div>
  );
}
