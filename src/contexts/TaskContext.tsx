import React, { createContext, useContext, useCallback, useMemo } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import type { Task, Course, ViewMode, SortOption, FilterStatus } from '@/types/task';

interface TaskContextType {
  tasks: Task[];
  courses: Course[];
  viewMode: ViewMode;
  sortBy: SortOption;
  filterStatus: FilterStatus;
  filterCourse: string;
  addTask: (task: Omit<Task, 'id' | 'createdAt'>) => void;
  updateTask: (id: string, updates: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  toggleTaskStatus: (id: string) => void;
  addCourse: (course: Omit<Course, 'id'>) => void;
  deleteCourse: (id: string) => void;
  setViewMode: (mode: ViewMode) => void;
  setSortBy: (sort: SortOption) => void;
  setFilterStatus: (status: FilterStatus) => void;
  setFilterCourse: (course: string) => void;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

const defaultCourses: Course[] = [
  { id: '1', name: 'Mathematics', color: '#3b82f6' },
  { id: '2', name: 'Computer Science', color: '#10b981' },
  { id: '3', name: 'Physics', color: '#f59e0b' },
  { id: '4', name: 'English', color: '#ec4899' },
];

const sampleTasks: Task[] = [
  {
    id: '1',
    title: 'Calculus Problem Set 5',
    course: 'Mathematics',
    dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    priority: 'high',
    description: 'Complete problems 1-20 from Chapter 5. Focus on integration techniques.',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '2',
    title: 'Programming Assignment: Sorting Algorithms',
    course: 'Computer Science',
    dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    priority: 'medium',
    description: 'Implement quicksort and mergesort in Python. Include time complexity analysis.',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '3',
    title: 'Lab Report: Pendulum Experiment',
    course: 'Physics',
    dueDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
    priority: 'high',
    description: 'Write up findings from pendulum period measurements. Include error analysis.',
    status: 'pending',
    createdAt: new Date(),
  },
  {
    id: '4',
    title: 'Essay Draft: Shakespeare Analysis',
    course: 'English',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    priority: 'low',
    description: 'First draft of 1500-word essay on themes in Hamlet.',
    status: 'complete',
    createdAt: new Date(),
  },
];

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>('college-tasks', sampleTasks);
  const [courses, setCourses] = useLocalStorage<Course[]>('college-courses', defaultCourses);
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('view-mode', 'list');
  const [sortBy, setSortBy] = useLocalStorage<SortOption>('sort-by', 'dueDate');
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('filter-status', 'all');
  const [filterCourse, setFilterCourse] = useLocalStorage<string>('filter-course', 'all');

  const addTask = useCallback((task: Omit<Task, 'id' | 'createdAt'>) => {
    const newTask: Task = {
      ...task,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTasks(prev => [...prev, newTask]);
  }, [setTasks]);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setTasks(prev => prev.map(task => 
      task.id === id ? { ...task, ...updates } : task
    ));
  }, [setTasks]);

  const deleteTask = useCallback((id: string) => {
    setTasks(prev => prev.filter(task => task.id !== id));
  }, [setTasks]);

  const toggleTaskStatus = useCallback((id: string) => {
    setTasks(prev => prev.map(task => 
      task.id === id 
        ? { ...task, status: task.status === 'complete' ? 'pending' : 'complete' }
        : task
    ));
  }, [setTasks]);

  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
    };
    setCourses(prev => [...prev, newCourse]);
  }, [setCourses]);

  const deleteCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  }, [setCourses]);

  const value = useMemo(() => ({
    tasks,
    courses,
    viewMode,
    sortBy,
    filterStatus,
    filterCourse,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskStatus,
    addCourse,
    deleteCourse,
    setViewMode,
    setSortBy,
    setFilterStatus,
    setFilterCourse,
  }), [tasks, courses, viewMode, sortBy, filterStatus, filterCourse, addTask, updateTask, deleteTask, toggleTaskStatus, addCourse, deleteCourse, setViewMode, setSortBy, setFilterStatus, setFilterCourse]);

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TaskProvider');
  }
  return context;
}
