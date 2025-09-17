import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { useAppSelector } from '../hooks/useAppSelector';

const CHART_COLORS = [
  'hsl(var(--chart-bitcoin))',
  'hsl(var(--chart-ethereum))',
  'hsl(var(--chart-solana))',
  'hsl(var(--chart-cardano))',
  'hsl(var(--chart-polygon))',
  'hsl(var(--chart-chainlink))',
];

const PortfolioChart = () => {
  const { tokens } = useAppSelector((state) => state.portfolio);

  const chartData = tokens
    .filter(token => token.holdings > 0)
    .map((token, index) => ({
      name: token.symbol.toUpperCase(),
      value: token.current_price * token.holdings,
      percentage: 0, // Will be calculated
      color: CHART_COLORS[index % CHART_COLORS.length],
    }));

  const totalValue = chartData.reduce((sum, item) => sum + item.value, 0);
  
  // Calculate percentages
  chartData.forEach(item => {
    item.percentage = totalValue > 0 ? (item.value / totalValue) * 100 : 0;
  });

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-card-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            ${data.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-sm text-muted-foreground">
            {data.percentage.toFixed(1)}%
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-col space-y-2 mt-4">
        {payload?.map((entry: any, index: number) => (
          <div key={index} className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-card-foreground font-medium">{entry.value}</span>
            </div>
            <div className="text-right">
              <div className="text-card-foreground font-medium">
                {entry.payload.percentage.toFixed(1)}%
              </div>
              <div className="text-muted-foreground text-xs">
                ${entry.payload.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <div className="text-4xl mb-2">📊</div>
          <p>No holdings to display</p>
          <p className="text-sm">Add tokens and set holdings to see your portfolio distribution</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            stroke="none"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={<CustomLegend />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default PortfolioChart;