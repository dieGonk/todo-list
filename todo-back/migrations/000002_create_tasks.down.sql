DROP TRIGGER IF EXISTS trg_subtasks_updated_at ON subtasks;
DROP TRIGGER IF EXISTS trg_tasks_updated_at ON tasks;
DROP TABLE IF EXISTS subtasks;
DROP TABLE IF EXISTS tasks;
DROP FUNCTION IF EXISTS set_updated_at();
