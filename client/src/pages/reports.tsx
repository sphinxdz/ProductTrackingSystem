import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend 
} from "recharts";
import { Consumption, ConsumptionByCaliber, Product, Tool, Client, Store } from "@shared/schema";
import { format, subDays, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";

type DateRangeType = "7days" | "30days" | "thisMonth" | "lastMonth" | "allTime";

export default function Reports() {
  const [activeTab, setActiveTab] = useState("consumption");
  const [dateRange, setDateRange] = useState<DateRangeType>("30days");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  
  // Date range options for filtering
  const dateRangeOptions = {
    "7days": {
      label: "7 derniers jours",
      startDate: subDays(new Date(), 7),
      endDate: new Date()
    },
    "30days": {
      label: "30 derniers jours",
      startDate: subDays(new Date(), 30),
      endDate: new Date()
    },
    "thisMonth": {
      label: "Mois en cours",
      startDate: startOfMonth(new Date()),
      endDate: new Date()
    },
    "lastMonth": {
      label: "Mois précédent",
      startDate: startOfMonth(subDays(startOfMonth(new Date()), 1)),
      endDate: endOfMonth(subDays(startOfMonth(new Date()), 1))
    },
    "allTime": {
      label: "Tout le temps",
      startDate: new Date(0),
      endDate: new Date()
    }
  };
  
  // Fetch consumptions
  const { data: consumptions } = useQuery<Consumption[]>({
    queryKey: ['/api/consumptions'],
    queryFn: async () => {
      const response = await fetch('/api/consumptions');
      if (!response.ok) {
        throw new Error('Failed to fetch consumptions');
      }
      return response.json();
    }
  });
  
  // Fetch consumption by caliber
  const { data: consumptionByCaliber } = useQuery<ConsumptionByCaliber[]>({
    queryKey: ['/api/dashboard/consumption-by-caliber', dateRange === "7days" ? "7" : dateRange === "30days" ? "30" : "90"],
    queryFn: async () => {
      const days = dateRange === "7days" ? "7" : dateRange === "30days" ? "30" : "90";
      const response = await fetch(`/api/dashboard/consumption-by-caliber?days=${days}`);
      if (!response.ok) {
        throw new Error('Failed to fetch caliber consumption data');
      }
      return response.json();
    }
  });
  
  // Fetch related data
  const { data: stores } = useQuery<Store[]>({
    queryKey: ['/api/stores'],
    queryFn: async () => {
      const response = await fetch('/api/stores');
      if (!response.ok) {
        throw new Error('Failed to fetch stores');
      }
      return response.json();
    }
  });
  
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });
  
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    }
  });
  
  const { data: tools } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      return response.json();
    }
  });
  
  // Filter consumptions by date range and store
  const filteredConsumptions = consumptions?.filter(consumption => {
    const consumptionDate = new Date(consumption.date);
    const isInDateRange = consumptionDate >= dateRangeOptions[dateRange].startDate && 
                        consumptionDate <= dateRangeOptions[dateRange].endDate;
    
    const isInSelectedStore = !selectedStoreId || consumption.storeId === parseInt(selectedStoreId);
    
    return isInDateRange && isInSelectedStore;
  }) || [];
  
  // Prepare data for consumption by date chart
  const consumptionByDateData = (() => {
    const consumptionMap = new Map<string, number>();
    
    filteredConsumptions.forEach(consumption => {
      const date = format(new Date(consumption.date), 'dd/MM/yyyy');
      const quantity = parseFloat(consumption.quantity.toString());
      
      if (consumptionMap.has(date)) {
        consumptionMap.set(date, consumptionMap.get(date)! + quantity);
      } else {
        consumptionMap.set(date, quantity);
      }
    });
    
    return Array.from(consumptionMap.entries()).map(([date, quantity]) => ({
      date,
      quantity
    })).sort((a, b) => {
      const dateA = a.date.split('/').reverse().join('-');
      const dateB = b.date.split('/').reverse().join('-');
      return dateA.localeCompare(dateB);
    });
  })();
  
  // Prepare data for consumption by tool chart
  const consumptionByToolData = (() => {
    const toolMap = new Map<number, number>();
    
    filteredConsumptions.forEach(consumption => {
      const toolId = consumption.toolId;
      const quantity = parseFloat(consumption.quantity.toString());
      
      if (toolMap.has(toolId)) {
        toolMap.set(toolId, toolMap.get(toolId)! + quantity);
      } else {
        toolMap.set(toolId, quantity);
      }
    });
    
    return Array.from(toolMap.entries()).map(([toolId, quantity]) => {
      const tool = tools?.find(t => t.id === toolId);
      return {
        toolId,
        toolName: tool ? tool.name : `ID: ${toolId}`,
        toolCode: tool ? tool.code : `ID: ${toolId}`,
        quantity
      };
    }).sort((a, b) => b.quantity - a.quantity);
  })();
  
  // Prepare data for consumption by client chart
  const consumptionByClientData = (() => {
    const clientMap = new Map<number, number>();
    
    filteredConsumptions.forEach(consumption => {
      const clientId = consumption.clientId;
      const quantity = parseFloat(consumption.quantity.toString());
      
      if (clientMap.has(clientId)) {
        clientMap.set(clientId, clientMap.get(clientId)! + quantity);
      } else {
        clientMap.set(clientId, quantity);
      }
    });
    
    return Array.from(clientMap.entries())
      .map(([clientId, quantity]) => {
        const client = clients?.find(c => c.id === clientId);
        return {
          clientId,
          clientName: client ? client.name : `ID: ${clientId}`,
          storeId: client ? client.storeId : 0,
          quantity
        };
      })
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10); // Top 10 clients
  })();
  
  return (
    <Layout title="Système de Gestion de Produits">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-neutral-500">Rapports</h2>
          <p className="text-neutral-400">Analyser les données de consommation et de performance</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={dateRange} onValueChange={(value) => setDateRange(value as DateRangeType)}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 derniers jours</SelectItem>
              <SelectItem value="30days">30 derniers jours</SelectItem>
              <SelectItem value="thisMonth">Mois en cours</SelectItem>
              <SelectItem value="lastMonth">Mois précédent</SelectItem>
              <SelectItem value="allTime">Tout le temps</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={selectedStoreId} onValueChange={setSelectedStoreId}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Tous les magasins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les magasins</SelectItem>
              {stores?.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <Tabs defaultValue="consumption" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="consumption">Consommation</TabsTrigger>
          <TabsTrigger value="byCalibres">Par calibres</TabsTrigger>
          <TabsTrigger value="byTools">Par outils</TabsTrigger>
          <TabsTrigger value="byClients">Par clients</TabsTrigger>
        </TabsList>
        
        {/* Consumption Tab */}
        <TabsContent value="consumption">
          <Card>
            <CardHeader>
              <CardTitle>Consommation journalière</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {consumptionByDateData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={consumptionByDateData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="date" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        name="Quantité" 
                        unit=" kg"
                        tick={{ fontSize: 12 }}
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
                      <Legend />
                      <Line 
                        type="monotone" 
                        dataKey="quantity" 
                        name="Consommation" 
                        stroke="#1976D2" 
                        strokeWidth={2}
                        activeDot={{ r: 8 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-8 space-y-2">
                <h3 className="text-lg font-medium">Statistiques de la période</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-600">Consommation totale</p>
                    <p className="text-2xl font-bold">
                      {filteredConsumptions.reduce((total, c) => total + parseFloat(c.quantity.toString()), 0).toFixed(2)} kg
                    </p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-green-600">Nombre de transactions</p>
                    <p className="text-2xl font-bold">{filteredConsumptions.length}</p>
                  </div>
                  <div className="bg-amber-50 p-4 rounded-lg">
                    <p className="text-sm text-amber-600">Moyenne journalière</p>
                    <p className="text-2xl font-bold">
                      {consumptionByDateData.length > 0 
                        ? (filteredConsumptions.reduce((total, c) => total + parseFloat(c.quantity.toString()), 0) / consumptionByDateData.length).toFixed(2) 
                        : "0"} kg
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Calibres Tab */}
        <TabsContent value="byCalibres">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par calibre</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {consumptionByCaliber?.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={consumptionByCaliber}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={150}
                        fill="#8884d8"
                        dataKey="consumption"
                        nameKey="caliberName"
                        label={({ caliberName, percentage }) => `${caliberName} (${percentage.toFixed(0)}%)`}
                      >
                        {consumptionByCaliber?.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value, name) => [
                          `${value} kg (${consumptionByCaliber?.find(item => item.caliberName === name)?.percentage.toFixed(0)}%)`, 
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
                )}
              </div>
              
              <div className="mt-8 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Calibre
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consommation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Pourcentage
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consumptionByCaliber?.map((caliber) => (
                      <tr key={caliber.caliberId}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-4 w-4 rounded-full mr-2" style={{backgroundColor: caliber.color}}></div>
                            <span className="font-medium">{caliber.caliberName}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caliber.consumption.toFixed(2)} kg
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {caliber.percentage.toFixed(2)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Tools Tab */}
        <TabsContent value="byTools">
          <Card>
            <CardHeader>
              <CardTitle>Consommation par outil</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {consumptionByToolData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={consumptionByToolData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 50 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis 
                        dataKey="toolCode" 
                        angle={-45} 
                        textAnchor="end"
                        height={80}
                        tick={{ fontSize: 12 }}
                      />
                      <YAxis 
                        name="Quantité" 
                        unit=" kg"
                        tick={{ fontSize: 12 }}
                      />
                      <Tooltip 
                        formatter={(value) => [`${value} kg`, 'Consommation']}
                        labelFormatter={(label) => {
                          const tool = consumptionByToolData.find(t => t.toolCode === label);
                          return tool ? `${tool.toolName} (${tool.toolCode})` : label;
                        }}
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                        }}
                      />
                      <Legend />
                      <Bar 
                        dataKey="quantity" 
                        name="Consommation" 
                        fill="#1976D2" 
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-8 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Code
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Nom
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consommation
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Limite quotidienne
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consumptionByToolData.map((item) => {
                      const tool = tools?.find(t => t.id === item.toolId);
                      return (
                        <tr key={item.toolId}>
                          <td className="px-6 py-4 whitespace-nowrap font-mono">
                            {item.toolCode}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {item.toolName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity.toFixed(2)} kg
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {tool ? `${tool.maxDailyConsumption} kg/jour` : "-"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* By Clients Tab */}
        <TabsContent value="byClients">
          <Card>
            <CardHeader>
              <CardTitle>Top 10 des clients par consommation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[400px]">
                {consumptionByClientData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <p>Aucune donnée disponible pour la période sélectionnée</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={consumptionByClientData}
                      margin={{ top: 20, right: 30, left: 150, bottom: 20 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                      <XAxis type="number" unit=" kg" />
                      <YAxis 
                        type="category" 
                        dataKey="clientName" 
                        tick={{ fontSize: 12 }}
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
                      <Legend />
                      <Bar 
                        dataKey="quantity" 
                        name="Consommation" 
                        fill="#388E3C" 
                        radius={[0, 4, 4, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
              
              <div className="mt-8 overflow-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Client
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Magasin
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Consommation
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {consumptionByClientData.map((item) => {
                      const store = stores?.find(s => s.id === item.storeId);
                      return (
                        <tr key={item.clientId}>
                          <td className="px-6 py-4 whitespace-nowrap font-medium">
                            {item.clientName}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {store?.name || `ID: ${item.storeId}`}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {item.quantity.toFixed(2)} kg
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
