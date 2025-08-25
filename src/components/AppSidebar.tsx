import { useState } from "react"
import { NavLink, useLocation } from "react-router-dom"
import {
  Building2,
  CreditCard,
<<<<<<< HEAD
  Database,
=======
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
  DollarSign,
  FileText,
  GitMerge,
  Home,
  Import,
  Receipt,
  Settings,
  TrendingUp,
  TrendingDown,
  Users,
  Tag,
  Moon,
  Sun
} from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: Home,
    group: "principal"
  },
  {
    title: "Receitas",
    url: "/recebimentos",
    icon: TrendingUp,
    group: "financeiro"
  },
  {
    title: "Despesas",
    url: "/despesas",
    icon: TrendingDown,
    group: "financeiro"
  },
  {
    title: "Conciliação",
    url: "/conciliacao",
    icon: GitMerge,
    group: "financeiro"
  },
  {
    title: "Empresas",
    url: "/empresas",
    icon: Building2,
    group: "gestao"
  },
  {
    title: "Fornecedores",
    url: "/fornecedores",
    icon: Users,
    group: "gestao"
  },
  {
    title: "Categorias",
    url: "/categorias",
    icon: Tag,
    group: "gestao"
  },
  {
    title: "Contas Bancárias",
    url: "/contas-bancarias",
    icon: CreditCard,
    group: "gestao"
  },
  {
    title: "Importar Excel",
    url: "/importacao/excel",
    icon: FileText,
    group: "importacao"
  },
  {
    title: "Importar OFX",
    url: "/importacao/ofx",
    icon: Import,
    group: "importacao"
<<<<<<< HEAD
  },
  {
    title: "Configuração BD",
    url: "/configuracao-banco",
    icon: Database,
    group: "configuracao"
=======
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
  }
]

const groups = {
  principal: "Principal",
  financeiro: "Financeiro",
  gestao: "Gestão",
<<<<<<< HEAD
  importacao: "Importação",
  configuracao: "Configuração"
=======
  importacao: "Importação"
>>>>>>> 004cbcd9fddec795ff35fa159e01016265fc7d92
}

export function AppSidebar() {
  const { state } = useSidebar()
  const collapsed = state === "collapsed"
  const location = useLocation()
  const currentPath = location.pathname
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' || document.documentElement.classList.contains('dark')
    }
    return true
  })

  const isActive = (path: string) => {
    if (path === "/") {
      return currentPath === "/" || currentPath === "/dashboard"
    }
    return currentPath === path
  }
  
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-sidebar-accent text-sidebar-primary font-medium" : "hover:bg-sidebar-accent/50"

  const groupedItems = Object.entries(groups).map(([key, label]) => ({
    key,
    label,
    items: menuItems.filter(item => item.group === key)
  }))

  const toggleTheme = () => {
    const newTheme = !isDark
    setIsDark(newTheme)
    localStorage.setItem('theme', newTheme ? 'dark' : 'light')
    
    if (newTheme) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }

  return (
    <Sidebar
      className={collapsed ? "w-14" : "w-64"}
      collapsible="icon"
    >
      <SidebarContent>
        <div className="p-4">
          <div className="flex items-center gap-2">
            <CreditCard className="h-8 w-8 text-sidebar-primary" />
            {!collapsed && (
              <div>
                <h1 className="text-lg font-bold text-sidebar-primary">FinanceFlow</h1>
                <p className="text-xs text-sidebar-foreground/70">Sistema Financeiro</p>
              </div>
            )}
          </div>
        </div>

        {groupedItems.map(({ key, label, items }) => (
          <SidebarGroup key={key}>
            {!collapsed && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
            <SidebarGroupContent>
              <SidebarMenu>
                {items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} end className={getNavCls}>
                        <item.icon className="h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <div className="p-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {isDark ? (
              <>
                <Sun className="h-4 w-4 mr-2" />
                {!collapsed && "Modo Claro"}
              </>
            ) : (
              <>
                <Moon className="h-4 w-4 mr-2" />
                {!collapsed && "Modo Escuro"}
              </>
            )}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}