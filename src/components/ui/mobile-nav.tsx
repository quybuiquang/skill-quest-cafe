import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { 
  Shield, 
  AlertTriangle, 
  FileText, 
  Users, 
  Tag, 
  Sparkles, 
  Settings,
  Menu
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

interface MobileNavProps {
  className?: string;
}

export function MobileNav({ className }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("md:hidden", className)}>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <div className="p-4 border-b">
              <h2 className="font-semibold text-lg">Quản trị</h2>
            </div>
            <nav className="flex-1 p-4">
              <div className="space-y-2">
                {adminMenuItems.map((item) => (
                  <NavLink
                    key={item.title}
                    to={item.url}
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) => cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive 
                        ? "bg-primary text-primary-foreground" 
                        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.title}</span>
                  </NavLink>
                ))}
              </div>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}