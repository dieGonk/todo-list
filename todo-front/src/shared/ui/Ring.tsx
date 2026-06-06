type RingProps = {
  value: number;
  size?: number;
  stroke?: number;
};

export const Ring = ({ value, size = 188, stroke = 16 }: RingProps) => {
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.max(0, Math.min(100, value)) / 100);

  return (
    <svg width={size} height={size} className="ring">
      <defs>
        <linearGradient id="ring-gradient" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#f0d39e" />
          <stop offset="1" stopColor="#d4a85f" />
        </linearGradient>
      </defs>
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--surface-3)" strokeWidth={stroke} />
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="url(#ring-gradient)" strokeWidth={stroke} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
    </svg>
  );
};
