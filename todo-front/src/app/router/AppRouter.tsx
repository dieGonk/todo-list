import { BrowserRouter, Navigate, Route, Routes } from 'react-router';
import { CalendarPage } from '../../pages/calendar/CalendarPage';
import { DashboardPage } from '../../pages/dashboard/DashboardPage';
import { TaskDetailPage } from '../../pages/task-detail/TaskDetailPage';
import { TasksPage } from '../../pages/tasks/TasksPage';
import { routes } from '../../shared/config/routes';
import { AppLayout } from '../../widgets/app-layout/AppLayout';

export const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path={routes.tasks} element={<TasksPage />} />
          <Route path={routes.taskDetail} element={<TaskDetailPage />} />
          <Route path={routes.calendar} element={<CalendarPage />} />
          <Route path="*" element={<Navigate to={routes.dashboard} replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
