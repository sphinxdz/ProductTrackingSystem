import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { ConsumptionChart } from "@/components/dashboard/consumption-chart";
import { ProductUsageChart } from "@/components/dashboard/product-usage-chart";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { AlertsPanel } from "@/components/dashboard/alerts-panel";
import { DashboardStats } from "@shared/schema";
import { Package, Users, Wrench, Activity } from "lucide-react";

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['/api/dashboard/stats'],
    queryFn: async () => {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }
      return response.json();
    }
  });
  
  return (
    <Layout title="Système de Gestion de Produits">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-neutral-500">Tableau de bord</h2>
        <p className="text-neutral-400">Aperçu de la gestion des produits et de la consommation</p>
      </div>
      
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <SummaryCard 
          title="Produits"
          value={isLoading ? "..." : stats?.totalProducts.toString() || "0"}
          icon={<Package className="h-5 w-5 text-primary" />}
          trend={{
            value: isLoading ? "..." : stats?.productIncrease || "0%",
            isPositive: true,
            label: "vs dernier mois"
          }}
          bgColor="bg-blue-100"
        />
        
        <SummaryCard 
          title="Clients"
          value={isLoading ? "..." : stats?.totalClients.toString() || "0"}
          icon={<Users className="h-5 w-5 text-secondary" />}
          trend={{
            value: isLoading ? "..." : stats?.clientIncrease || "0%",
            isPositive: true,
            label: "vs dernier mois"
          }}
          bgColor="bg-green-100"
        />
        
        <SummaryCard 
          title="Outils"
          value={isLoading ? "..." : stats?.totalTools.toString() || "0"}
          icon={<Wrench className="h-5 w-5 text-accent" />}
          trend={{
            value: isLoading ? "..." : stats?.toolIncrease || "0%",
            isPositive: true,
            label: "vs dernier mois"
          }}
          bgColor="bg-orange-100"
        />
        
        <SummaryCard 
          title="Consommation journalière"
          value={isLoading ? "..." : stats?.dailyConsumption || "0 kg"}
          icon={<Activity className="h-5 w-5 text-danger" />}
          trend={{
            value: isLoading ? "..." : stats?.consumptionDecrease || "0%",
            isPositive: false,
            label: "vs hier"
          }}
          bgColor="bg-red-100"
        />
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ConsumptionChart title="Consommation par magasin" />
        <ProductUsageChart title="Consommation par calibre" />
      </div>
      
      {/* Recent Activity and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RecentActivity title="Activité récente" />
        </div>
        <div className="lg:col-span-1">
          <AlertsPanel title="Alertes" />
        </div>
      </div>
    </Layout>
  );
}
