import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Activity } from "@shared/schema";
import { ShoppingCart, Wrench, AlertTriangle, AlertOctagon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

interface RecentActivityProps {
  title: string;
  limit?: number;
}

export function RecentActivity({ title, limit = 4 }: RecentActivityProps) {
  const [showAll, setShowAll] = useState(false);
  
  const { data, isLoading } = useQuery<Activity[]>({
    queryKey: ['/api/activities', limit],
    queryFn: async () => {
      const response = await fetch(`/api/activities?limit=${showAll ? 20 : limit}`);
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const activities = data || [];
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'order':
        return <div className="bg-blue-100 p-2 rounded-full text-primary mr-4">
          <ShoppingCart className="h-4 w-4" />
        </div>;
      case 'consumption':
        return <div className="bg-green-100 p-2 rounded-full text-secondary mr-4">
          <Wrench className="h-4 w-4" />
        </div>;
      case 'alert':
        return <div className="bg-orange-100 p-2 rounded-full text-accent mr-4">
          <AlertTriangle className="h-4 w-4" />
        </div>;
      default:
        return <div className="bg-red-100 p-2 rounded-full text-danger mr-4">
          <AlertOctagon className="h-4 w-4" />
        </div>;
    }
  };
  
  const formatTime = (date: string) => {
    return formatDistanceToNow(new Date(date), { 
      addSuffix: true,
      locale: fr
    });
  };
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="font-medium text-neutral-500">{title}</h3>
          <Button 
            variant="ghost"
            className="text-primary text-sm"
            onClick={() => setShowAll(!showAll)}
          >
            {showAll ? 'Voir moins' : 'Tout voir'}
          </Button>
        </div>
        
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <p>Chargement...</p>
          </div>
        ) : activities.length === 0 ? (
          <div className="flex items-center justify-center h-32">
            <p>Aucune activité récente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {activities.map((activity) => (
              <div 
                key={activity.id} 
                className="flex items-start pb-4 border-b border-neutral-100 last:border-b-0 last:pb-0"
              >
                {getActivityIcon(activity.type)}
                <div className="flex-1">
                  <p className="text-neutral-400">
                    {activity.message}
                  </p>
                  <p className="text-neutral-300 text-sm">{formatTime(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
