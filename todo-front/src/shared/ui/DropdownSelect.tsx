import { type ReactNode, useEffect, useRef, useState } from "react";
import { Icon } from "./Icon";

type DropdownSelectOption<T extends string> = {
  value: T;
  label: string;
  icon?: ReactNode;
};

type DropdownSelectProps<T extends string> = {
  value: T;
  options: Array<DropdownSelectOption<T>>;
  onChange: (value: T) => void;
  className?: string;
  menuAlign?: "left" | "right";
  prefixIcon?: ReactNode;
  ariaLabel?: string;
};

export const DropdownSelect = <T extends string>({
  value,
  options,
  onChange,
  className = "",
  menuAlign = "left",
  prefixIcon,
  ariaLabel,
}: DropdownSelectProps<T>) => {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const selected =
    options.find((option) => option.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className={`dropdown-select ${className}`.trim()} ref={rootRef}>
      <button
        type="button"
        className="dropdown-select__button chip"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={ariaLabel}
        onClick={() => setOpen((current) => !current)}
      >
        {prefixIcon ?? selected.icon}
        <span className="dropdown-select__label">{selected.label}</span>
        <Icon name="chevDown" className="dropdown-select__chevron" />
      </button>
      {open && (
        <div
          className={`dropdown-select__menu dropdown-select__menu--${menuAlign}`}
          role="listbox"
        >
          {options.map((option) => (
            <button
              type="button"
              key={option.value}
              className={`dropdown-select__option ${option.value === value ? "selected" : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.icon}
              <span>{option.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
