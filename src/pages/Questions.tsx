import { useState, useEffect, useMemo } from 'react';
import { Header } from '@/components/Header';
import { QuestionCard } from '@/components/QuestionCard';
import { useQuestions } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Search, Filter, X, BookOpen, Users, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useDebounce } from '@/hooks/useDebounce';
import { Footer } from '@/components/Footer';
import { Pagination } from '@/components/Pagination';

const Questions = () => {
  const { questions, categories, loading } = useQuestions();
  const { user } = useAuth();
  const [filteredQuestions, setFilteredQuestions] = useState(questions);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearchTerm = useDebounce(searchTerm, 300);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  useEffect(() => {
    let filtered = questions;

    if (debouncedSearchTerm) {
      filtered = filtered.filter(question =>
        question.title.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        question.content.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
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
    setCurrentPage(1); // Reset to first page when filters change
  }, [questions, debouncedSearchTerm, selectedCategory, selectedDifficulty, selectedLevel]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredQuestions.length / itemsPerPage);
  const paginatedQuestions = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredQuestions.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredQuestions, currentPage, itemsPerPage]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
          <div className="container mx-auto px-4 py-16">
            <div className="text-center max-w-4xl mx-auto space-y-8">
              <div className="mb-8">
                <BookOpen className="h-16 w-16 text-primary mx-auto mb-4" />
                <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                  Interview Practice Café
                </h1>
                <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                  Nền tảng luyện tập phỏng vấn hàng đầu với cộng đồng developer Việt Nam
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <BookOpen className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Ngân hàng câu hỏi</h3>
                    <p className="text-sm text-muted-foreground">
                      Hàng nghìn câu hỏi phỏng vấn từ cơ bản đến nâng cao
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <Users className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Cộng đồng</h3>
                    <p className="text-sm text-muted-foreground">
                      Chia sẻ kinh nghiệm và học hỏi từ các developer khác
                    </p>
                  </CardContent>
                </Card>
                <Card className="text-center">
                  <CardContent className="pt-6">
                    <TrendingUp className="h-8 w-8 text-primary mx-auto mb-3" />
                    <h3 className="font-semibold mb-2">Phát triển kỹ năng</h3>
                    <p className="text-sm text-muted-foreground">
                      Nâng cao khả năng phỏng vấn và tìm việc hiệu quả
                    </p>
                  </CardContent>
                </Card>
              </div>
              
              <Button asChild size="lg" className="text-base sm:text-lg px-6 sm:px-8 py-4 sm:py-6">
                <a href="/auth">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Bắt đầu ngay
                </a>
              </Button>
            </div>
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
        <div className="mb-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold mb-2">Câu hỏi phỏng vấn</h1>
              <p className="text-muted-foreground">
                Khám phá {questions.length} câu hỏi từ cộng đồng developer
              </p>
            </div>
            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Badge variant="outline" className="text-sm">
                {filteredQuestions.length} kết quả
              </Badge>
              {totalPages > 1 && (
                <Badge variant="secondary" className="text-sm">
                  Trang {currentPage}/{totalPages}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Search and Filters */}
          <Card className="p-3 sm:p-4">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium text-sm">Bộ lọc tìm kiếm</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 sm:gap-4">
              <div className="relative sm:col-span-2 lg:col-span-2">
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
                  setCurrentPage(1);
                }}
                variant="outline"
                size="sm" 
                className="sm:col-span-2 lg:col-span-1"
              >
                <X className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">Xóa bộ lọc</span>
                <span className="sm:hidden">Xóa</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Questions Grid */}
        <div className="space-y-3 sm:space-y-4">
          {paginatedQuestions.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
                {paginatedQuestions.map((question) => (
                  <QuestionCard key={question.id} question={question} />
                ))}
              </div>
              
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={handlePageChange}
                    totalItems={filteredQuestions.length}
                    itemsPerPage={itemsPerPage}
                    className="justify-center"
                  />
                </div>
              )}
            </>
          ) : (
            <Card className="text-center py-8 sm:py-12">
              <CardContent>
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {questions.length === 0 
                    ? 'Chưa có câu hỏi nào'
                    : 'Không tìm thấy kết quả'
                  }
                </h3>
                <p className="text-muted-foreground mb-4">
                  {questions.length === 0 
                    ? 'Hãy là người đầu tiên thêm câu hỏi cho cộng đồng!'
                    : 'Thử điều chỉnh bộ lọc hoặc từ khóa tìm kiếm.'
                  }
                </p>
                {questions.length === 0 && (
                  <Button asChild>
                    <a href="/add-question">Thêm câu hỏi đầu tiên</a>
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Questions;