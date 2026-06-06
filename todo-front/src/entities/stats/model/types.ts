export type ProductivitySummary = {
  inProgress: number;
  completed: number;
  upcoming: number;
};

export type ProductivityRange = {
  from: string;
  to: string;
};

export type ProductivityPoint = {
  date: string;
  label: string;
  completed: number;
};

export type Productivity = {
  summary: ProductivitySummary;
  range: ProductivityRange;
  points: ProductivityPoint[];
};
