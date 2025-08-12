import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { QuestionCard } from '@/components/QuestionCard';
import { useQuestions } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

const Questions = () => {
  const { questions, categories, loading } = useQuestions();
  const { user } = useAuth();
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  useEffect(() => {
    let filtered = questions;

    if (searchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(question => question.category_id === selectedCategory);
    }

    if (selectedDifficulty !== 'all') {
      filtered = filtered.filter(question => question.difficulty === selectedDifficulty);
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(question => question.level === selectedLevel);
    }

    setFilteredQuestions(filtered);
  }, [questions, searchTerm, selectedCategory, selectedDifficulty, selectedLevel]);

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Chào mừng đến với Interview Practice</h2>
            <p className="text-muted-foreground mb-6">
              Nền tảng luyện tập phỏng vấn với cộng đồng. Đăng nhập để bắt đầu!
            </p>
            <Button asChild>
              <a href="/auth">Đăng nhập ngay</a>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-muted-foreground">Đang tải câu hỏi...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Câu hỏi phỏng vấn</h1>
          
          {/* Search and Filters */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Tìm kiếm câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Danh mục" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Tất cả danh mục</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
              <SelectTrigger>
                <SelectValue placeholder="Độ khó" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Tất cả độ khó</SelectItem>
                <SelectItem value="easy">Dễ</SelectItem>
                <SelectItem value="medium">Trung bình</SelectItem>
                <SelectItem value="hard">Khó</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Cấp bậc" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Tất cả cấp bậc</SelectItem>
                <SelectItem value="fresher">Fresher</SelectItem>
                <SelectItem value="junior">Junior</SelectItem>
                <SelectItem value="senior">Senior</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('all');
                setSelectedDifficulty('all');
                setSelectedLevel('all');
              }}
              variant="outline"
            >
              Xóa bộ lọc
            </Button>
          </div>
        </div>

        {/* Questions Grid */}
        <div className="grid gap-6">
          {filteredQuestions.length > 0 ? (
            filteredQuestions.map((question) => (
              <QuestionCard key={question.id} question={question} />
            ))
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-lg">
                {questions.length === 0 
                  ? 'Chưa có câu hỏi nào. Hãy là người đầu tiên thêm câu hỏi!'
                  : 'Không tìm thấy câu hỏi phù hợp với bộ lọc.'
                }
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Questions;