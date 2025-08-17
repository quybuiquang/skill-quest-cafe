import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Plus, Settings, BookOpen, Home, Camera } from 'lucide-react';
import { Sparkles } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useProfile } from '@/hooks/useProfile';
import { MobileNav } from './ui/mobile-nav';
import { ThemeToggle } from './ui/theme-toggle';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const { profile } = useProfile();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user.id)
        .single();
      
      if (error) throw error;
      setIsAdmin(data?.role === 'admin');
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    checkAdminStatus();
  }, [user]);

  return (
    <header className="border-b bg-background">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center space-x-3">
          {/* Brand Avatar/Logo */}
          <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-2 ring-primary/10">
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt="Brand" 
                className="h-full w-full rounded-full object-cover"
              />
            ) : (
              <Camera className="h-4 w-4 text-primary" />
            )}
          </div>
          <h1 className="text-xl font-bold">Interview Practice</h1>
        </Link>

        <nav className="hidden md:flex items-center space-x-4">
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Trang chủ
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/add-question">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm câu hỏi
                </Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/ai-generator">
                  <Sparkles className="h-4 w-4 mr-2" />
                  AI Generator
                </Link>
              </Button>
              
              <ThemeToggle />
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-2">
                    {/* User Avatar */}
                    <div className="h-6 w-6 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                      {profile?.avatar_url ? (
                        <img 
                          src={profile.avatar_url} 
                          alt="Avatar" 
                          className="h-full w-full rounded-full object-cover"
                        />
                      ) : (
                        <User className="h-3 w-3 text-primary" />
                      )}
                    </div>
                    <span className="hidden sm:inline">{profile?.display_name || user.email?.split('@')[0]}</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Hồ sơ cá nhân
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Cài đặt
                  </DropdownMenuItem>
                  {isAdmin && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Settings className="h-4 w-4 mr-2" />
                      Quản trị
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Đăng xuất
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <>
              <ThemeToggle />
            <Button asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
            </>
          )}
        </nav>
        
        {/* Mobile Navigation */}
        <div className="flex items-center space-x-2 md:hidden">
          <ThemeToggle />
          <MobileNav isAdmin={isAdmin} />
        </div>
      </div>
    </header>
  );
}