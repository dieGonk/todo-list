import type { CSSProperties } from 'react';

const icons = {
  grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
  list: 'M8 6h12M8 12h12M8 18h12M3.5 6h.01M3.5 12h.01M3.5 18h.01',
  check: 'M5 12.5l4.2 4.2L19 7',
  plus: 'M12 5v14M5 12h14',
  search: 'M11 19a8 8 0 100-16 8 8 0 000 16zM21 21l-4.3-4.3',
  bell: 'M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0',
  calendar: 'M7 3v3M17 3v3M4 8h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z',
  clock: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 7v5l3 2',
  flag: 'M5 21V4M5 4h11l-2 4 2 4H5',
  trash: 'M4 7h16M9 7V5a1 1 0 011-1h4a1 1 0 011 1v2M6 7l1 13a1 1 0 001 1h8a1 1 0 001-1l1-13',
  star: 'M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 17l-5.2 2.6 1-5.8L3.5 9.7l5.9-.9z',
  target: 'M12 21a9 9 0 100-18 9 9 0 000 18zM12 16a4 4 0 100-8 4 4 0 000 8zM12 12h.01',
  trend: 'M3 17l6-6 4 4 8-8M15 7h6v6',
  inbox: 'M3 12h5l2 3h4l2-3h5M4 6h16a1 1 0 011 1v11a1 1 0 01-1 1H4a1 1 0 01-1-1V7a1 1 0 011-1z',
  user: 'M12 12a4 4 0 100-8 4 4 0 000 8zM5 21a7 7 0 0114 0',
  briefcase: 'M4 8h16a1 1 0 011 1v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9a1 1 0 011-1zM8 8V6a2 2 0 012-2h4a2 2 0 012 2v2M3 13h18',
  heart: 'M12 20s-7-4.5-9.2-9C1.3 8 2.5 4.5 6 4.5c2 0 3.2 1.3 4 2.5.8-1.2 2-2.5 4-2.5 3.5 0 4.7 3.5 3.2 6.5C19 15.5 12 20 12 20z',
  book: 'M4 5a2 2 0 012-2h8v16H6a2 2 0 00-2 2V5zM14 3h4a2 2 0 012 2v14a2 2 0 00-2-2h-4',
  sun: 'M12 17a5 5 0 100-10 5 5 0 000 10zM12 2v2M12 20v2M4 12H2M22 12h-2M5 5l1.4 1.4M17.6 17.6L19 19M19 5l-1.4 1.4M6.4 17.6L5 19',
  chevRight: 'M9 6l6 6-6 6',
  chevLeft: 'M15 6l-6 6 6 6',
  fire: 'M12 22c4 0 7-2.7 7-6.5 0-3.5-2.5-5-3.5-7.5-1.4 1-1.5 2.5-1.5 2.5S12 7 11 4.5C9.5 6 5 8.5 5 14c0 4 3 8 7 8z',
} as const;

export type IconName = keyof typeof icons;

type IconProps = {
  name: IconName;
  className?: string;
  style?: CSSProperties;
};

export const Icon = ({ name, className, style }: IconProps) => {
  const path = icons[name];

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" className={className} style={style} aria-hidden="true">
      {path.split('M').filter(Boolean).map((segment, index) => (
        <path key={index} d={`M${segment}`} />
      ))}
    </svg>
  );
};
