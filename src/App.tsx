import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  DotProps,
} from "recharts";

interface DataItem {
  name: string;
  uv: number;
  pv: number;
  amt: number;
  uvZScore?: number;
  pvZScore?: number;
}

interface Stop {
  offset: string;
  color: string;
}

interface CustomDotProps extends DotProps {
  payload?: DataItem;
}

const data: DataItem[] = [
  { name: "Page A", uv: 4000, pv: 2400, amt: 2400 },
  { name: "Page B", uv: 3000, pv: 1398, amt: 2210 },
  { name: "Page C", uv: 2000, pv: 9800, amt: 2290 },
  { name: "Page D", uv: 2780, pv: 3908, amt: 2000 },
  { name: "Page E", uv: 1890, pv: 4800, amt: 2181 },
  { name: "Page F", uv: 2390, pv: 3800, amt: 2500 },
  { name: "Page G", uv: 3490, pv: 4300, amt: 2100 },
];

const zScoreData = (dataArray: DataItem[], key: keyof DataItem): DataItem[] => {
  const values = dataArray.map((item) => item[key] as number);
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) /
      values.length
  );

  return dataArray.map((item) => ({
    ...item,
    [`${key}ZScore`]:
      stdDev !== 0 ? ((item[key] as number) - mean) / stdDev : 0,
  }));
};

const getColorStops = (data: DataItem[], dataKey: "pv" | "uv"): Stop[] => {
  const stops: Stop[] = [];
  let prevColor: string | null = null;

  data.forEach((item, index) => {
    const zScore = item[`${dataKey}ZScore`] as number;
    const currentColor =
      Math.abs(zScore) > 1
        ? "#ff0000"
        : dataKey === "pv"
        ? "#8884d8"
        : "#82ca9d";
    const offset = (index / (data.length - 1)) * 100;
    if (currentColor !== prevColor && prevColor !== null) {
      stops.push({ offset: `${offset}%`, color: prevColor });
    }
    stops.push({ offset: `${offset}%`, color: currentColor });
    prevColor = currentColor;
  });

  return stops;
};

const getPointColor = (zScore: number, baseColor: string): string => {
  return Math.abs(zScore) > 1 ? "#ff0000" : baseColor;
};

export default function App() {
  const processedData = useMemo(() => {
    const withPvScores = zScoreData(data, "pv");
    return zScoreData(withPvScores, "uv");
  }, []);

  const pvStops = useMemo(
    () => getColorStops(processedData, "pv"),
    [processedData]
  );
  const uvStops = useMemo(
    () => getColorStops(processedData, "uv"),
    [processedData]
  );

  const renderDot = (baseColor: string) => (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    if (!payload || cx === undefined || cy === undefined) {
      return <circle cx={0} cy={0} r={0} fill="transparent" />;
    }

    const zScoreKey = baseColor === "#8884d8" ? "pvZScore" : "uvZScore";
    const zScore = payload[zScoreKey] as number;
    const color = getPointColor(zScore, baseColor);

    return <circle cx={cx} cy={cy} r={4} fill={color} />;
  };

  const renderActiveDot = (baseColor: string) => (props: CustomDotProps) => {
    const { cx, cy, payload } = props;
    if (!payload || cx === undefined || cy === undefined) {
      return <circle cx={0} cy={0} r={0} fill="transparent" />;
    }

    const zScoreKey = baseColor === "#8884d8" ? "pvZScore" : "uvZScore";
    const zScore = payload[zScoreKey] as number;
    const color = getPointColor(zScore, baseColor);

    return <circle cx={cx} cy={cy} r={8} fill={color} />;
  };

  return (
    <div className="App">
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={processedData} margin={{ top: 20 }}>
          <defs>
            <linearGradient id="pvGradient" x1="0" y1="0" x2="1" y2="0">
              {pvStops.map((stop, i) => (
                <stop
                  key={`pv-${i}`}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
            <linearGradient id="uvGradient" x1="0" y1="0" x2="1" y2="0">
              {uvStops.map((stop, i) => (
                <stop
                  key={`uv-${i}`}
                  offset={stop.offset}
                  stopColor={stop.color}
                />
              ))}
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" padding={{ left: 30, right: 30 }} />
          <YAxis />
          <Tooltip />
          <Legend
            payload={[
              { value: "pv", type: "square", color: "#8884d8" },
              { value: "uv", type: "square", color: "#82ca9d" },
            ]}
          />
          <Line
            type="monotone"
            dataKey="pv"
            stroke="url(#pvGradient)"
            strokeWidth={2}
            dot={renderDot("#8884d8")}
            activeDot={renderActiveDot("#8884d8")}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="uv"
            stroke="url(#uvGradient)"
            strokeWidth={2}
            dot={renderDot("#82ca9d")}
            activeDot={renderActiveDot("#82ca9d")}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
