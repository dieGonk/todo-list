import { baseApi } from '../../../shared/api/baseApi';
import { todayISO } from '../../../shared/lib/date/date';
import { seedTasks } from '../model/constants';
import type { CreateTaskDto, Task, TaskFilters, TaskPriority } from '../model/types';

const STORAGE_KEY = 'tk_tasks_v1';

const readTasks = (): Task[] => {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return seedTasks;

  try {
    return JSON.parse(raw) as Task[];
  } catch {
    return seedTasks;
  }
};

const writeTasks = (tasks: Task[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
};

const uid = (prefix = 't') => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

const applyFilters = (tasks: Task[], filters?: TaskFilters) => {
  const currentFilters = filters ?? {};
  const priorityOrder: Record<TaskPriority, number> = { high: 0, med: 1, low: 2 };

  return tasks
    .filter((task) => {
      if (currentFilters.filter === 'today' && task.date !== todayISO()) return false;
      if (currentFilters.filter === 'upcoming' && !(task.date > todayISO())) return false;
      if (currentFilters.filter === 'done' && !task.done) return false;
      if (currentFilters.filter === 'starred' && !task.starred) return false;
      if (currentFilters.category && currentFilters.category !== 'all' && task.category !== currentFilters.category) return false;
      if (currentFilters.query && !task.title.toLowerCase().includes(currentFilters.query.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (a.done !== b.done) return a.done ? 1 : -1;
      if (currentFilters.sort === 'priority') return priorityOrder[a.priority] - priorityOrder[b.priority];
      return `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`);
    });
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], TaskFilters | undefined>({
      queryFn: (filters) => ({ data: applyFilters(readTasks(), filters) }),
      providesTags: ['Task'],
    }),
    getTaskById: builder.query<Task | undefined, string>({
      queryFn: (id) => ({ data: readTasks().find((task) => task.id === id) }),
      providesTags: (_result, _error, id) => [{ type: 'Task', id }],
    }),
    createTask: builder.mutation<Task, CreateTaskDto>({
      queryFn: (payload) => {
        const now = new Date();
        const task: Task = {
          id: uid(),
          title: payload.title,
          category: payload.category,
          priority: payload.priority,
          date: todayISO(),
          time: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
          notes: '',
          done: false,
          starred: false,
          subtasks: [],
        };
        writeTasks([task, ...readTasks()]);
        return { data: task };
      },
      invalidatesTags: ['Task'],
    }),
    toggleTaskDone: builder.mutation<Task | undefined, string>({
      queryFn: (id) => {
        let updated: Task | undefined;
        const tasks = readTasks().map((task) => {
          if (task.id !== id) return task;
          updated = { ...task, done: !task.done };
          return updated;
        });
        writeTasks(tasks);
        return { data: updated };
      },
      invalidatesTags: ['Task'],
    }),
    toggleTaskStar: builder.mutation<Task | undefined, string>({
      queryFn: (id) => {
        let updated: Task | undefined;
        const tasks = readTasks().map((task) => {
          if (task.id !== id) return task;
          updated = { ...task, starred: !task.starred };
          return updated;
        });
        writeTasks(tasks);
        return { data: updated };
      },
      invalidatesTags: ['Task'],
    }),
    setTaskPriority: builder.mutation<Task | undefined, { id: string; priority: TaskPriority }>({
      queryFn: ({ id, priority }) => {
        let updated: Task | undefined;
        const tasks = readTasks().map((task) => {
          if (task.id !== id) return task;
          updated = { ...task, priority };
          return updated;
        });
        writeTasks(tasks);
        return { data: updated };
      },
      invalidatesTags: ['Task'],
    }),
    addSubtask: builder.mutation<Task | undefined, { taskId: string; title: string }>({
      queryFn: ({ taskId, title }) => {
        let updated: Task | undefined;
        const tasks = readTasks().map((task) => {
          if (task.id !== taskId) return task;
          updated = { ...task, subtasks: [...task.subtasks, { id: uid('s'), title, done: false }] };
          return updated;
        });
        writeTasks(tasks);
        return { data: updated };
      },
      invalidatesTags: ['Task'],
    }),
    deleteTask: builder.mutation<{ id: string }, string>({
      queryFn: (id) => {
        writeTasks(readTasks().filter((task) => task.id !== id));
        return { data: { id } };
      },
      invalidatesTags: ['Task'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useGetTaskByIdQuery,
  useCreateTaskMutation,
  useToggleTaskDoneMutation,
  useToggleTaskStarMutation,
  useSetTaskPriorityMutation,
  useAddSubtaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
