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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Store, insertStoreSchema } from "@shared/schema";
import { Store as StoreIcon, Plus, Trash2, Edit, MapPin, User } from "lucide-react";

export default function Stores() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStore, setEditingStore] = useState<Store | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, store: Store | null }>({
    open: false,
    store: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch stores
  const { data: stores, isLoading: storesLoading } = useQuery<Store[]>({
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
  const formSchema = insertStoreSchema;
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      location: "",
      manager: "",
    },
  });
  
  // Create/Update store mutation
  const storeMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (editingStore) {
        // Update existing store
        const res = await apiRequest('PUT', `/api/stores/${editingStore.id}`, data);
        return res.json();
      } else {
        // Create new store
        const res = await apiRequest('POST', '/api/stores', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setDialogOpen(false);
      setEditingStore(null);
      toast({
        title: editingStore ? "Magasin mis à jour" : "Magasin créé",
        description: editingStore 
          ? "Le magasin a été mis à jour avec succès" 
          : "Le nouveau magasin a été créé avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de ${editingStore ? 'mettre à jour' : 'créer'} le magasin: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete store mutation
  const deleteStoreMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/stores/${id}`, undefined);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/stores'] });
      setDeleteDialog({ open: false, store: null });
      toast({
        title: "Magasin supprimé",
        description: "Le magasin a été supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le magasin: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    storeMutation.mutate(data);
  };
  
  // Handle edit store
  const handleEditStore = (store: Store) => {
    setEditingStore(store);
    form.reset({
      name: store.name,
      location: store.location || "",
      manager: store.manager || "",
    });
    setDialogOpen(true);
  };
  
  // Handle delete store
  const handleDeleteStore = (store: Store) => {
    setDeleteDialog({ open: true, store });
  };
  
  // Handle add new store
  const handleAddStore = () => {
    setEditingStore(null);
    form.reset({
      name: "",
      location: "",
      manager: "",
    });
    setDialogOpen(true);
  };
  
  // DataTable columns
  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as keyof Store,
      cell: (store: Store) => (
        <div className="font-medium">{store.name}</div>
      ),
      sortable: true,
    },
    {
      header: "Emplacement",
      accessorKey: "location" as keyof Store,
      cell: (store: Store) => (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          {store.location || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Responsable",
      accessorKey: "manager" as keyof Store,
      cell: (store: Store) => (
        <div className="flex items-center">
          <User className="h-4 w-4 mr-2 text-muted-foreground" />
          {store.manager || "-"}
        </div>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Store,
      cell: (store: Store) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditStore(store);
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
              handleDeleteStore(store);
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
          <h2 className="text-2xl font-medium text-neutral-500">Magasins</h2>
          <p className="text-neutral-400">Gérer les magasins et leurs informations</p>
        </div>
        <Button onClick={handleAddStore} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un magasin
        </Button>
      </div>
      
      {storesLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des magasins...</p>
        </div>
      ) : (
        <DataTable
          data={stores || []}
          columns={columns}
          searchable
          pagination
          onRowClick={handleEditStore}
        />
      )}
      
      {/* Create/Edit Store Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StoreIcon className="h-5 w-5" />
              {editingStore ? "Modifier le magasin" : "Ajouter un magasin"}
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
                      <Input {...field} placeholder="Nom du magasin" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emplacement</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ville, adresse..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="manager"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Responsable</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Nom du responsable" />
                    </FormControl>
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
                  disabled={storeMutation.isPending}
                >
                  {storeMutation.isPending ? "En cours..." : (editingStore ? "Mettre à jour" : "Créer")}
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
            Êtes-vous sûr de vouloir supprimer le magasin&nbsp;
            <span className="font-semibold">{deleteDialog.store?.name}</span>&nbsp;?
            Cette action ne peut pas être annulée.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, store: null })}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog.store && deleteStoreMutation.mutate(deleteDialog.store.id)}
              disabled={deleteStoreMutation.isPending}
            >
              {deleteStoreMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
