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
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Product, Caliber, Store, insertProductSchema } from "@shared/schema";
import { Package, Plus, Trash2, Edit } from "lucide-react";

export default function Products() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, product: Product | null }>({
    open: false,
    product: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery<Product[]>({
    queryKey: ['/api/products'],
    queryFn: async () => {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      return response.json();
    }
  });
  
  // Fetch calibers for dropdown
  const { data: calibers } = useQuery<Caliber[]>({
    queryKey: ['/api/calibers'],
    queryFn: async () => {
      const response = await fetch('/api/calibers');
      if (!response.ok) {
        throw new Error('Failed to fetch calibers');
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
  
  // Create product form schema with validation
  const formSchema = insertProductSchema.extend({
    caliberId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    storeId: z.union([z.string(), z.number()]).transform(val => Number(val)),
    stock: z.union([z.string(), z.number()]).transform(val => String(val)),
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      caliberId: "",
      storeId: "",
      unit: "kg",
      stock: "0",
    },
  });
  
  // Create/Update product mutation
  const productMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (editingProduct) {
        // Update existing product
        const res = await apiRequest('PUT', `/api/products/${editingProduct.id}`, data);
        return res.json();
      } else {
        // Create new product
        const res = await apiRequest('POST', '/api/products', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDialogOpen(false);
      setEditingProduct(null);
      toast({
        title: editingProduct ? "Produit mis à jour" : "Produit créé",
        description: editingProduct 
          ? "Le produit a été mis à jour avec succès" 
          : "Le nouveau produit a été créé avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de ${editingProduct ? 'mettre à jour' : 'créer'} le produit: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete product mutation
  const deleteProductMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/products/${id}`, undefined);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      setDeleteDialog({ open: false, product: null });
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer le produit: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    productMutation.mutate(data);
  };
  
  // Handle edit product
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    form.reset({
      name: product.name,
      description: product.description || "",
      caliberId: product.caliberId,
      storeId: product.storeId,
      unit: product.unit,
      stock: product.stock.toString(),
    });
    setDialogOpen(true);
  };
  
  // Handle delete product
  const handleDeleteProduct = (product: Product) => {
    setDeleteDialog({ open: true, product });
  };
  
  // Handle add new product
  const handleAddProduct = () => {
    setEditingProduct(null);
    form.reset({
      name: "",
      description: "",
      caliberId: "",
      storeId: "",
      unit: "kg",
      stock: "0",
    });
    setDialogOpen(true);
  };
  
  // DataTable columns
  const columns = [
    {
      header: "Nom",
      accessorKey: "name" as keyof Product,
      cell: (product: Product) => (
        <div className="font-medium">{product.name}</div>
      ),
      sortable: true,
    },
    {
      header: "Calibre",
      accessorKey: "caliberId" as keyof Product,
      cell: (product: Product) => {
        const caliber = calibers?.find(c => c.id === product.caliberId);
        return caliber?.name || `ID: ${product.caliberId}`;
      },
      sortable: true,
    },
    {
      header: "Magasin",
      accessorKey: "storeId" as keyof Product,
      cell: (product: Product) => {
        const store = stores?.find(s => s.id === product.storeId);
        return store?.name || `ID: ${product.storeId}`;
      },
      sortable: true,
    },
    {
      header: "Stock",
      accessorKey: "stock" as keyof Product,
      cell: (product: Product) => `${product.stock} ${product.unit}`,
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Product,
      cell: (product: Product) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditProduct(product);
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
              handleDeleteProduct(product);
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
          <h2 className="text-2xl font-medium text-neutral-500">Produits</h2>
          <p className="text-neutral-400">Gérer les produits et leurs calibres</p>
        </div>
        <Button onClick={handleAddProduct} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
        </Button>
      </div>
      
      {productsLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des produits...</p>
        </div>
      ) : (
        <DataTable
          data={products || []}
          columns={columns}
          searchable
          pagination
          onRowClick={handleEditProduct}
        />
      )}
      
      {/* Create/Edit Product Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              {editingProduct ? "Modifier le produit" : "Ajouter un produit"}
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
                      <Input {...field} placeholder="Nom du produit" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="caliberId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Calibre</FormLabel>
                      <Select
                        value={field.value.toString()} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un calibre" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {calibers?.map((caliber) => (
                            <SelectItem key={caliber.id} value={caliber.id.toString()}>
                              {caliber.name}
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
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="stock"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Stock</FormLabel>
                      <FormControl>
                        <Input {...field} type="number" min="0" step="0.01" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unité</FormLabel>
                      <Select
                        value={field.value} 
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner une unité" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="kg">Kilogramme (kg)</SelectItem>
                          <SelectItem value="g">Gramme (g)</SelectItem>
                          <SelectItem value="l">Litre (l)</SelectItem>
                          <SelectItem value="unité">Unité</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Description du produit" rows={3} />
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
                  disabled={productMutation.isPending}
                >
                  {productMutation.isPending ? "En cours..." : (editingProduct ? "Mettre à jour" : "Créer")}
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
            Êtes-vous sûr de vouloir supprimer le produit&nbsp;
            <span className="font-semibold">{deleteDialog.product?.name}</span>&nbsp;?
            Cette action ne peut pas être annulée.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, product: null })}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog.product && deleteProductMutation.mutate(deleteDialog.product.id)}
              disabled={deleteProductMutation.isPending}
            >
              {deleteProductMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
