import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Layout } from "@/components/layout/layout";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Consumption, Client, Product, Tool, Store, insertConsumptionSchema } from "@shared/schema";
import { Plus, Calendar, User, Package, Wrench as ToolIcon, Store as StoreIcon } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ConsumptionPage() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch consumptions
  const { data: consumptions, isLoading: consumptionsLoading } = useQuery<Consumption[]>({
    queryKey: ['/api/consumptions'],
    queryFn: async () => {
      const url = selectedStoreId 
        ? `/api/consumptions?storeId=${selectedStoreId}` 
        : '/api/consumptions';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch consumptions');
      }
      return response.json();
    }
  });
  
  // Fetch stores for dropdown
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
  
  // Fetch clients for dropdown
  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients', selectedStoreId],
    queryFn: async () => {
      const url = selectedStoreId 
        ? `/api/clients?storeId=${selectedStoreId}` 
        : '/api/clients';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      return response.json();
    },
    enabled: dialogOpen
  });
  
  // Fetch products for dropdown
  const { data: products } = useQuery<Product[]>({
    queryKey: ['/api/products', selectedStoreId],
    queryFn: async () => {
      const url = selectedStoreId 
        ? `/api/products?storeId=${selectedStoreId}` 
        : '/api/products';
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    },
    enabled: dialogOpen
  });
  
  // Fetch tools for dropdown
  const { data: tools } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      return response.json();
    },
    enabled: dialogOpen
  });
  
  // Form schema with validation
  const formSchema = insertConsumptionSchema.extend({
    clientId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    productId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    toolId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    storeId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    quantity: z.union([z.string(), z.number()]).transform(val => String(val)),
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      clientId: "",
      productId: "",
      toolId: "",
      storeId: "",
      quantity: "0",
    },
  });
  
  // Watch for storeId changes
  const watchedStoreId = form.watch("storeId");
  
  // Create consumption mutation
  const consumptionMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      const res = await apiRequest('POST', '/api/consumptions', data);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/consumptions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/consumption-by-store'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/consumption-by-caliber'] });
      queryClient.invalidateQueries({ queryKey: ['/api/activities'] });
      queryClient.invalidateQueries({ queryKey: ['/api/alerts'] });
      setDialogOpen(false);
      toast({
        title: "Consommation enregistrée",
        description: "La consommation a été enregistrée avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible d'enregistrer la consommation: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    consumptionMutation.mutate(data);
  };
  
  // Handle add new consumption
  const handleAddConsumption = () => {
    form.reset({
      clientId: "",
      productId: "",
      toolId: "",
      storeId: selectedStoreId || "",
      quantity: "0",
    });
    setDialogOpen(true);
  };
  
  // Update client and product lists when store changes
  const handleStoreChange = (value: string) => {
    form.setValue("storeId", value);
    form.setValue("clientId", "");
    form.setValue("productId", "");
    queryClient.invalidateQueries({ queryKey: ['/api/clients', value] });
    queryClient.invalidateQueries({ queryKey: ['/api/products', value] });
  };
  
  // DataTable columns
  const columns = [
    {
      header: "Date",
      accessorKey: "date" as keyof Consumption,
      cell: (consumption: Consumption) => (
        <div className="flex items-center">
          <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
          {format(new Date(consumption.date), 'dd/MM/yyyy HH:mm', { locale: fr })}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Client",
      accessorKey: "clientId" as keyof Consumption,
      cell: (consumption: Consumption) => {
        const client = clients?.find(c => c.id === consumption.clientId);
        return (
          <div className="flex items-center">
            <User className="h-4 w-4 mr-2 text-muted-foreground" />
            {client?.name || `ID: ${consumption.clientId}`}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Produit",
      accessorKey: "productId" as keyof Consumption,
      cell: (consumption: Consumption) => {
        const product = products?.find(p => p.id === consumption.productId);
        return (
          <div className="flex items-center">
            <Package className="h-4 w-4 mr-2 text-muted-foreground" />
            {product?.name || `ID: ${consumption.productId}`}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Outil",
      accessorKey: "toolId" as keyof Consumption,
      cell: (consumption: Consumption) => {
        const tool = tools?.find(t => t.id === consumption.toolId);
        return (
          <div className="flex items-center">
            <ToolIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {tool?.code || `ID: ${consumption.toolId}`}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Magasin",
      accessorKey: "storeId" as keyof Consumption,
      cell: (consumption: Consumption) => {
        const store = stores?.find(s => s.id === consumption.storeId);
        return (
          <div className="flex items-center">
            <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {store?.name || `ID: ${consumption.storeId}`}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Quantité",
      accessorKey: "quantity" as keyof Consumption,
      cell: (consumption: Consumption) => (
        <div className="font-medium">{consumption.quantity} kg</div>
      ),
      sortable: true,
    },
  ];
  
  // Handle store filter change
  const handleStoreFilterChange = (value: string) => {
    setSelectedStoreId(value);
    queryClient.invalidateQueries({ queryKey: ['/api/consumptions'] });
  };
  
  return (
    <Layout title="Système de Gestion de Produits">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-neutral-500">Consommation</h2>
          <p className="text-neutral-400">Suivi de la consommation des produits</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={selectedStoreId} onValueChange={handleStoreFilterChange}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Tous les magasins" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Tous les magasins</SelectItem>
              {stores?.map((store) => (
                <SelectItem key={store.id} value={store.id.toString()}>
                  {store.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddConsumption}>
            <Plus className="mr-2 h-4 w-4" /> Nouvelle consommation
          </Button>
        </div>
      </div>
      
      {consumptionsLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des données de consommation...</p>
        </div>
      ) : (
        <DataTable
          data={consumptions || []}
          columns={columns}
          searchable
          pagination
        />
      )}
      
      {/* Create Consumption Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Enregistrer une consommation
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Magasin</FormLabel>
                    <Select
                      value={field.value.toString()} 
                      onValueChange={handleStoreChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un magasin" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {stores?.map((store) => (
                          <SelectItem key={store.id} value={store.id.toString()}>
                            {store.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        value={field.value.toString()} 
                        onValueChange={field.onChange}
                        disabled={!watchedStoreId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.filter(client => !watchedStoreId || client.storeId === parseInt(watchedStoreId))
                            .map((client) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="productId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Produit</FormLabel>
                      <Select
                        value={field.value.toString()} 
                        onValueChange={field.onChange}
                        disabled={!watchedStoreId}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un produit" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {products?.filter(product => !watchedStoreId || product.storeId === parseInt(watchedStoreId))
                            .map((product) => (
                              <SelectItem key={product.id} value={product.id.toString()}>
                                {product.name}
                              </SelectItem>
                            ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="toolId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Outil</FormLabel>
                      <Select
                        value={field.value.toString()} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un outil" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {tools?.map((tool) => (
                            <SelectItem key={tool.id} value={tool.id.toString()}>
                              {tool.code} - {tool.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantité (kg)</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDialogOpen(false)}
                >
                  Annuler
                </Button>
                <Button 
                  type="submit" 
                  disabled={consumptionMutation.isPending}
                >
                  {consumptionMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
