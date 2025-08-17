import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { AIQuestionGeneratorPage } from '@/components/AIQuestionGeneratorPage';
import { useAuth } from '@/hooks/useAuth';
import { ArrowLeft, Sparkles } from 'lucide-react';

const AIGenerator = () => {
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
              Để sử dụng AI Generator, vui lòng đăng nhập trước.
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
              <Sparkles className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold">AI Question Generator</h1>
            </div>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Tạo câu hỏi phỏng vấn tự động bằng AI. Chọn chủ đề, độ khó và để AI tạo ra những câu hỏi chất lượng cao cùng lời giải chi tiết.
            </p>
          </div>

          <AIQuestionGeneratorPage />
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AIGenerator;