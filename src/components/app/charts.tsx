import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

const colors = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 6, fontSize: 12 } };

export function VolumeChart({ data }: { data: { day: string; created: number; solved: number }[] }) {
  return (
    <div className="h-64"><ResponsiveContainer>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey="day" fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" allowDecimals={false} />
        <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} />
        <Area type="monotone" dataKey="created" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.15} />
        <Area type="monotone" dataKey="solved" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} />
      </AreaChart>
    </ResponsiveContainer></div>
  );
}

export function Donut({ data }: { data: { name: string; value: number }[] }) {
  return (
    <div className="h-56"><ResponsiveContainer>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2}>
          {data.map((_, i) => <Cell key={i} fill={colors[i % colors.length]} />)}
        </Pie>
        <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} />
      </PieChart>
    </ResponsiveContainer></div>
  );
}

export function Bars({ data, keys, x = "name" }: { data: Record<string, unknown>[]; keys: string[]; x?: string }) {
  return (
    <div className="h-64"><ResponsiveContainer>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
        <XAxis dataKey={x} fontSize={11} stroke="var(--muted-foreground)" /><YAxis fontSize={11} stroke="var(--muted-foreground)" allowDecimals={false} />
        <Tooltip {...tip} /><Legend wrapperStyle={{ fontSize: 12 }} />
        {keys.map((k, i) => <Bar key={k} dataKey={k} fill={colors[i % colors.length]} radius={[3, 3, 0, 0]} />)}
      </BarChart>
    </ResponsiveContainer></div>
  );
}
