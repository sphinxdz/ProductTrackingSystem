import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  Package, 
  Store, 
  Users, 
  Wrench, 
  BarChart,
  FileBarChart,
  Settings,
  Search,
  X 
} from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
}

export function Sidebar({ isOpen }: SidebarProps) {
  const [location] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  
  const clearSearch = () => {
    setSearchQuery("");
  };
  
  const navItems = [
    { path: "/", icon: <LayoutDashboard className="h-5 w-5 mr-3" />, label: "Tableau de bord" },
    { path: "/products", icon: <Package className="h-5 w-5 mr-3" />, label: "Produits" },
    { path: "/stores", icon: <Store className="h-5 w-5 mr-3" />, label: "Magasins" },
    { path: "/clients", icon: <Users className="h-5 w-5 mr-3" />, label: "Clients" },
    { path: "/tools", icon: <Wrench className="h-5 w-5 mr-3" />, label: "Outils" },
    { path: "/consumption", icon: <BarChart className="h-5 w-5 mr-3" />, label: "Consommation" },
    { path: "/reports", icon: <FileBarChart className="h-5 w-5 mr-3" />, label: "Rapports" },
    { path: "/settings", icon: <Settings className="h-5 w-5 mr-3" />, label: "Paramètres" },
  ];
  
  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };
  
  const filteredNavItems = searchQuery 
    ? navItems.filter(item => 
        item.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : navItems;
  
  return (
    <aside className={`z-30 w-64 bg-white shadow-md h-full flex-shrink-0 transition-all duration-300 
      ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
    >
      <nav className="py-4 h-full flex flex-col">
        <div className="px-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-300" />
            <Input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-10 py-2 rounded bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2"
                onClick={clearSearch}
              >
                <X className="h-4 w-4 text-neutral-400" />
              </Button>
            )}
          </div>
        </div>
        <ul className="space-y-1 flex-1">
          {filteredNavItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}
                  className={`flex items-center px-4 py-3 text-neutral-400 hover:bg-neutral-100 
                    ${isActive(item.path) 
                      ? 'border-l-4 border-primary bg-blue-50 text-primary font-medium' 
                      : 'border-l-4 border-transparent'}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="p-4 text-xs text-neutral-400">
          <p>&copy; 2023 Gestion de Produits</p>
          <p>v1.0.0</p>
        </div>
      </nav>
    </aside>
  );
}
