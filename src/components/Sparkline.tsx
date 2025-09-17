import { LineChart, Line, ResponsiveContainer } from 'recharts';

interface SparklineProps {
  data: number[];
  isPositive: boolean;
  className?: string;
}

const Sparkline = ({ data, isPositive, className = "" }: SparklineProps) => {
  if (!data || data.length === 0) {
    return <div className={`w-16 h-8 ${className}`} />;
  }

  const chartData = data.map((value, index) => ({
    index,
    value,
  }));

  const color = isPositive ? 'hsl(var(--success))' : 'hsl(var(--destructive))';

  return (
    <div className={`w-16 h-8 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={1.5}
            dot={false}
            activeDot={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default Sparkline;