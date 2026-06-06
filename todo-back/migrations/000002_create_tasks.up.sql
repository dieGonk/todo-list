CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category TEXT NOT NULL,
    priority TEXT NOT NULL,
    task_date DATE NOT NULL,
    task_time TIME NOT NULL,
    notes TEXT NOT NULL DEFAULT '',
    done BOOLEAN NOT NULL DEFAULT FALSE,
    starred BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT tasks_title_not_empty CHECK (length(trim(title)) > 0),
    CONSTRAINT tasks_category_check CHECK (category IN ('work', 'personal', 'health', 'learning', 'home')),
    CONSTRAINT tasks_priority_check CHECK (priority IN ('high', 'med', 'low'))
);

CREATE TABLE subtasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    done BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT subtasks_title_not_empty CHECK (length(trim(title)) > 0)
);

CREATE INDEX idx_tasks_task_date ON tasks (task_date);
CREATE INDEX idx_tasks_done ON tasks (done);
CREATE INDEX idx_tasks_starred ON tasks (starred);
CREATE INDEX idx_tasks_category ON tasks (category);
CREATE INDEX idx_tasks_priority ON tasks (priority);
CREATE INDEX idx_tasks_created_at ON tasks (created_at DESC);
CREATE INDEX idx_subtasks_task_id ON subtasks (task_id);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_tasks_updated_at
BEFORE UPDATE ON tasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER trg_subtasks_updated_at
BEFORE UPDATE ON subtasks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
