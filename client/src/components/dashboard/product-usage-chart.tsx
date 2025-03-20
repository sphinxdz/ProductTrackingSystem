import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PieChart, ResponsiveContainer, Pie, Cell, Legend, Tooltip } from "recharts";
import { ConsumptionByCaliber } from "@shared/schema";

interface ProductUsageChartProps {
  title: string;
}

export function ProductUsageChart({ title }: ProductUsageChartProps) {
  const [period, setPeriod] = useState("7");
  
  const { data, isLoading } = useQuery<ConsumptionByCaliber[]>({
    queryKey: ['/api/dashboard/consumption-by-caliber', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/consumption-by-caliber?days=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch caliber consumption data');
      }
      return response.json();
    }
  });
  
  const chartData = data || [];
  
  const renderChart = () => {
    if (isLoading) {
      return (
        <div className="h-64 flex items-center justify-center">
          <p>Chargement...</p>
        </div>
      );
    }
    
    if (chartData.length === 0) {
      return (
        <div className="h-64 flex items-center justify-center bg-neutral-50 rounded">
          <p>Aucune donnée disponible</p>
        </div>
      );
    }
    
    return (
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={80}
              fill="#8884d8"
              dataKey="consumption"
              nameKey="caliberName"
              label={({ caliberName, percentage }) => `${caliberName} (${percentage.toFixed(0)}%)`}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value, name) => [
                `${value} kg (${chartData.find(item => item.caliberName === name)?.percentage.toFixed(0)}%)`, 
                name
              ]}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-500">{title}</h3>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-[180px] bg-neutral-100 border-none">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">Année en cours</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {renderChart()}
      </CardContent>
    </Card>
  );
}
