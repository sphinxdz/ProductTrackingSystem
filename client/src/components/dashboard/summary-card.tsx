import { Card, CardContent } from "@/components/ui/card";
import { ArrowDown, ArrowUp } from "lucide-react";

interface SummaryCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend: {
    value: string;
    isPositive: boolean;
    label?: string;
  };
  bgColor: string;
}

export function SummaryCard({ title, value, icon, trend, bgColor }: SummaryCardProps) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-neutral-300 text-sm">{title}</p>
            <h3 className="text-2xl font-medium mt-1">{value}</h3>
          </div>
          <div className={`${bgColor} p-2 rounded-full`}>
            {icon}
          </div>
        </div>
        <div className="flex items-center mt-4">
          <span className={`text-sm flex items-center ${trend.isPositive ? 'text-secondary' : 'text-danger'}`}>
            {trend.isPositive ? (
              <ArrowUp className="h-4 w-4 mr-1" />
            ) : (
              <ArrowDown className="h-4 w-4 mr-1" />
            )}
            <span>{trend.value}</span>
          </span>
          <span className="text-neutral-300 text-sm ml-2">{trend.label || 'vs dernier mois'}</span>
        </div>
      </CardContent>
    </Card>
  );
}
