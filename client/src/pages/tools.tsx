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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tool, insertToolSchema } from "@shared/schema";
import { Wrench as ToolIcon, Plus, Trash2, Edit, AlertTriangle } from "lucide-react";

export default function Tools() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean, tool: Tool | null }>({
    open: false,
    tool: null
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch tools
  const { data: tools, isLoading: toolsLoading } = useQuery<Tool[]>({
    queryKey: ['/api/tools'],
    queryFn: async () => {
      const response = await fetch('/api/tools');
      if (!response.ok) {
        throw new Error('Failed to fetch tools');
      }
      return response.json();
    }
  });
  
  // Form schema with validation
  const formSchema = insertToolSchema.extend({
    maxDailyConsumption: z.union([z.string(), z.number()]).transform(val => String(val)),
  });
  
  // Form setup
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      code: "",
      name: "",
      description: "",
      maxDailyConsumption: "0",
    },
  });
  
  // Create/Update tool mutation
  const toolMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      if (editingTool) {
        // Update existing tool
        const res = await apiRequest('PUT', `/api/tools/${editingTool.id}`, data);
        return res.json();
      } else {
        // Create new tool
        const res = await apiRequest('POST', '/api/tools', data);
        return res.json();
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      setDialogOpen(false);
      setEditingTool(null);
      toast({
        title: editingTool ? "Outil mis à jour" : "Outil créé",
        description: editingTool 
          ? "L'outil a été mis à jour avec succès" 
          : "Le nouvel outil a été créé avec succès",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de ${editingTool ? 'mettre à jour' : 'créer'} l'outil: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Delete tool mutation
  const deleteToolMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest('DELETE', `/api/tools/${id}`, undefined);
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tools'] });
      setDeleteDialog({ open: false, tool: null });
      toast({
        title: "Outil supprimé",
        description: "L'outil a été supprimé avec succès",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: `Impossible de supprimer l'outil: ${error}`,
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (data: z.infer<typeof formSchema>) => {
    toolMutation.mutate(data);
  };
  
  // Handle edit tool
  const handleEditTool = (tool: Tool) => {
    setEditingTool(tool);
    form.reset({
      code: tool.code,
      name: tool.name,
      description: tool.description || "",
      maxDailyConsumption: tool.maxDailyConsumption.toString(),
    });
    setDialogOpen(true);
  };
  
  // Handle delete tool
  const handleDeleteTool = (tool: Tool) => {
    setDeleteDialog({ open: true, tool });
  };
  
  // Handle add new tool
  const handleAddTool = () => {
    setEditingTool(null);
    form.reset({
      code: "",
      name: "",
      description: "",
      maxDailyConsumption: "0",
    });
    setDialogOpen(true);
  };
  
  // DataTable columns
  const columns = [
    {
      header: "Code",
      accessorKey: "code" as keyof Tool,
      cell: (tool: Tool) => (
        <div className="font-mono">{tool.code}</div>
      ),
      sortable: true,
    },
    {
      header: "Nom",
      accessorKey: "name" as keyof Tool,
      cell: (tool: Tool) => (
        <div className="font-medium">{tool.name}</div>
      ),
      sortable: true,
    },
    {
      header: "Description",
      accessorKey: "description" as keyof Tool,
      cell: (tool: Tool) => (
        <div className="text-muted-foreground">{tool.description || "-"}</div>
      ),
      sortable: true,
    },
    {
      header: "Limite quotidienne",
      accessorKey: "maxDailyConsumption" as keyof Tool,
      cell: (tool: Tool) => (
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 mr-2 text-accent" />
          {tool.maxDailyConsumption} kg/jour
        </div>
      ),
      sortable: true,
    },
    {
      header: "Actions",
      accessorKey: "id" as keyof Tool,
      cell: (tool: Tool) => (
        <div className="flex gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={(e) => {
              e.stopPropagation();
              handleEditTool(tool);
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
              handleDeleteTool(tool);
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
          <h2 className="text-2xl font-medium text-neutral-500">Outils</h2>
          <p className="text-neutral-400">Gérer les outils et leurs limites de consommation</p>
        </div>
        <Button onClick={handleAddTool} className="self-start">
          <Plus className="mr-2 h-4 w-4" /> Ajouter un outil
        </Button>
      </div>
      
      {toolsLoading ? (
        <div className="flex justify-center items-center h-64">
          <p>Chargement des outils...</p>
        </div>
      ) : (
        <DataTable
          data={tools || []}
          columns={columns}
          searchable
          pagination
          onRowClick={handleEditTool}
        />
      )}
      
      {/* Create/Edit Tool Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ToolIcon className="h-5 w-5" />
              {editingTool ? "Modifier l'outil" : "Ajouter un outil"}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Code</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="XYZ-123" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nom de l'outil" />
                      </FormControl>
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
                      <Textarea {...field} placeholder="Description de l'outil" rows={3} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="maxDailyConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Limite de consommation quotidienne (kg)</FormLabel>
                    <FormControl>
                      <Input {...field} type="number" min="0" step="0.01" />
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
                  disabled={toolMutation.isPending}
                >
                  {toolMutation.isPending ? "En cours..." : (editingTool ? "Mettre à jour" : "Créer")}
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
            Êtes-vous sûr de vouloir supprimer l'outil&nbsp;
            <span className="font-semibold">{deleteDialog.tool?.name} ({deleteDialog.tool?.code})</span>&nbsp;?
            Cette action ne peut pas être annulée.
          </p>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteDialog({ open: false, tool: null })}
            >
              Annuler
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => deleteDialog.tool && deleteToolMutation.mutate(deleteDialog.tool.id)}
              disabled={deleteToolMutation.isPending}
            >
              {deleteToolMutation.isPending ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
}
