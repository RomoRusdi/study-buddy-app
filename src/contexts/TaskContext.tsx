import React, { createContext, useContext, useCallback, useMemo, useState, useEffect } from 'react';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { supabase } from '@/lib/supabase';
import type { Task, Course, ViewMode, SortOption, FilterStatus } from '@/types/task';
import { useAuth } from './AuthContext'; // <-- IMPORT useAuth DITAMBAHKAN DI SINI

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

export function TaskProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth(); // <-- AMBIL STATUS USER DI SINI

  // Data utama menggunakan useState
  const [tasks, setTasks] = useState<Task[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  
  // Preferensi tampilan tetap menggunakan useLocalStorage
  const [viewMode, setViewMode] = useLocalStorage<ViewMode>('view-mode', 'list');
  const [sortBy, setSortBy] = useLocalStorage<SortOption>('sort-by', 'dueDate');
  const [filterStatus, setFilterStatus] = useLocalStorage<FilterStatus>('filter-status', 'all');
  const [filterCourse, setFilterCourse] = useLocalStorage<string>('filter-course', 'all');

  // Fetch data dari Supabase saat aplikasi dimuat atau status login (user) berubah
  useEffect(() => {
    // KUNCI PERBAIKAN: Jika user belum login atau baru logout, kosongkan data dan hentikan fetch
    if (!user) {
      setTasks([]);
      setCourses([]);
      return;
    }

    const fetchData = async () => {
      // Ambil data Tasks
      const { data: tasksData, error: tasksError } = await supabase.from('tasks').select('*');
      if (tasksData && !tasksError) {
        // Konversi string ISO dari database kembali menjadi object Date untuk UI
        const formattedTasks: Task[] = tasksData.map((t: any) => ({
          ...t,
          dueDate: new Date(t.dueDate),
          createdAt: new Date(t.createdAt)
        }));
        setTasks(formattedTasks);
      } else if (tasksError) {
        console.error('Error fetching tasks:', tasksError);
      }

      // Ambil data Courses
      const { data: coursesData, error: coursesError } = await supabase.from('courses').select('*');
      if (coursesData && !coursesError) {
        setCourses(coursesData as Course[]);
      } else if (coursesError) {
        console.error('Error fetching courses:', coursesError);
      }
    };

    fetchData();
  }, [user]); // <-- KUNCI PERBAIKAN: Tambahkan 'user' ke dalam dependency array

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'createdAt'>) => {
    const newId = crypto.randomUUID();
    const now = new Date();
    
    // Siapkan data untuk dimasukkan ke state UI lokal (tipe Date)
    const newTaskForState: Task = {
      ...task,
      id: newId,
      createdAt: now,
    };

    // Siapkan data untuk dikirim ke Supabase (tipe string ISO)
    const newTaskForDB = {
      ...task,
      id: newId,
      createdAt: now.toISOString(),
      dueDate: task.dueDate instanceof Date ? task.dueDate.toISOString() : task.dueDate
    };

    const { error } = await supabase.from('tasks').insert([newTaskForDB]);
    
    if (!error) {
      setTasks(prev => [...prev, newTaskForState]);
    } else {
      console.error('Error adding task:', error);
    }
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    // Siapkan update untuk DB (konversi date ke string jika ada)
    const dbUpdates: any = { ...updates };
    if (updates.dueDate && updates.dueDate instanceof Date) {
      dbUpdates.dueDate = updates.dueDate.toISOString();
    }
    if (updates.createdAt && updates.createdAt instanceof Date) {
      dbUpdates.createdAt = updates.createdAt.toISOString();
    }

    const { error } = await supabase.from('tasks').update(dbUpdates).eq('id', id);

    if (!error) {
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } else {
      console.error('Error updating task:', error);
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    
    if (!error) {
      setTasks(prev => prev.filter(task => task.id !== id));
    } else {
      console.error('Error deleting task:', error);
    }
  }, []);

  const toggleTaskStatus = useCallback(async (id: string) => {
    const task = tasks.find(t => t.id === id);
    if (!task) return;
    
    const newStatus = task.status === 'complete' ? 'pending' : 'complete';
    
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', id);

    if (!error) {
      setTasks(prev => prev.map(t => 
        t.id === id ? { ...t, status: newStatus } : t
      ));
    } else {
      console.error('Error toggling task status:', error);
    }
  }, [tasks]);

  const addCourse = useCallback(async (course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      ...course,
      id: crypto.randomUUID(),
    };

    const { error } = await supabase.from('courses').insert([newCourse]);

    if (!error) {
      setCourses(prev => [...prev, newCourse]);
    } else {
      console.error('Error adding course:', error);
    }
  }, []);

  const deleteCourse = useCallback(async (id: string) => {
    const { error } = await supabase.from('courses').delete().eq('id', id);

    if (!error) {
      setCourses(prev => prev.filter(course => course.id !== id));
    } else {
      console.error('Error deleting course:', error);
    }
  }, []);

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