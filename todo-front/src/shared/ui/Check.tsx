import type { MouseEvent } from "react";
import { Icon } from "./Icon";

type CheckProps = {
  checked: boolean;
  onClick?: () => void;
  size?: number;
};

export const Check = ({ checked, onClick, size }: CheckProps) => {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();
    onClick?.();
  };

  return (
    <button
      className={`check ${checked ? "on" : ""}`}
      onClick={handleClick}
      style={size ? { width: size, height: size } : undefined}
      aria-label="Изменить статус"
    >
      <Icon name="check" />
    </button>
  );
};
