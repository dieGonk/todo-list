import type { ProductivityPoint } from '../../entities/stats/model/types';

type ProductivityChartProps = {
  points: ProductivityPoint[];
};

const WIDTH = 520;
const HEIGHT = 200;
const PAD = 10;

export const ProductivityChart = ({ points }: ProductivityChartProps) => {
  const safePoints = points.length === 7 ? points : buildEmptyPoints();
  const data = safePoints.map((point) => point.completed);
  const labels = safePoints.map((point) => point.label);
  const maxValue = Math.max(...data);
  const peakIndex = maxValue > 0 ? data.indexOf(maxValue) : data.length - 1;
  const chartMax = maxValue * 1.15 || 1;
  const xs = data.map((_, index) => PAD + (index * (WIDTH - PAD * 2)) / (data.length - 1));
  const ys = data.map((value) => HEIGHT - 8 - (value / chartMax) * (HEIGHT - 30));
  const line = buildSmoothPath(xs, ys);
  const area = `${line} L${xs[xs.length - 1]},${HEIGHT} L${xs[0]},${HEIGHT} Z`;

  return (
    <div className="chart-wrap">
      <svg className="chart-svg" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="productivity-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="rgba(233,196,134,.32)" />
            <stop offset="1" stopColor="rgba(233,196,134,0)" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#productivity-area)" />
        <path d={line} fill="none" stroke="var(--gold)" strokeWidth="2.5" strokeLinecap="round" />
        <line x1={xs[peakIndex]} y1={ys[peakIndex]} x2={xs[peakIndex]} y2={HEIGHT} stroke="var(--gold-line)" strokeWidth="1.5" strokeDasharray="3 4" />
        <circle cx={xs[peakIndex]} cy={ys[peakIndex]} r="5.5" fill="var(--gold)" stroke="var(--surface)" strokeWidth="3" />
      </svg>
      <div className="chart-peak" style={{ left: `${(xs[peakIndex] / WIDTH) * 100}%`, top: `${(ys[peakIndex] / HEIGHT) * 100}%` }}>
        {data[peakIndex]} задач
      </div>
      <div className="x-axis">
        {labels.map((label, index) => (
          <span key={`${label}-${index}`} className={index === peakIndex ? 'on' : ''}>{label}</span>
        ))}
      </div>
    </div>
  );
};

const buildSmoothPath = (xs: number[], ys: number[]) => {
  let path = `M${xs[0]},${ys[0]}`;
  for (let index = 0; index < xs.length - 1; index++) {
    const x0 = xs[index - 1] ?? xs[index];
    const y0 = ys[index - 1] ?? ys[index];
    const x1 = xs[index];
    const y1 = ys[index];
    const x2 = xs[index + 1];
    const y2 = ys[index + 1];
    const x3 = xs[index + 2] ?? x2;
    const y3 = ys[index + 2] ?? y2;
    const c1x = x1 + (x2 - x0) / 6;
    const c1y = y1 + (y2 - y0) / 6;
    const c2x = x2 - (x3 - x1) / 6;
    const c2y = y2 - (y3 - y1) / 6;
    path += ` C${c1x},${c1y} ${c2x},${c2y} ${x2},${y2}`;
  }
  return path;
};

const buildEmptyPoints = (): ProductivityPoint[] => {
  const labels = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
  return labels.map((label) => ({ date: '', label, completed: 0 }));
};
