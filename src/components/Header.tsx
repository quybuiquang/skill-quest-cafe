import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, User, Plus, Settings } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function Header() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

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
        <Link to="/" className="flex items-center space-x-2">
          <h1 className="text-xl font-bold">Interview Practice</h1>
        </Link>

        <nav className="flex items-center space-x-4">
          {user ? (
            <>
              <Button asChild variant="outline">
                <Link to="/add-question">
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm câu hỏi
                </Link>
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    Tài khoản
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-popover">
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
            <Button asChild>
              <Link to="/auth">Đăng nhập</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}