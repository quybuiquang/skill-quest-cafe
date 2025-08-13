import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useQuestions } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, FileText } from 'lucide-react';
import { Footer } from '@/components/Footer';

const AddQuestion = () => {
  const { categories, createQuestion } = useQuestions();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('easy');
  const [level, setLevel] = useState<'fresher' | 'junior' | 'senior'>('fresher');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        title: 'Lỗi',
        description: 'Bạn cần đăng nhập để thêm câu hỏi',
        variant: 'destructive'
      });
      return;
    }

    if (!title.trim() || !content.trim() || !categoryId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng điền đầy đủ thông tin',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    
    try {
      await createQuestion({
        title: title.trim(),
        content: content.trim(),
        category_id: categoryId,
        difficulty,
        level
      });
      
      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được gửi và đang chờ duyệt'
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tạo câu hỏi',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Bạn cần đăng nhập</h2>
            <p className="text-muted-foreground mb-6">
              Để thêm câu hỏi, vui lòng đăng nhập trước.
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
        
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thêm câu hỏi mới
            </CardTitle>
            <CardDescription>
              Chia sẻ câu hỏi phỏng vấn với cộng đồng. Sử dụng rich text editor để định dạng đẹp.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="title">Tiêu đề câu hỏi *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Nhập tiêu đề câu hỏi..."
                  maxLength={200}
                  required
                />
                <p className="text-sm text-muted-foreground">
                  {title.length}/200 ký tự
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Nội dung câu hỏi *</Label>
                <RichTextEditor
                  content={content}
                  onChange={setContent}
                  placeholder="Mô tả chi tiết câu hỏi, yêu cầu, ví dụ... Hỗ trợ định dạng text, code block, danh sách..."
                  className="min-h-[200px]"
                />
                <p className="text-sm text-muted-foreground">
                  Hãy mô tả rõ ràng và chi tiết. Sử dụng code block cho code examples và định dạng phù hợp.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Danh mục *</Label>
                  <Select value={categoryId} onValueChange={setCategoryId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="difficulty">Độ khó</Label>
                  <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="easy">Dễ</SelectItem>
                      <SelectItem value="medium">Trung bình</SelectItem>
                      <SelectItem value="hard">Khó</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">Cấp bậc</Label>
                  <Select value={level} onValueChange={(value: 'fresher' | 'junior' | 'senior') => setLevel(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-popover">
                      <SelectItem value="fresher">Fresher</SelectItem>
                      <SelectItem value="junior">Junior</SelectItem>
                      <SelectItem value="senior">Senior</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex gap-4">
                <Button type="submit" disabled={loading} className="flex-1" size="lg">
                  <Save className="h-4 w-4 mr-2" />
                  {loading ? 'Đang gửi...' : 'Gửi câu hỏi'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/')}
                  disabled={loading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Hủy
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  );
};

export default AddQuestion;