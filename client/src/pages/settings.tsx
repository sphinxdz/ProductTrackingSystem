import { useState } from "react";
import { Layout } from "@/components/layout/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { 
  User, 
  Shield, 
  Bell, 
  Database, 
  HardDrive, 
  RefreshCw, 
  Download, 
  Upload,
  Save
} from "lucide-react";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("account");
  const { toast } = useToast();
  
  // Account settings
  const [accountForm, setAccountForm] = useState({
    name: "Admin User",
    email: "admin@example.com",
    role: "admin"
  });
  
  // Notifications settings
  const [notificationsSettings, setNotificationsSettings] = useState({
    emailAlerts: true,
    systemNotifications: true,
    consumptionAlerts: true,
    stockAlerts: true,
    dailyReports: false,
    weeklyReports: true,
    monthlyReports: true
  });
  
  // System settings
  const [systemSettings, setSystemSettings] = useState({
    language: "fr",
    theme: "light",
    timezone: "Europe/Paris",
    dateFormat: "dd/MM/yyyy",
    autoBackup: true,
    autoBackupFrequency: "daily"
  });
  
  // Handle account form changes
  const handleAccountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAccountForm({
      ...accountForm,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle notification toggle changes
  const handleNotificationToggle = (key: keyof typeof notificationsSettings) => {
    setNotificationsSettings({
      ...notificationsSettings,
      [key]: !notificationsSettings[key]
    });
  };
  
  // Save account settings
  const saveAccountSettings = () => {
    toast({
      title: "Paramètres sauvegardés",
      description: "Vos paramètres de compte ont été mis à jour",
      variant: "default",
    });
  };
  
  // Save notification settings
  const saveNotificationSettings = () => {
    toast({
      title: "Préférences de notification mises à jour",
      description: "Vos préférences de notification ont été sauvegardées",
      variant: "default",
    });
  };
  
  // Save system settings
  const saveSystemSettings = () => {
    toast({
      title: "Paramètres système mis à jour",
      description: "Les paramètres système ont été sauvegardés",
      variant: "default",
    });
  };
  
  // Reset system settings
  const resetSystemSettings = () => {
    setSystemSettings({
      language: "fr",
      theme: "light",
      timezone: "Europe/Paris",
      dateFormat: "dd/MM/yyyy",
      autoBackup: true,
      autoBackupFrequency: "daily"
    });
    
    toast({
      title: "Paramètres réinitialisés",
      description: "Les paramètres système ont été réinitialisés par défaut",
      variant: "default",
    });
  };
  
  // Export data
  const exportData = () => {
    toast({
      title: "Export des données",
      description: "L'export des données a été lancé. Vous serez notifié lorsqu'il sera terminé.",
      variant: "default",
    });
  };
  
  // Import data
  const importData = () => {
    toast({
      title: "Import des données",
      description: "Fonctionnalité non disponible dans cette version",
      variant: "destructive",
    });
  };
  
  return (
    <Layout title="Système de Gestion de Produits">
      <div className="mb-6">
        <h2 className="text-2xl font-medium text-neutral-500">Paramètres</h2>
        <p className="text-neutral-400">Configurer l'application selon vos besoins</p>
      </div>
      
      <Tabs defaultValue="account" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" /> Compte
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" /> Notifications
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" /> Système
          </TabsTrigger>
          <TabsTrigger value="data" className="flex items-center gap-2">
            <Database className="h-4 w-4" /> Données
          </TabsTrigger>
        </TabsList>
        
        {/* Account Settings Tab */}
        <TabsContent value="account">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres du compte</CardTitle>
              <CardDescription>Gérer vos informations personnelles et vos préférences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  name="name"
                  value={accountForm.name}
                  onChange={handleAccountChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={accountForm.email}
                  onChange={handleAccountChange}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Rôle</Label>
                <Select
                  value={accountForm.role}
                  onValueChange={(value) => setAccountForm({...accountForm, role: value})}
                  disabled
                >
                  <SelectTrigger id="role">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="manager">Gestionnaire</SelectItem>
                    <SelectItem value="user">Utilisateur</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">Le rôle ne peut être modifié que par un administrateur</p>
              </div>
              
              <div className="pt-4 border-t">
                <h3 className="text-lg font-medium mb-4">Sécurité</h3>
                <Button variant="outline" className="w-full mb-2">
                  Changer le mot de passe
                </Button>
                <Button variant="outline" className="w-full">
                  Activer l'authentification à deux facteurs
                </Button>
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline">Annuler</Button>
              <Button onClick={saveAccountSettings}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les modifications
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Notifications Settings Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Préférences de notification</CardTitle>
              <CardDescription>Gérer comment et quand vous recevez des notifications</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Canaux de notification</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="emailAlerts" className="font-medium">Alertes par email</Label>
                    <p className="text-sm text-muted-foreground">Recevoir des alertes importantes par email</p>
                  </div>
                  <Switch
                    id="emailAlerts"
                    checked={notificationsSettings.emailAlerts}
                    onCheckedChange={() => handleNotificationToggle('emailAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="systemNotifications" className="font-medium">Notifications système</Label>
                    <p className="text-sm text-muted-foreground">Afficher les notifications dans l'application</p>
                  </div>
                  <Switch
                    id="systemNotifications"
                    checked={notificationsSettings.systemNotifications}
                    onCheckedChange={() => handleNotificationToggle('systemNotifications')}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">Types d'alertes</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="consumptionAlerts" className="font-medium">Alertes de consommation</Label>
                    <p className="text-sm text-muted-foreground">Lorsqu'un outil approche de sa limite quotidienne</p>
                  </div>
                  <Switch
                    id="consumptionAlerts"
                    checked={notificationsSettings.consumptionAlerts}
                    onCheckedChange={() => handleNotificationToggle('consumptionAlerts')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="stockAlerts" className="font-medium">Alertes de stock</Label>
                    <p className="text-sm text-muted-foreground">Lorsque le stock d'un produit est bas</p>
                  </div>
                  <Switch
                    id="stockAlerts"
                    checked={notificationsSettings.stockAlerts}
                    onCheckedChange={() => handleNotificationToggle('stockAlerts')}
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">Rapports périodiques</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="dailyReports" className="font-medium">Rapports quotidiens</Label>
                    <p className="text-sm text-muted-foreground">Recevoir un résumé quotidien des activités</p>
                  </div>
                  <Switch
                    id="dailyReports"
                    checked={notificationsSettings.dailyReports}
                    onCheckedChange={() => handleNotificationToggle('dailyReports')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="weeklyReports" className="font-medium">Rapports hebdomadaires</Label>
                    <p className="text-sm text-muted-foreground">Recevoir un résumé hebdomadaire des activités</p>
                  </div>
                  <Switch
                    id="weeklyReports"
                    checked={notificationsSettings.weeklyReports}
                    onCheckedChange={() => handleNotificationToggle('weeklyReports')}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="monthlyReports" className="font-medium">Rapports mensuels</Label>
                    <p className="text-sm text-muted-foreground">Recevoir un résumé mensuel des activités</p>
                  </div>
                  <Switch
                    id="monthlyReports"
                    checked={notificationsSettings.monthlyReports}
                    onCheckedChange={() => handleNotificationToggle('monthlyReports')}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={saveNotificationSettings} className="ml-auto">
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les préférences
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* System Settings Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres système</CardTitle>
              <CardDescription>Configurer les paramètres généraux du système</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Langue</Label>
                  <Select
                    value={systemSettings.language}
                    onValueChange={(value) => setSystemSettings({...systemSettings, language: value})}
                  >
                    <SelectTrigger id="language">
                      <SelectValue placeholder="Sélectionner une langue" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="theme">Thème</Label>
                  <Select
                    value={systemSettings.theme}
                    onValueChange={(value) => setSystemSettings({...systemSettings, theme: value})}
                  >
                    <SelectTrigger id="theme">
                      <SelectValue placeholder="Sélectionner un thème" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="light">Clair</SelectItem>
                      <SelectItem value="dark">Sombre</SelectItem>
                      <SelectItem value="system">Système</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Fuseau horaire</Label>
                  <Select
                    value={systemSettings.timezone}
                    onValueChange={(value) => setSystemSettings({...systemSettings, timezone: value})}
                  >
                    <SelectTrigger id="timezone">
                      <SelectValue placeholder="Sélectionner un fuseau horaire" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Europe/Paris">Europe/Paris</SelectItem>
                      <SelectItem value="Europe/London">Europe/London</SelectItem>
                      <SelectItem value="America/New_York">America/New_York</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">Format de date</Label>
                  <Select
                    value={systemSettings.dateFormat}
                    onValueChange={(value) => setSystemSettings({...systemSettings, dateFormat: value})}
                  >
                    <SelectTrigger id="dateFormat">
                      <SelectValue placeholder="Sélectionner un format de date" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">Sauvegarde automatique</h3>
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="autoBackup" className="font-medium">Activer la sauvegarde automatique</Label>
                    <p className="text-sm text-muted-foreground">Sauvegarder automatiquement les données</p>
                  </div>
                  <Switch
                    id="autoBackup"
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => setSystemSettings({...systemSettings, autoBackup: checked})}
                  />
                </div>
                
                {systemSettings.autoBackup && (
                  <div className="space-y-2">
                    <Label htmlFor="backupFrequency">Fréquence de sauvegarde</Label>
                    <Select
                      value={systemSettings.autoBackupFrequency}
                      onValueChange={(value) => setSystemSettings({...systemSettings, autoBackupFrequency: value})}
                    >
                      <SelectTrigger id="backupFrequency">
                        <SelectValue placeholder="Sélectionner une fréquence" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Quotidienne</SelectItem>
                        <SelectItem value="weekly">Hebdomadaire</SelectItem>
                        <SelectItem value="monthly">Mensuelle</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="justify-between">
              <Button variant="outline" onClick={resetSystemSettings}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Réinitialiser
              </Button>
              <Button onClick={saveSystemSettings}>
                <Save className="mr-2 h-4 w-4" />
                Enregistrer les paramètres
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* Data Management Tab */}
        <TabsContent value="data">
          <Card>
            <CardHeader>
              <CardTitle>Gestion des données</CardTitle>
              <CardDescription>Sauvegarder, importer et exporter les données</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Sauvegarde</h3>
                <p className="text-sm text-muted-foreground">
                  Créez une sauvegarde de toutes les données de l'application pour éviter toute perte de données.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button className="flex-1" onClick={() => {
                    toast({
                      title: "Sauvegarde lancée",
                      description: "La sauvegarde est en cours...",
                      variant: "default",
                    });
                  }}>
                    <HardDrive className="mr-2 h-4 w-4" />
                    Créer une sauvegarde
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => {
                    toast({
                      title: "Restauration",
                      description: "Fonctionnalité non disponible dans cette version",
                      variant: "destructive",
                    });
                  }}>
                    Restaurer une sauvegarde
                  </Button>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium">Import/Export</h3>
                <p className="text-sm text-muted-foreground">
                  Exportez vos données pour les utiliser dans d'autres systèmes ou importez des données existantes.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Exporter les données</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-xs text-muted-foreground">
                        Exporter toutes les données au format CSV ou JSON pour les utiliser dans d'autres applications.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" onClick={exportData}>
                        <Download className="mr-2 h-4 w-4" />
                        Exporter
                      </Button>
                    </CardFooter>
                  </Card>
                  
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base">Importer des données</CardTitle>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-xs text-muted-foreground">
                        Importer des données externes au format CSV ou JSON pour les intégrer dans l'application.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Button variant="outline" className="w-full" onClick={importData}>
                        <Upload className="mr-2 h-4 w-4" />
                        Importer
                      </Button>
                    </CardFooter>
                  </Card>
                </div>
              </div>
              
              <div className="pt-4 border-t space-y-4">
                <h3 className="text-lg font-medium text-destructive">Zone de danger</h3>
                <p className="text-sm text-muted-foreground">
                  Ces actions sont irréversibles et peuvent entraîner une perte de données.
                </p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button variant="outline" className="flex-1" onClick={() => {
                    toast({
                      title: "Suppression des données de test",
                      description: "Fonctionnalité non disponible dans cette version",
                      variant: "destructive",
                    });
                  }}>
                    Supprimer les données de test
                  </Button>
                  <Button variant="destructive" className="flex-1" onClick={() => {
                    toast({
                      title: "Réinitialisation complète",
                      description: "Fonctionnalité non disponible dans cette version",
                      variant: "destructive",
                    });
                  }}>
                    Réinitialiser toutes les données
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </Layout>
  );
}
