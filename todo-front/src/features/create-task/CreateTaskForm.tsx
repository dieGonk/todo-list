import { useState } from "react";
import { useCreateTaskMutation } from "../../entities/task/api/tasksApi";
import {
  taskCategories,
  taskPriorities,
} from "../../entities/task/model/constants";
import type {
  TaskCategory,
  TaskPriority,
} from "../../entities/task/model/types";
import { DropdownSelect } from "../../shared/ui/DropdownSelect";
import { Icon } from "../../shared/ui/Icon";

export const CreateTaskForm = () => {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<TaskCategory>("work");
  const [priority, setPriority] = useState<TaskPriority>("med");
  const [createTask, { isLoading }] = useCreateTaskMutation();
  const categoryOptions = Object.entries(taskCategories).map(([key, item]) => ({
    value: key as TaskCategory,
    label: item.label,
    icon: <i className="cat-dot" style={{ background: item.color }} />,
  }));
  const priorityOptions = Object.entries(taskPriorities).map(([key, item]) => ({
    value: key as TaskPriority,
    label: item.label,
    icon: <Icon name="flag" style={{ color: item.color }} />,
  }));

  const submit = async () => {
    const nextTitle = title.trim();
    if (!nextTitle) return;
    await createTask({ title: nextTitle, category, priority });
    setTitle("");
  };

  return (
    <div className="add-bar">
      <div className="add-bar__plus">
        <Icon name="plus" />
      </div>
      <input
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        onKeyDown={(event) => event.key === "Enter" && submit()}
        placeholder="Добавить задачу на сегодня…"
      />
      <DropdownSelect
        className="add-bar__select"
        value={category}
        options={categoryOptions}
        onChange={setCategory}
        ariaLabel="Категория задачи"
      />
      <DropdownSelect
        className="add-bar__select"
        value={priority}
        options={priorityOptions}
        onChange={setPriority}
        ariaLabel="Приоритет задачи"
      />
      <button
        className="add-bar__submit"
        onClick={submit}
        disabled={!title.trim() || isLoading}
      >
        <Icon name="plus" />
        Добавить
      </button>
    </div>
  );
};
