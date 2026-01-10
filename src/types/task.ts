export type Priority = 'low' | 'medium' | 'high';

export type TaskStatus = 'pending' | 'complete';

export interface Task {
  id: string;
  title: string;
  course: string;
  dueDate: Date;
  priority: Priority;
  description: string;
  status: TaskStatus;
  createdAt: Date;
  tags?: string[];
}

export interface Course {
  id: string;
  name: string;
  color: string;
}

export type ViewMode = 'list' | 'calendar';

export type SortOption = 'dueDate' | 'priority' | 'title' | 'course';

export type FilterStatus = 'all' | 'pending' | 'complete';

export type ThemeColor = 'default' | 'ocean' | 'forest' | 'sunset' | 'berry' | 'midnight';

export interface ThemeOption {
  id: ThemeColor;
  name: string;
  primary: string;
  gradient: string;
}
