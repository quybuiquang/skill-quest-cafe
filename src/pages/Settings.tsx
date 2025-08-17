import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AISettingsForm } from '@/components/AISettingsForm';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h2>
            <p className="text-muted-foreground mb-6">
              Để truy cập cài đặt, vui lòng đăng nhập trước.
            </p>
            <Button asChild>
              <a href="/auth">Đăng nhập</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>
        
        <div className="max-w-4xl mx-auto space-y-6">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-2">
              <SettingsIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">Cài đặt</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Cấu hình AI providers và các tùy chọn khác cho tài khoản của bạn.
            </p>
          </div>

          <AISettingsForm />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Settings;