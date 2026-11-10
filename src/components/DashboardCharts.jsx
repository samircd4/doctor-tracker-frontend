"use client";

/**
 * components/DashboardCharts.jsx
 * The three dashboard charts (Recharts). The dashboard loads this file lazily,
 * so the chart library is only downloaded when someone opens the dashboard.
 *
 * All data comes ready-made from GET /api/stats (aggregated in MongoDB).
 */
import { format } from "date-fns";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { BRAND_COLOR, CONDITIONS } from "@/lib/constants";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

// Same look for every tooltip
const tooltipStyle = {
  contentStyle: { borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 12, boxShadow: "0 4px 12px rgb(0 0 0 / 0.08)" },
  cursor: { fill: "rgb(15 24 77 / 0.05)" },
};
const axisTick = { fontSize: 12, fill: "#6b7280" };

// Card wrapper with a title, a short explanation and a fixed-height chart area
function ChartCard({ title, description, className, children }) {
  return (
    <Card className={`gap-4 p-4 sm:p-5 ${className ?? ""}`}>
      <CardHeader className="p-0">
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  );
}

// Q: How many patients were admitted each month? (trend over the last 6 months)
export function AdmissionsChart({ data }) {
  const rows = data.map((d) => ({ ...d, label: format(new Date(`${d.month}-01T00:00:00`), "MMM yyyy") }));
  return (
    <ChartCard title="Patient admissions" description="Patients admitted per month, last 6 months" className="lg:col-span-2">
      <div className="h-72">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={rows} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="admissionsFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={BRAND_COLOR} stopOpacity={0.25} />
                <stop offset="100%" stopColor={BRAND_COLOR} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
            <XAxis dataKey="label" tick={axisTick} tickLine={false} axisLine={false} tickFormatter={(v) => v.slice(0, 3)} />
            <YAxis tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
            <Tooltip {...tooltipStyle} formatter={(value) => [value, "Patients"]} />
            <Area type="monotone" dataKey="count" stroke={BRAND_COLOR} strokeWidth={2} fill="url(#admissionsFill)" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Q: Which doctors have the most patients? (top 10, highest first)
export function PatientsPerDoctorChart({ data }) {
  // Shorter names fit the axis: drop the "Dr. " prefix and cut very long names
  const rows = data.map((d) => {
    const name = d.name.replace(/^Dr\.?\s+/i, "");
    return { ...d, short: name.length > 16 ? `${name.slice(0, 15)}…` : name };
  });
  return (
    <ChartCard title="Patients per doctor" description="Top 10 doctors by number of patients">
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e5e7eb" />
            <XAxis type="number" tick={axisTick} tickLine={false} axisLine={false} allowDecimals={false} />
            {/* width 130 fits a 16-character name on one line */}
            <YAxis type="category" dataKey="short" width={130} tick={axisTick} tickLine={false} axisLine={false} interval={0} />
            <Tooltip {...tooltipStyle} labelFormatter={(_, payload) => payload?.[0]?.payload.name} formatter={(value) => [value, "Patients"]} />
            <Bar dataKey="count" fill={BRAND_COLOR} radius={[0, 4, 4, 0]} barSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}

// Q: What share of patients is in each condition?
export function ConditionChart({ data }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);
  // Keep the same order and colors as the condition badges
  const rows = CONDITIONS.map((c) => ({
    ...c,
    count: data.find((d) => d.condition === c.value)?.count ?? 0,
  })).filter((c) => c.count > 0);

  return (
    <ChartCard title="Patients by condition" description="Current condition of all patients">
      <div className="flex h-80 flex-col items-center gap-4 sm:flex-row">
        {/* Donut with the total in the middle */}
        <div className="relative h-48 w-full sm:h-full sm:w-1/2">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={rows} dataKey="count" nameKey="label" innerRadius="62%" outerRadius="90%" paddingAngle={2} strokeWidth={0}>
                {rows.map((r) => (
                  <Cell key={r.value} fill={r.color} />
                ))}
              </Pie>
              <Tooltip {...tooltipStyle} formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl font-semibold tabular-nums">{total}</span>
            <span className="text-xs text-muted-foreground">patients</span>
          </div>
        </div>

        {/* Legend with counts and percentages (easier to read than chart labels) */}
        <ul className="w-full space-y-2.5 sm:w-1/2">
          {rows.map((r) => (
            <li key={r.value} className="flex items-center gap-2 text-sm">
              <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: r.color }} />
              <span className="flex-1 text-muted-foreground">{r.label}</span>
              <span className="font-medium tabular-nums">{r.count}</span>
              <span className="w-10 text-right text-xs text-muted-foreground tabular-nums">
                {total ? Math.round((r.count / total) * 100) : 0}%
              </span>
            </li>
          ))}
        </ul>
      </div>
    </ChartCard>
  );
}
