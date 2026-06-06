import { useOutletContext } from 'react-router';
import type { AppLayoutContext } from '../../widgets/app-layout/AppLayout';
import { TaskList } from '../../widgets/task-list/TaskList';

export const TasksPage = () => {
  const { query } = useOutletContext<AppLayoutContext>();
  return <TaskList query={query} />;
};
