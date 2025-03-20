import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertCaliberSchema, 
  insertStoreSchema, 
  insertClientSchema, 
  insertToolSchema, 
  insertProductSchema, 
  insertConsumptionSchema,
  insertAlertSchema
} from "@shared/schema";
import { ZodError } from "zod";
import { fromZodError } from "zod-validation-error";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const apiRouter = express.Router();
  
  // Error handler for Zod validation errors
  function handleZodError(error: unknown, res: Response) {
    if (error instanceof ZodError) {
      const validationError = fromZodError(error);
      return res.status(400).json({ error: validationError.message });
    }
    return res.status(500).json({ error: 'An unexpected error occurred' });
  }
  
  // Dashboard Routes
  apiRouter.get("/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch dashboard stats" });
    }
  });
  
  apiRouter.get("/dashboard/consumption-by-store", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await storage.getConsumptionByStore(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumption by store" });
    }
  });
  
  apiRouter.get("/dashboard/consumption-by-caliber", async (req, res) => {
    try {
      const days = parseInt(req.query.days as string) || 7;
      const data = await storage.getConsumptionByCaliber(days);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumption by caliber" });
    }
  });
  
  // Caliber Routes
  apiRouter.get("/calibers", async (req, res) => {
    try {
      const calibers = await storage.getCalibers();
      res.json(calibers);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch calibers" });
    }
  });
  
  apiRouter.get("/calibers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const caliber = await storage.getCaliber(id);
      
      if (!caliber) {
        return res.status(404).json({ error: "Caliber not found" });
      }
      
      res.json(caliber);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch caliber" });
    }
  });
  
  apiRouter.post("/calibers", async (req, res) => {
    try {
      const validatedData = insertCaliberSchema.parse(req.body);
      const newCaliber = await storage.createCaliber(validatedData);
      res.status(201).json(newCaliber);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.put("/calibers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertCaliberSchema.parse(req.body);
      const updatedCaliber = await storage.updateCaliber(id, validatedData);
      
      if (!updatedCaliber) {
        return res.status(404).json({ error: "Caliber not found" });
      }
      
      res.json(updatedCaliber);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.delete("/calibers/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCaliber(id);
      
      if (!success) {
        return res.status(404).json({ error: "Caliber not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete caliber" });
    }
  });
  
  // Store Routes
  apiRouter.get("/stores", async (req, res) => {
    try {
      const stores = await storage.getStores();
      res.json(stores);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch stores" });
    }
  });
  
  apiRouter.get("/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const store = await storage.getStore(id);
      
      if (!store) {
        return res.status(404).json({ error: "Store not found" });
      }
      
      res.json(store);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch store" });
    }
  });
  
  apiRouter.post("/stores", async (req, res) => {
    try {
      const validatedData = insertStoreSchema.parse(req.body);
      const newStore = await storage.createStore(validatedData);
      res.status(201).json(newStore);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.put("/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertStoreSchema.parse(req.body);
      const updatedStore = await storage.updateStore(id, validatedData);
      
      if (!updatedStore) {
        return res.status(404).json({ error: "Store not found" });
      }
      
      res.json(updatedStore);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.delete("/stores/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteStore(id);
      
      if (!success) {
        return res.status(404).json({ error: "Store not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete store" });
    }
  });
  
  // Client Routes
  apiRouter.get("/clients", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      
      const clients = storeId 
        ? await storage.getClientsByStore(storeId)
        : await storage.getClients();
        
      res.json(clients);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch clients" });
    }
  });
  
  apiRouter.get("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const client = await storage.getClient(id);
      
      if (!client) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch client" });
    }
  });
  
  apiRouter.post("/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const newClient = await storage.createClient(validatedData);
      res.status(201).json(newClient);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.put("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertClientSchema.parse(req.body);
      const updatedClient = await storage.updateClient(id, validatedData);
      
      if (!updatedClient) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.json(updatedClient);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.delete("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ error: "Client not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete client" });
    }
  });
  
  // Tool Routes
  apiRouter.get("/tools", async (req, res) => {
    try {
      const tools = await storage.getTools();
      res.json(tools);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tools" });
    }
  });
  
  apiRouter.get("/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const tool = await storage.getTool(id);
      
      if (!tool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      
      res.json(tool);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch tool" });
    }
  });
  
  apiRouter.post("/tools", async (req, res) => {
    try {
      const validatedData = insertToolSchema.parse(req.body);
      const newTool = await storage.createTool(validatedData);
      res.status(201).json(newTool);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.put("/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertToolSchema.parse(req.body);
      const updatedTool = await storage.updateTool(id, validatedData);
      
      if (!updatedTool) {
        return res.status(404).json({ error: "Tool not found" });
      }
      
      res.json(updatedTool);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.delete("/tools/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteTool(id);
      
      if (!success) {
        return res.status(404).json({ error: "Tool not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete tool" });
    }
  });
  
  // Product Routes
  apiRouter.get("/products", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const caliberId = req.query.caliberId ? parseInt(req.query.caliberId as string) : undefined;
      
      let products;
      if (storeId) {
        products = await storage.getProductsByStore(storeId);
      } else if (caliberId) {
        products = await storage.getProductsByCaliber(caliberId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch products" });
    }
  });
  
  apiRouter.get("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch product" });
    }
  });
  
  apiRouter.post("/products", async (req, res) => {
    try {
      const validatedData = insertProductSchema.parse(req.body);
      const newProduct = await storage.createProduct(validatedData);
      res.status(201).json(newProduct);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.put("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertProductSchema.parse(req.body);
      const updatedProduct = await storage.updateProduct(id, validatedData);
      
      if (!updatedProduct) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  apiRouter.delete("/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteProduct(id);
      
      if (!success) {
        return res.status(404).json({ error: "Product not found" });
      }
      
      res.status(204).end();
    } catch (error) {
      res.status(500).json({ error: "Failed to delete product" });
    }
  });
  
  // Consumption Routes
  apiRouter.get("/consumptions", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      const toolId = req.query.toolId ? parseInt(req.query.toolId as string) : undefined;
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const productId = req.query.productId ? parseInt(req.query.productId as string) : undefined;
      
      let consumptions;
      if (clientId) {
        consumptions = await storage.getConsumptionsByClient(clientId);
      } else if (toolId) {
        consumptions = await storage.getConsumptionsByTool(toolId);
      } else if (storeId) {
        consumptions = await storage.getConsumptionsByStore(storeId);
      } else if (productId) {
        consumptions = await storage.getConsumptionsByProduct(productId);
      } else {
        consumptions = await storage.getConsumptions();
      }
      
      res.json(consumptions);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumptions" });
    }
  });
  
  apiRouter.get("/consumptions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consumption = await storage.getConsumption(id);
      
      if (!consumption) {
        return res.status(404).json({ error: "Consumption not found" });
      }
      
      res.json(consumption);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch consumption" });
    }
  });
  
  apiRouter.post("/consumptions", async (req, res) => {
    try {
      const validatedData = insertConsumptionSchema.parse(req.body);
      
      // Check if tool is already at maximum consumption
      const tool = await storage.getTool(validatedData.toolId);
      if (tool) {
        const today = new Date();
        const dailyConsumption = await storage.getDailyConsumptionByTool(tool.id, today);
        const newConsumption = parseFloat(validatedData.quantity.toString());
        const maxConsumption = parseFloat(tool.maxDailyConsumption.toString());
        
        if (dailyConsumption + newConsumption > maxConsumption) {
          return res.status(400).json({ 
            error: `Cette consommation dépasserait la limite quotidienne de l'outil (${maxConsumption})` 
          });
        }
      }
      
      const newConsumption = await storage.createConsumption(validatedData);
      res.status(201).json(newConsumption);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Alert Routes
  apiRouter.get("/alerts", async (req, res) => {
    try {
      const active = req.query.active === 'true';
      const alerts = active 
        ? await storage.getActiveAlerts() 
        : await storage.getAlerts();
        
      res.json(alerts);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch alerts" });
    }
  });
  
  apiRouter.post("/alerts/resolve/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const alert = await storage.resolveAlert(id);
      
      if (!alert) {
        return res.status(404).json({ error: "Alert not found" });
      }
      
      res.json(alert);
    } catch (error) {
      res.status(500).json({ error: "Failed to resolve alert" });
    }
  });
  
  apiRouter.post("/alerts", async (req, res) => {
    try {
      const validatedData = insertAlertSchema.parse(req.body);
      const newAlert = await storage.createAlert(validatedData);
      res.status(201).json(newAlert);
    } catch (error) {
      handleZodError(error, res);
    }
  });
  
  // Activity Routes
  apiRouter.get("/activities", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      
      const activities = limit 
        ? await storage.getRecentActivities(limit) 
        : await storage.getActivities();
        
      res.json(activities);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch activities" });
    }
  });
  
  // Register the API routes
  app.use("/api", apiRouter);
  
  return httpServer;
}
