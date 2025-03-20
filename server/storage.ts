import { 
  User, InsertUser, users,
  Caliber, InsertCaliber, calibers,
  Store, InsertStore, stores,
  Client, InsertClient, clients,
  Tool, InsertTool, tools,
  Product, InsertProduct, products,
  Consumption, InsertConsumption, consumptions,
  Alert, InsertAlert, alerts,
  Activity, InsertActivity, activities,
  DashboardStats, ConsumptionByStore, ConsumptionByCaliber
} from "@shared/schema";

// Storage interface
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Caliber operations
  getCalibers(): Promise<Caliber[]>;
  getCaliber(id: number): Promise<Caliber | undefined>;
  createCaliber(caliber: InsertCaliber): Promise<Caliber>;
  updateCaliber(id: number, caliber: Partial<InsertCaliber>): Promise<Caliber | undefined>;
  deleteCaliber(id: number): Promise<boolean>;
  
  // Store operations
  getStores(): Promise<Store[]>;
  getStore(id: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined>;
  deleteStore(id: number): Promise<boolean>;
  
  // Client operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  getClientsByStore(storeId: number): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  
  // Tool operations
  getTools(): Promise<Tool[]>;
  getTool(id: number): Promise<Tool | undefined>;
  createTool(tool: InsertTool): Promise<Tool>;
  updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined>;
  deleteTool(id: number): Promise<boolean>;
  
  // Product operations
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByStore(storeId: number): Promise<Product[]>;
  getProductsByCaliber(caliberId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Consumption operations
  getConsumptions(): Promise<Consumption[]>;
  getConsumption(id: number): Promise<Consumption | undefined>;
  getConsumptionsByClient(clientId: number): Promise<Consumption[]>;
  getConsumptionsByTool(toolId: number): Promise<Consumption[]>;
  getConsumptionsByStore(storeId: number): Promise<Consumption[]>;
  getConsumptionsByProduct(productId: number): Promise<Consumption[]>;
  getConsumptionsByDate(startDate: Date, endDate: Date): Promise<Consumption[]>;
  getDailyConsumptionByTool(toolId: number, date: Date): Promise<number>;
  createConsumption(consumption: InsertConsumption): Promise<Consumption>;
  
  // Alert operations
  getAlerts(): Promise<Alert[]>;
  getActiveAlerts(): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  resolveAlert(id: number): Promise<Alert | undefined>;
  
  // Activity operations
  getActivities(): Promise<Activity[]>;
  getRecentActivities(limit: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;
  
  // Dashboard operations
  getDashboardStats(): Promise<DashboardStats>;
  getConsumptionByStore(days: number): Promise<ConsumptionByStore[]>;
  getConsumptionByCaliber(days: number): Promise<ConsumptionByCaliber[]>;
}

// Memory Storage implementation
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private calibers: Map<number, Caliber>;
  private stores: Map<number, Store>;
  private clients: Map<number, Client>;
  private tools: Map<number, Tool>;
  private products: Map<number, Product>;
  private consumptions: Map<number, Consumption>;
  private alerts: Map<number, Alert>;
  private activities: Map<number, Activity>;
  
  private userId: number;
  private caliberId: number;
  private storeId: number;
  private clientId: number;
  private toolId: number;
  private productId: number;
  private consumptionId: number;
  private alertId: number;
  private activityId: number;
  
  constructor() {
    this.users = new Map();
    this.calibers = new Map();
    this.stores = new Map();
    this.clients = new Map();
    this.tools = new Map();
    this.products = new Map();
    this.consumptions = new Map();
    this.alerts = new Map();
    this.activities = new Map();
    
    this.userId = 1;
    this.caliberId = 1;
    this.storeId = 1;
    this.clientId = 1;
    this.toolId = 1;
    this.productId = 1;
    this.consumptionId = 1;
    this.alertId = 1;
    this.activityId = 1;
    
    // Initialize with sample data
    this.initializeSampleData();
  }
  
  private initializeSampleData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin",
      name: "Admin User",
      role: "admin"
    });
    
    // Create 3 stores
    const store1 = this.createStore({ name: "Magasin 1", location: "Paris", manager: "Manager 1" });
    const store2 = this.createStore({ name: "Magasin 2", location: "Lyon", manager: "Manager 2" });
    const store3 = this.createStore({ name: "Magasin 3", location: "Marseille", manager: "Manager 3" });
    
    // Create calibers
    const caliberA = this.createCaliber({ name: "Calibre A", description: "Small size product" });
    const caliberB = this.createCaliber({ name: "Calibre B", description: "Medium size product" });
    const caliberC = this.createCaliber({ name: "Calibre C", description: "Large size product" });
    const caliberD = this.createCaliber({ name: "Calibre D", description: "Extra large size product" });
    
    // Create tools
    const tool1 = this.createTool({ code: "XYZ-123", name: "Tool XYZ", description: "Standard tool", maxDailyConsumption: "100" });
    const tool2 = this.createTool({ code: "ABC-456", name: "Tool ABC", description: "Advanced tool", maxDailyConsumption: "150" });
    const tool3 = this.createTool({ code: "DEF-789", name: "Tool DEF", description: "Specialized tool", maxDailyConsumption: "200" });
    
    // Create clients for each store
    const clientA1 = this.createClient({ name: "Client A", email: "clienta@example.com", phone: "123-456-7890", storeId: store1.id });
    const clientB1 = this.createClient({ name: "Client B", email: "clientb@example.com", phone: "123-456-7891", storeId: store1.id });
    
    const clientC2 = this.createClient({ name: "Client C", email: "clientc@example.com", phone: "123-456-7892", storeId: store2.id });
    const clientD2 = this.createClient({ name: "Client D", email: "clientd@example.com", phone: "123-456-7893", storeId: store2.id });
    
    const clientE3 = this.createClient({ name: "Client E", email: "cliente@example.com", phone: "123-456-7894", storeId: store3.id });
    const clientF3 = this.createClient({ name: "Client F", email: "clientf@example.com", phone: "123-456-7895", storeId: store3.id });
    
    // Create products
    const productA1 = this.createProduct({ name: "Product A1", caliberId: caliberA.id, description: "Product A in store 1", unit: "kg", stock: "200", storeId: store1.id });
    const productB1 = this.createProduct({ name: "Product B1", caliberId: caliberB.id, description: "Product B in store 1", unit: "kg", stock: "300", storeId: store1.id });
    
    const productA2 = this.createProduct({ name: "Product A2", caliberId: caliberA.id, description: "Product A in store 2", unit: "kg", stock: "250", storeId: store2.id });
    const productC2 = this.createProduct({ name: "Product C2", caliberId: caliberC.id, description: "Product C in store 2", unit: "kg", stock: "180", storeId: store2.id });
    
    const productB3 = this.createProduct({ name: "Product B3", caliberId: caliberB.id, description: "Product B in store 3", unit: "kg", stock: "210", storeId: store3.id });
    const productD3 = this.createProduct({ name: "Product D3", caliberId: caliberD.id, description: "Product D in store 3", unit: "kg", stock: "170", storeId: store3.id });
    
    // Create consumptions (recent date for current data)
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    // Client A consumption
    this.createConsumption({ 
      clientId: clientA1.id, 
      productId: productA1.id, 
      toolId: tool1.id, 
      quantity: "50", 
      storeId: store1.id,
      date: today
    });
    
    // Client C consumption
    this.createConsumption({ 
      clientId: clientC2.id, 
      productId: productA2.id, 
      toolId: tool2.id, 
      quantity: "120", 
      storeId: store2.id,
      date: yesterday
    });
    
    // Create alerts
    this.createAlert({
      type: "critical",
      message: "Stock critique - Produit Calibre A - Magasin 1",
      resolved: false,
      entityType: "product",
      entityId: productA1.id
    });
    
    this.createAlert({
      type: "warning",
      message: "Limite proche - Outil DEF-789 à 92% de sa limite",
      resolved: false,
      entityType: "tool",
      entityId: tool3.id
    });
    
    this.createAlert({
      type: "info",
      message: "Maintenance prévue - Outil XYZ-123 - Demain",
      resolved: false,
      entityType: "tool",
      entityId: tool1.id
    });
    
    // Create activities
    this.createActivity({
      type: "order",
      message: "Client A a commandé 50kg de produit (Calibre B)",
      entityType: "client",
      entityId: clientA1.id
    });
    
    this.createActivity({
      type: "consumption",
      message: "Outil XYZ-123 a atteint 85% de sa limite quotidienne",
      entityType: "tool",
      entityId: tool1.id
    });
    
    this.createActivity({
      type: "alert",
      message: "Magasin 2 stock faible pour Calibre A",
      entityType: "store",
      entityId: store2.id
    });
    
    this.createActivity({
      type: "alert",
      message: "Client C a dépassé la limite de consommation pour l'outil ABC-456",
      entityType: "client",
      entityId: clientC2.id
    });
  }
  
  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const id = this.userId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }
  
  // Caliber methods
  async getCalibers(): Promise<Caliber[]> {
    return Array.from(this.calibers.values());
  }
  
  async getCaliber(id: number): Promise<Caliber | undefined> {
    return this.calibers.get(id);
  }
  
  async createCaliber(caliber: InsertCaliber): Promise<Caliber> {
    const id = this.caliberId++;
    const newCaliber: Caliber = { ...caliber, id };
    this.calibers.set(id, newCaliber);
    return newCaliber;
  }
  
  async updateCaliber(id: number, caliber: Partial<InsertCaliber>): Promise<Caliber | undefined> {
    const existingCaliber = this.calibers.get(id);
    if (!existingCaliber) return undefined;
    
    const updatedCaliber: Caliber = { ...existingCaliber, ...caliber };
    this.calibers.set(id, updatedCaliber);
    return updatedCaliber;
  }
  
  async deleteCaliber(id: number): Promise<boolean> {
    return this.calibers.delete(id);
  }
  
  // Store methods
  async getStores(): Promise<Store[]> {
    return Array.from(this.stores.values());
  }
  
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }
  
  async createStore(store: InsertStore): Promise<Store> {
    const id = this.storeId++;
    const newStore: Store = { ...store, id };
    this.stores.set(id, newStore);
    return newStore;
  }
  
  async updateStore(id: number, store: Partial<InsertStore>): Promise<Store | undefined> {
    const existingStore = this.stores.get(id);
    if (!existingStore) return undefined;
    
    const updatedStore: Store = { ...existingStore, ...store };
    this.stores.set(id, updatedStore);
    return updatedStore;
  }
  
  async deleteStore(id: number): Promise<boolean> {
    return this.stores.delete(id);
  }
  
  // Client methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }
  
  async getClientsByStore(storeId: number): Promise<Client[]> {
    return Array.from(this.clients.values()).filter(client => client.storeId === storeId);
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientId++;
    const newClient: Client = { ...client, id };
    this.clients.set(id, newClient);
    return newClient;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;
    
    const updatedClient: Client = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }
  
  // Tool methods
  async getTools(): Promise<Tool[]> {
    return Array.from(this.tools.values());
  }
  
  async getTool(id: number): Promise<Tool | undefined> {
    return this.tools.get(id);
  }
  
  async createTool(tool: InsertTool): Promise<Tool> {
    const id = this.toolId++;
    const newTool: Tool = { ...tool, id };
    this.tools.set(id, newTool);
    return newTool;
  }
  
  async updateTool(id: number, tool: Partial<InsertTool>): Promise<Tool | undefined> {
    const existingTool = this.tools.get(id);
    if (!existingTool) return undefined;
    
    const updatedTool: Tool = { ...existingTool, ...tool };
    this.tools.set(id, updatedTool);
    return updatedTool;
  }
  
  async deleteTool(id: number): Promise<boolean> {
    return this.tools.delete(id);
  }
  
  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values());
  }
  
  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }
  
  async getProductsByStore(storeId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.storeId === storeId);
  }
  
  async getProductsByCaliber(caliberId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(product => product.caliberId === caliberId);
  }
  
  async createProduct(product: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const newProduct: Product = { ...product, id };
    this.products.set(id, newProduct);
    return newProduct;
  }
  
  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = this.products.get(id);
    if (!existingProduct) return undefined;
    
    const updatedProduct: Product = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }
  
  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }
  
  // Consumption methods
  async getConsumptions(): Promise<Consumption[]> {
    return Array.from(this.consumptions.values());
  }
  
  async getConsumption(id: number): Promise<Consumption | undefined> {
    return this.consumptions.get(id);
  }
  
  async getConsumptionsByClient(clientId: number): Promise<Consumption[]> {
    return Array.from(this.consumptions.values()).filter(consumption => consumption.clientId === clientId);
  }
  
  async getConsumptionsByTool(toolId: number): Promise<Consumption[]> {
    return Array.from(this.consumptions.values()).filter(consumption => consumption.toolId === toolId);
  }
  
  async getConsumptionsByStore(storeId: number): Promise<Consumption[]> {
    return Array.from(this.consumptions.values()).filter(consumption => consumption.storeId === storeId);
  }
  
  async getConsumptionsByProduct(productId: number): Promise<Consumption[]> {
    return Array.from(this.consumptions.values()).filter(consumption => consumption.productId === productId);
  }
  
  async getConsumptionsByDate(startDate: Date, endDate: Date): Promise<Consumption[]> {
    return Array.from(this.consumptions.values()).filter(consumption => {
      const consumptionDate = new Date(consumption.date);
      return consumptionDate >= startDate && consumptionDate <= endDate;
    });
  }
  
  async getDailyConsumptionByTool(toolId: number, date: Date): Promise<number> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);
    
    const consumptions = await this.getConsumptionsByTool(toolId);
    const dailyConsumptions = consumptions.filter(consumption => {
      const consumptionDate = new Date(consumption.date);
      return consumptionDate >= startOfDay && consumptionDate <= endOfDay;
    });
    
    return dailyConsumptions.reduce((total, consumption) => {
      return total + parseFloat(consumption.quantity.toString());
    }, 0);
  }
  
  async createConsumption(consumption: InsertConsumption): Promise<Consumption> {
    const id = this.consumptionId++;
    const date = consumption.date || new Date();
    const newConsumption: Consumption = { ...consumption, date, id };
    this.consumptions.set(id, newConsumption);
    
    // Create activity for this consumption
    const client = await this.getClient(consumption.clientId);
    const product = await this.getProduct(consumption.productId);
    const tool = await this.getTool(consumption.toolId);
    
    if (client && product && tool) {
      await this.createActivity({
        type: "consumption",
        message: `${client.name} a consommé ${consumption.quantity} de produit utilisant l'outil ${tool.code}`,
        entityType: "client",
        entityId: client.id
      });
      
      // Check if tool consumption limit is near or exceeded
      const dailyConsumption = await this.getDailyConsumptionByTool(tool.id, date);
      const maxConsumption = parseFloat(tool.maxDailyConsumption.toString());
      const consumptionPercentage = (dailyConsumption / maxConsumption) * 100;
      
      if (consumptionPercentage >= 90 && consumptionPercentage < 100) {
        await this.createAlert({
          type: "warning",
          message: `Outil ${tool.code} à ${consumptionPercentage.toFixed(0)}% de sa limite journalière`,
          resolved: false,
          entityType: "tool",
          entityId: tool.id
        });
      } else if (consumptionPercentage >= 100) {
        await this.createAlert({
          type: "critical",
          message: `${client.name} a dépassé la limite de consommation pour l'outil ${tool.code}`,
          resolved: false,
          entityType: "client",
          entityId: client.id
        });
      }
      
      // Update product stock
      const newStock = parseFloat(product.stock.toString()) - parseFloat(consumption.quantity.toString());
      await this.updateProduct(product.id, { stock: newStock.toString() });
      
      // Check if stock is low
      if (newStock <= 50) {
        const caliber = await this.getCaliber(product.caliberId);
        const store = await this.getStore(product.storeId);
        
        if (caliber && store) {
          await this.createAlert({
            type: "critical",
            message: `Stock critique - Produit ${caliber.name} - ${store.name}`,
            resolved: false,
            entityType: "product",
            entityId: product.id
          });
        }
      }
    }
    
    return newConsumption;
  }
  
  // Alert methods
  async getAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values());
  }
  
  async getActiveAlerts(): Promise<Alert[]> {
    return Array.from(this.alerts.values()).filter(alert => !alert.resolved);
  }
  
  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.alertId++;
    const date = new Date();
    const newAlert: Alert = { ...alert, date, id };
    this.alerts.set(id, newAlert);
    return newAlert;
  }
  
  async resolveAlert(id: number): Promise<Alert | undefined> {
    const alert = this.alerts.get(id);
    if (!alert) return undefined;
    
    const resolvedAlert: Alert = { ...alert, resolved: true };
    this.alerts.set(id, resolvedAlert);
    return resolvedAlert;
  }
  
  // Activity methods
  async getActivities(): Promise<Activity[]> {
    return Array.from(this.activities.values()).sort((a, b) => {
      return new Date(b.date).getTime() - new Date(a.date).getTime();
    });
  }
  
  async getRecentActivities(limit: number): Promise<Activity[]> {
    const activities = await this.getActivities();
    return activities.slice(0, limit);
  }
  
  async createActivity(activity: InsertActivity): Promise<Activity> {
    const id = this.activityId++;
    const date = new Date();
    const newActivity: Activity = { ...activity, date, id };
    this.activities.set(id, newActivity);
    return newActivity;
  }
  
  // Dashboard methods
  async getDashboardStats(): Promise<DashboardStats> {
    const products = await this.getProducts();
    const clients = await this.getClients();
    const tools = await this.getTools();
    
    // Calculate daily consumption
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const todayConsumptions = await this.getConsumptionsByDate(today, tomorrow);
    const dailyConsumption = todayConsumptions.reduce((total, consumption) => {
      return total + parseFloat(consumption.quantity.toString());
    }, 0);
    
    return {
      totalProducts: products.length,
      totalClients: clients.length,
      totalTools: tools.length,
      dailyConsumption: `${dailyConsumption} kg`,
      productIncrease: "12%",
      clientIncrease: "8%",
      toolIncrease: "5%",
      consumptionDecrease: "3%"
    };
  }
  
  async getConsumptionByStore(days: number): Promise<ConsumptionByStore[]> {
    const stores = await this.getStores();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const consumptions = await this.getConsumptionsByDate(startDate, endDate);
    
    return stores.map(store => {
      const storeConsumptions = consumptions.filter(c => c.storeId === store.id);
      const totalConsumption = storeConsumptions.reduce((total, c) => {
        return total + parseFloat(c.quantity.toString());
      }, 0);
      
      return {
        storeId: store.id,
        storeName: store.name,
        consumption: totalConsumption
      };
    });
  }
  
  async getConsumptionByCaliber(days: number): Promise<ConsumptionByCaliber[]> {
    const calibers = await this.getCalibers();
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    const consumptions = await this.getConsumptionsByDate(startDate, endDate);
    const products = await this.getProducts();
    
    // Calculate total consumption
    const totalConsumption = consumptions.reduce((total, c) => {
      return total + parseFloat(c.quantity.toString());
    }, 0);
    
    // Define colors for calibers
    const colors = ["#1976D2", "#388E3C", "#F57C00", "#D32F2F"];
    
    return calibers.map((caliber, index) => {
      // Get products of this caliber
      const caliberProducts = products.filter(p => p.caliberId === caliber.id);
      const productIds = caliberProducts.map(p => p.id);
      
      // Get consumptions for these products
      const caliberConsumptions = consumptions.filter(c => productIds.includes(c.productId));
      
      // Calculate total consumption for this caliber
      const caliberConsumption = caliberConsumptions.reduce((total, c) => {
        return total + parseFloat(c.quantity.toString());
      }, 0);
      
      // Calculate percentage
      const percentage = totalConsumption > 0 ? (caliberConsumption / totalConsumption) * 100 : 0;
      
      return {
        caliberId: caliber.id,
        caliberName: caliber.name,
        consumption: caliberConsumption,
        percentage,
        color: colors[index % colors.length]
      };
    });
  }
}

export const storage = new MemStorage();
