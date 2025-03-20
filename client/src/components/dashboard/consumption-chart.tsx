import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Bar, CartesianGrid } from "recharts";
import { ConsumptionByStore } from "@shared/schema";

interface ConsumptionChartProps {
  title: string;
}

export function ConsumptionChart({ title }: ConsumptionChartProps) {
  const [period, setPeriod] = useState("7");
  
  const { data, isLoading } = useQuery<ConsumptionByStore[]>({
    queryKey: ['/api/dashboard/consumption-by-store', period],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/consumption-by-store?days=${period}`);
      if (!response.ok) {
        throw new Error('Failed to fetch consumption data');
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
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis 
              dataKey="storeName" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12 }}
              unit=" kg"
            />
            <Tooltip 
              formatter={(value) => [`${value} kg`, 'Consommation']}
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
            />
            <Bar 
              dataKey="consumption" 
              fill="#1976D2" 
              radius={[4, 4, 0, 0]}
              barSize={40}
            />
          </BarChart>
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
