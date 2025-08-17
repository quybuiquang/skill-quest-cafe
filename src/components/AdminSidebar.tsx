import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
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
  useSidebar 
} from '@/components/ui/sidebar';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Users, 
  Tag, 
  Sparkles, 
  Settings,
  Menu,
  X
} from 'lucide-react';

const adminMenuItems = [
  {
    title: 'Tổng quan',
    url: '/admin',
    icon: Shield
  },
  {
    title: 'Chờ duyệt',
    url: '/admin/pending',
    icon: AlertTriangle
  },
  {
    title: 'Tất cả câu hỏi',
    url: '/admin/questions',
    icon: FileText
  },
  {
    title: 'AI Generator',
    url: '/admin/ai-generator',
    icon: Sparkles
  },
  {
    title: 'Người dùng',
    url: '/admin/users',
    icon: Users
  },
  {
    title: 'Danh mục',
    url: '/admin/categories',
    icon: Tag
  },
  {
    title: 'API Key',
    url: '/admin/api-key',
    icon: Settings
  }
];

export function AdminSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => {
    if (path === '/admin') {
      return currentPath === '/admin';
    }
    return currentPath.startsWith(path);
  };

  const getNavCls = (path: string) => cn(
    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
    isActive(path) 
      ? "bg-primary text-primary-foreground" 
      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
  );

  return (
    <Sidebar className={cn(
      "border-r transition-all duration-300",
      collapsed ? "w-14" : "w-64"
    )}>
      <SidebarTrigger className="m-2 self-end md:hidden" />
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className={cn(
            "px-4 py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wide",
            collapsed && "sr-only"
          )}>
            Quản trị
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {adminMenuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink 
                      to={item.url} 
                      className={getNavCls(item.url)}
                      title={collapsed ? item.title : undefined}
                    >
                      <item.icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}