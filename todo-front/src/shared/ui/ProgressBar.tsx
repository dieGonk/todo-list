type ProgressBarProps = {
  value: number;
};

export const ProgressBar = ({ value }: ProgressBarProps) => {
  return (
    <div className="bar">
      <i style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
};
