"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#8b5cf6", "#22d3ee", "#f59e0b", "#10b981", "#ef4444", "#64748b"];

export function RevenueChart({ data }: { data: { date: string; revenue: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
        <Line type="monotone" dataKey="revenue" stroke="#22d3ee" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function SignupsChart({ data }: { data: { date: string; signups: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis dataKey="date" stroke="#64748b" fontSize={12} />
        <YAxis stroke="#64748b" fontSize={12} allowDecimals={false} />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
        <Bar dataKey="signups" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

export function OrderStatusPie({ data }: { data: { status: string; count: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <PieChart>
        <Pie data={data} dataKey="count" nameKey="status" cx="50%" cy="50%" outerRadius={90} label>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function TopServicesChart({ data }: { data: { name: string; orders: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} layout="vertical" margin={{ left: 24 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
        <XAxis type="number" stroke="#64748b" fontSize={12} allowDecimals={false} />
        <YAxis type="category" dataKey="name" stroke="#64748b" fontSize={11} width={140} />
        <Tooltip contentStyle={{ background: "#0f172a", border: "1px solid #1e293b" }} />
        <Bar dataKey="orders" fill="#22d3ee" radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
