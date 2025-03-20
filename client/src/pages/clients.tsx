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
import { Client, Store, insertClientSchema } from "@shared/schema";
import { Users, Plus, Trash2, Edit, Mail, Phone, Store as StoreIcon } from "lucide-react";

export default function Clients() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, client: Client | null }>({
    open: false,
    client: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch clients
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
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
  
  // Form schema with validation
  const formSchema = insertClientSchema.extend({
    storeId: z.union([z.string(), z.number()]).transform(val => Number(val)),
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      storeId: "",
    },
  });
  
  // Create/Update client mutation
  const clientMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (editingClient) {
        // Update existing client
        const res = await apiRequest('PUT', `/api/clients/${editingClient.id}`, data);
        return res.json();
      } else {
        // Create new client
        const res = await apiRequest('POST', '/api/clients', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setDialogOpen(false);
      setEditingClient(null);
      toast({
        title: editingClient ? "Client mis à jour" : "Client créé",
        description: editingClient 
          ? "Le client a été mis à jour avec succès" 
          : "Le nouveau client a été créé avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de ${editingClient ? 'mettre à jour' : 'créer'} le client: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/clients/${id}`, undefined);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setDeleteDialog({ open: false, client: null });
      toast({
        title: "Client supprimé",
        description: "Le client a été supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le client: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    clientMutation.mutate(data);
  };
  
  // Handle edit client
  const handleEditClient = (client: Client) => {
    setEditingClient(client);
    form.reset({
      name: client.name,
      email: client.email || "",
      phone: client.phone || "",
      storeId: client.storeId,
    });
    setDialogOpen(true);
  };
  
  // Handle delete client
  const handleDeleteClient = (client: Client) => {
    setDeleteDialog({ open: true, client });
  };
  
  // Handle add new client
  const handleAddClient = () => {
    setEditingClient(null);
    form.reset({
      name: "",
      email: "",
      phone: "",
      storeId: "",
    });
    setDialogOpen(true);
  };
  
  // DataTable columns
  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as keyof Client,
      cell: (client: Client) => (
        <div className="font-medium">{client.name}</div>
      ),
      sortable: true,
    },
    {
      header: "Email",
      accessorKey: "email" as keyof Client,
      cell: (client: Client) => (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          {client.email || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Téléphone",
      accessorKey: "phone" as keyof Client,
      cell: (client: Client) => (
        <div className="flex items-center">
          <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
          {client.phone || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Magasin",
      accessorKey: "storeId" as keyof Client,
      cell: (client: Client) => {
        const store = stores?.find(s => s.id === client.storeId);
        return (
          <div className="flex items-center">
            <StoreIcon className="h-4 w-4 mr-2 text-muted-foreground" />
            {store?.name || `ID: ${client.storeId}`}
          </div>
        );
      },
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Client,
      cell: (client: Client) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditClient(client);
            }}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            className="text-destructive"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteClient(client);
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];
  
  return (
    <Layout title="Système de Gestion de Produits">
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-medium text-neutral-500">Clients</h2>
          <p className="text-neutral-400">Gérer les clients et leurs informations</p>
        </div>
        <Button onClick={handleAddClient} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un client
        </Button>
      </div>
      
      {clientsLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des clients...</p>
        </div>
      ) : (
        <DataTable
          data={clients || []}
          columns={columns}
          searchable
          pagination
          onRowClick={handleEditClient}
        />
      )}
      
      {/* Create/Edit Client Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {editingClient ? "Modifier le client" : "Ajouter un client"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nom</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du client" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@exemple.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Téléphone</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Numéro de téléphone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="storeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Magasin</FormLabel>
                    <Select
                      value={field.value.toString()} 
                      onValueChange={field.onChange}
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
                  disabled={clientMutation.isPending}
                >
                  {clientMutation.isPending ? "En cours..." : (editingClient ? "Mettre à jour" : "Créer")}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <Trash2 className="h-5 w-5" />
              Confirmer la suppression
            </DialogTitle>
          </DialogHeader>
          
          <p>
            Êtes-vous sûr de vouloir supprimer le client&nbsp;
            <span className="font-semibold">{deleteDialog.client?.name}</span>&nbsp;?
            Cette action ne peut pas être annulée.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, client: null })}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog.client && deleteClientMutation.mutate(deleteDialog.client.id)}
              disabled={deleteClientMutation.isPending}
            >
              {deleteClientMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
