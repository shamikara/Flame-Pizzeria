"use client";

import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface SalesChartProps {
  data: { name: string; thisWeek: number; lastWeek: number }[];
}

export function SalesChart({ data }: SalesChartProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
        <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `Rs.${value}`} />
        <Tooltip />
        <Line type="monotone" dataKey="thisWeek" stroke="#8884d8" activeDot={{ r: 8 }} />
        <Line type="monotone" dataKey="lastWeek" stroke="#82ca9d" />
      </LineChart>
    </ResponsiveContainer>
  );
}