import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";

export function FrameChart({ samples }: { samples: number[] }) {
  const data = samples.map((ms, i) => ({ i, ms: Math.round(ms * 10) / 10 }));
  return (
    <div className="h-24 w-full text-focus">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <YAxis hide domain={["dataMin", "dataMax"]} />
          <Line type="monotone" dataKey="ms" stroke="currentColor" dot={false} strokeWidth={1.5} isAnimationActive={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
