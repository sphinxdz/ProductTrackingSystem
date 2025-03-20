import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { Alert } from "@shared/schema";
import { AlertCircle, AlertTriangle, Info, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AlertsPanelProps {
  title: string;
}

export function AlertsPanel({ title }: AlertsPanelProps) {
  const [showAll, setShowAll] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery<Alert[]>({
    queryKey: ['/api/alerts'],
    queryFn: async () => {
      const response = await fetch('/api/alerts?active=true');
      if (!response.ok) {
        throw new Error('Failed to fetch alerts');
      }
      return response.json();
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });
  
  const resolveAlertMutation = useMutation({
    mutationFn: async (alertId: number) => {
      const res = await apiRequest('POST', `/api/alerts/resolve/${alertId}`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      toast({
        title: "Alerte résolue",
        description: "L'alerte a été marquée comme résolue avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de résoudre l'alerte: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  const handleResolveAlert = (alertId: number) => {
    resolveAlertMutation.mutate(alertId);
  };
  
  const getAlertStyle = (type: string) => {
    switch (type) {
      case 'critical':
        return {
          bg: 'bg-red-50',
          border: 'border-danger',
          icon: <AlertCircle className="text-danger h-5 w-5 mr-2" />,
          textColor: 'text-danger'
        };
      case 'warning':
        return {
          bg: 'bg-orange-50',
          border: 'border-accent',
          icon: <AlertTriangle className="text-accent h-5 w-5 mr-2" />,
          textColor: 'text-accent'
        };
      case 'info':
        return {
          bg: 'bg-yellow-50',
          border: 'border-yellow-400',
          icon: <Info className="text-yellow-500 h-5 w-5 mr-2" />,
          textColor: 'text-yellow-600'
        };
      default:
        return {
          bg: 'bg-blue-50',
          border: 'border-blue-400',
          icon: <Info className="text-blue-500 h-5 w-5 mr-2" />,
          textColor: 'text-blue-600'
        };
    }
  };
  
  const alerts = data || [];
  const displayAlerts = showAll ? alerts : alerts.slice(0, 3);
  
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
        ) : alerts.length === 0 ? (
          <div className="flex items-center justify-center h-32 bg-green-50 rounded p-4 border-l-4 border-green-500">
            <p className="text-green-600">Aucune alerte active 👍</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayAlerts.map((alert) => {
              const style = getAlertStyle(alert.type);
              return (
                <div 
                  key={alert.id} 
                  className={`${style.bg} border-l-4 ${style.border} p-4 rounded relative`}
                >
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="absolute top-1 right-1 h-6 w-6 text-neutral-400 hover:text-danger"
                    onClick={() => handleResolveAlert(alert.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                  <div className="flex items-start pr-6">
                    {style.icon}
                    <div>
                      <p className={`${style.textColor} font-medium`}>
                        {alert.type === 'critical' ? 'Critique' : 
                         alert.type === 'warning' ? 'Avertissement' : 'Information'}
                      </p>
                      <p className="text-neutral-400 text-sm">{alert.message}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
