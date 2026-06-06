export type TaskCategory = 'work' | 'personal' | 'health' | 'learning' | 'home';
export type TaskPriority = 'high' | 'med' | 'low';

export type Subtask = {
  id: string;
  title: string;
  done: boolean;
};

export type Task = {
  id: string;
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
  date: string;
  time: string;
  notes: string;
  done: boolean;
  starred: boolean;
  subtasks: Subtask[];
};

export type CreateTaskDto = {
  title: string;
  category: TaskCategory;
  priority: TaskPriority;
};

export type TaskFilters = {
  filter?: 'today' | 'upcoming' | 'starred' | 'all' | 'done';
  category?: TaskCategory | 'all';
  query?: string;
  sort?: 'time' | 'priority';
};
