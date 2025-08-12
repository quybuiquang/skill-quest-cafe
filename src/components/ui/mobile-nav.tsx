import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, Home, Plus, User, Settings, LogOut } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
    setOpen(false);
  };

  if (!user) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <div className="flex flex-col h-full">
          {/* User Profile Section */}
          <div className="flex items-center space-x-3 p-4 border-b">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
              {profile?.avatar_url ? (
                <img 
                  src={profile.avatar_url} 
                  alt="Avatar" 
                  className="h-full w-full rounded-full object-cover"
                />
              ) : (
                <User className="h-5 w-5 text-primary" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">
                {profile?.display_name || user.email?.split('@')[0]}
              </p>
              <p className="text-sm text-muted-foreground truncate">
                {user.email}
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 p-4 space-y-2">
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Home className="h-5 w-5" />
              <span>Trang chủ</span>
            </Link>
            
            <Link
              to="/add-question"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <Plus className="h-5 w-5" />
              <span>Thêm câu hỏi</span>
            </Link>
            
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
            >
              <User className="h-5 w-5" />
              <span>Hồ sơ cá nhân</span>
            </Link>

            {profile?.role === 'admin' && (
              <Link
                to="/admin"
                onClick={() => setOpen(false)}
                className="flex items-center space-x-3 p-3 rounded-lg hover:bg-accent transition-colors"
              >
                <Settings className="h-5 w-5" />
                <span>Quản trị</span>
              </Link>
            )}
          </nav>

          {/* Sign Out Button */}
          <div className="p-4 border-t">
            <Button
              variant="ghost"
              onClick={handleSignOut}
              className="w-full justify-start"
            >
              <LogOut className="h-5 w-5 mr-3" />
              Đăng xuất
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}