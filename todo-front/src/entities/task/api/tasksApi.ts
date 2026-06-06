import { baseApi } from "../../../shared/api/baseApi";
import type {
  CreateTaskDto,
  Task,
  TaskFilters,
  TaskPriority,
} from "../model/types";

type ApiCacheState = {
  api?: {
    queries?: Record<string, { data?: unknown }>;
  };
};

const findCachedTask = (state: unknown, id: string): Task | undefined => {
  const queries = Object.values((state as ApiCacheState).api?.queries ?? {});
  for (const query of queries) {
    const data = query.data;
    if (Array.isArray(data)) {
      const task = data.find(
        (item): item is Task =>
          typeof item === "object" &&
          item !== null &&
          "id" in item &&
          item.id === id,
      );
      if (task) return task;
    }
    if (
      typeof data === "object" &&
      data !== null &&
      "id" in data &&
      data.id === id
    ) {
      return data as Task;
    }
  }
  return undefined;
};

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<Task[], TaskFilters | undefined>({
      query: (filters) => ({
        url: "/tasks",
        params: {
          filter: filters?.filter,
          category: filters?.category,
          query: filters?.query || undefined,
          sort: filters?.sort,
        },
      }),
      providesTags: ["Task"],
    }),
    getTaskById: builder.query<Task | undefined, string>({
      query: (id) => `/tasks/${id}`,
      providesTags: (_result, _error, id) => [{ type: "Task", id }],
    }),
    createTask: builder.mutation<Task, CreateTaskDto>({
      query: (payload) => ({
        url: "/tasks",
        method: "POST",
        body: payload,
      }),
      invalidatesTags: ["Task"],
    }),
    toggleTaskDone: builder.mutation<Task, string>({
      async queryFn(id, api, _extraOptions, baseQuery) {
        let task = findCachedTask(api.getState(), id);
        if (!task) {
          const result = await baseQuery(`/tasks/${id}`);
          if (result.error) return { error: result.error };
          task = result.data as Task;
        }

        const result = await baseQuery({
          url: `/tasks/${id}`,
          method: "PATCH",
          body: { done: !task.done },
        });
        if (result.error) return { error: result.error };
        return { data: result.data as Task };
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Task", id }, "Task"],
    }),
    toggleTaskStar: builder.mutation<Task, string>({
      async queryFn(id, api, _extraOptions, baseQuery) {
        let task = findCachedTask(api.getState(), id);
        if (!task) {
          const result = await baseQuery(`/tasks/${id}`);
          if (result.error) return { error: result.error };
          task = result.data as Task;
        }

        const result = await baseQuery({
          url: `/tasks/${id}`,
          method: "PATCH",
          body: { starred: !task.starred },
        });
        if (result.error) return { error: result.error };
        return { data: result.data as Task };
      },
      invalidatesTags: (_result, _error, id) => [{ type: "Task", id }, "Task"],
    }),
    setTaskPriority: builder.mutation<
      Task,
      { id: string; priority: TaskPriority }
    >({
      query: ({ id, priority }) => ({
        url: `/tasks/${id}`,
        method: "PATCH",
        body: { priority },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Task", id },
        "Task",
      ],
    }),
    addSubtask: builder.mutation<Task, { taskId: string; title: string }>({
      query: ({ taskId, title }) => ({
        url: `/tasks/${taskId}/subtasks`,
        method: "POST",
        body: { title },
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Task", id: taskId },
        "Task",
      ],
    }),
    toggleSubtask: builder.mutation<
      Task,
      { taskId: string; subtaskId: string }
    >({
      query: ({ taskId, subtaskId }) => ({
        url: `/tasks/${taskId}/subtasks/${subtaskId}/toggle`,
        method: "PATCH",
      }),
      invalidatesTags: (_result, _error, { taskId }) => [
        { type: "Task", id: taskId },
        "Task",
      ],
    }),
    deleteTask: builder.mutation<{ id: string }, string>({
      query: (id) => ({
        url: `/tasks/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Task"],
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
  useToggleSubtaskMutation,
  useDeleteTaskMutation,
} = tasksApi;
