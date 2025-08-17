import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useToast } from '@/hooks/use-toast';
import { useAISettings } from '@/hooks/useAISettings';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { AIProviderService } from '@/services/aiProvider';
import { GeneratedQuestion } from '@/lib/schemas';
import { 
  Sparkles, 
  Check, 
  CheckCheck, 
  RotateCcw, 
  AlertTriangle,
  Lightbulb,
  Brain,
  Zap,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Trash2,
  TestTube
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const topicOptions = [
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'system-design', label: 'System Design' },
  { value: 'database', label: 'Database & SQL' },
  { value: 'algorithms', label: 'Algorithms & Data Structures' },
  { value: 'aws', label: 'AWS' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' },
  { value: 'devops', label: 'DevOps' },
  { value: 'frontend', label: 'Frontend Development' },
  { value: 'backend', label: 'Backend Development' }
];

const difficultyLabels = {
  easy: 'Dễ',
  medium: 'Trung bình',
  hard: 'Khó'
};

const levelLabels = {
  fresher: 'Fresher',
  junior: 'Junior',
  senior: 'Senior'
};

type GeneratedQuestionWithStatus = GeneratedQuestion & {
  id: string;
  approved?: boolean;
  saving?: boolean;
  expanded?: boolean;
};

export function AIQuestionGeneratorPage() {
  const { clientSettings, isConfigured } = useAISettings();
  const { categories } = useCategories();
  const { user } = useAuth();
  const { toast } = useToast();

  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [level, setLevel] = useState<'fresher' | 'junior' | 'senior'>('junior');
  const [count, setCount] = useState([5]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [provider, setProvider] = useState<'openai' | 'gemini'>(clientSettings.provider);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestionWithStatus[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(new Set());
  const [testing, setTesting] = useState<{ provider: string; testing: boolean }>({ provider: '', testing: false });

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn chủ đề',
        variant: 'destructive'
      });
      return;
    }

    if (!isConfigured()) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng cấu hình API key trước',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await AIProviderService.generateQuestions({
        topic,
        difficulty,
        level,
        count: count[0],
        provider
      });

      setGeneratedQuestions(result.questions.map((q, index) => ({
        ...q,
        id: `generated-${Date.now()}-${index}`,
        approved: false,
        saving: false,
        expanded: false
      })));

      toast({
        title: 'Thành công',
        description: `Đã tạo ${result.questions.length} câu hỏi bằng ${result.metadata.provider === 'openai' ? 'OpenAI' : 'Gemini'}!${result.metadata.fallbackUsed ? ' (Đã sử dụng fallback)' : ''}`
      });
    } catch (error: any) {
      console.error('Error generating questions:', error);
      
      let errorMessage = 'Không thể tạo câu hỏi. Vui lòng thử lại.';
      
      if (error.name === 'AIRateLimitError') {
        errorMessage = 'Đã vượt quá giới hạn API. Vui lòng thử lại sau hoặc đổi provider.';
      } else if (error.name === 'AIParseError') {
        errorMessage = 'Không thể đọc kết quả từ AI. Vui lòng thử lại hoặc đổi provider.';
      } else if (error.name === 'AIProviderError') {
        errorMessage = `Lỗi từ ${provider === 'openai' ? 'OpenAI' : 'Gemini'}: ${error.message}`;
      }

      toast({
        title: 'Lỗi',
        description: errorMessage,
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleTestProvider = async (testProvider: 'openai' | 'gemini') => {
    setTesting({ provider: testProvider, testing: true });
    
    try {
      const result = await AIProviderService.testProvider(testProvider);
      
      if (result.success) {
        toast({
          title: 'Kết nối thành công',
          description: result.message
        });
      } else {
        toast({
          title: 'Kết nối thất bại',
          description: result.message,
          variant: 'destructive'
        });
      }
    } catch (error: any) {
      toast({
        title: 'Lỗi kết nối',
        description: error.message || 'Không thể kiểm tra kết nối',
        variant: 'destructive'
      });
    } finally {
      setTesting({ provider: '', testing: false });
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    const question = generatedQuestions.find(q => q.id === questionId);
    if (!question || !selectedCategory || !user) return;

    setGeneratedQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, saving: true } : q)
    );

    try {
      // Map category name to category ID
      const categoryMapping: Record<string, string> = {
        'Algorithm': categories.find(c => c.name === 'Algorithm')?.id || '',
        'Backend': categories.find(c => c.name === 'Backend')?.id || '',
        'Frontend': categories.find(c => c.name === 'Frontend')?.id || '',
        'Database': categories.find(c => c.name === 'Database')?.id || '',
        'System Design': categories.find(c => c.name === 'System Design')?.id || '',
        'DevOps': categories.find(c => c.name === 'DevOps')?.id || ''
      };

      const mappedCategoryId = categoryMapping[question.category] || selectedCategory;

      // Insert question
      const { data: questionData, error: questionError } = await supabase
        .from('questions')
        .insert({
          title: question.title,
          content: question.content,
          category_id: mappedCategoryId,
          difficulty: question.difficulty,
          level: question.level,
          creator_id: user.id,
          status: 'approved'
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Insert solution
      const { error: solutionError } = await supabase
        .from('solutions')
        .insert({
          content: question.solution,
          question_id: questionData.id,
          author_id: user.id
        });

      if (solutionError) throw solutionError;

      setGeneratedQuestions(prev => 
        prev.map(q => q.id === questionId ? { ...q, approved: true, saving: false } : q)
      );

      toast({
        title: 'Thành công',
        description: 'Đã lưu câu hỏi và lời giải vào hệ thống!'
      });
    } catch (error) {
      console.error('Error saving question:', error);
      setGeneratedQuestions(prev => 
        prev.map(q => q.id === questionId ? { ...q, saving: false } : q)
      );
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleApproveAll = async () => {
    const unapprovedQuestions = generatedQuestions.filter(q => !q.approved);
    
    if (unapprovedQuestions.length === 0) {
      toast({
        title: 'Thông báo',
        description: 'Tất cả câu hỏi đều đã được duyệt',
      });
      return;
    }

    if (!selectedCategory || !user) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn danh mục trước khi lưu',
        variant: 'destructive'
      });
      return;
    }

    setGeneratedQuestions(prev => 
      prev.map(q => ({ ...q, saving: !q.approved }))
    );

    try {
      // Process in batches to avoid overwhelming the database
      const batchSize = 5;
      for (let i = 0; i < unapprovedQuestions.length; i += batchSize) {
        const batch = unapprovedQuestions.slice(i, i + batchSize);
        
        await Promise.all(batch.map(async (question) => {
          // Map category name to category ID
          const categoryMapping: Record<string, string> = {
            'Algorithm': categories.find(c => c.name === 'Algorithm')?.id || '',
            'Backend': categories.find(c => c.name === 'Backend')?.id || '',
            'Frontend': categories.find(c => c.name === 'Frontend')?.id || '',
            'Database': categories.find(c => c.name === 'Database')?.id || '',
            'System Design': categories.find(c => c.name === 'System Design')?.id || '',
            'DevOps': categories.find(c => c.name === 'DevOps')?.id || ''
          };

          const mappedCategoryId = categoryMapping[question.category] || selectedCategory;

          // Insert question
          const { data: questionData, error: questionError } = await supabase
            .from('questions')
            .insert({
              title: question.title,
              content: question.content,
              category_id: mappedCategoryId,
              difficulty: question.difficulty,
              level: question.level,
              creator_id: user.id,
              status: 'approved'
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Insert solution
          const { error: solutionError } = await supabase
            .from('solutions')
            .insert({
              content: question.solution,
              question_id: questionData.id,
              author_id: user.id
            });

          if (solutionError) throw solutionError;
        }));
      }

      setGeneratedQuestions(prev => 
        prev.map(q => ({ ...q, approved: true, saving: false }))
      );

      toast({
        title: 'Thành công',
        description: `Đã lưu ${unapprovedQuestions.length} câu hỏi vào hệ thống!`
      });
    } catch (error) {
      console.error('Error saving questions:', error);
      setGeneratedQuestions(prev => 
        prev.map(q => ({ ...q, saving: false }))
      );
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    }
  };

  const handleReset = () => {
    setGeneratedQuestions([]);
    setSelectedQuestions(new Set());
    setTopic('');
    setDifficulty('medium');
    setLevel('junior');
    setCount([5]);
    setSelectedCategory('');
  };

  const handleRemoveQuestion = (questionId: string) => {
    setGeneratedQuestions(prev => prev.filter(q => q.id !== questionId));
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      newSet.delete(questionId);
      return newSet;
    });
  };

  const toggleQuestionSelection = (questionId: string) => {
    setSelectedQuestions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  };

  const toggleQuestionExpansion = (questionId: string) => {
    setGeneratedQuestions(prev =>
      prev.map(q => q.id === questionId ? { ...q, expanded: !q.expanded } : q)
    );
  };

  const selectAllQuestions = () => {
    const unapprovedIds = generatedQuestions.filter(q => !q.approved).map(q => q.id);
    setSelectedQuestions(new Set(unapprovedIds));
  };

  const clearSelection = () => {
    setSelectedQuestions(new Set());
  };

  if (!isConfigured()) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Cần cấu hình API Keys
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Để sử dụng tính năng tạo câu hỏi tự động, bạn cần cấu hình API key cho một trong các AI provider.
            </p>
            <Button asChild>
              <Link to="/settings">
                <Settings className="h-4 w-4 mr-2" />
                Cấu hình ngay
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {provider === 'openai' ? (
              <Sparkles className="h-5 w-5 text-green-500" />
            ) : (
              <Brain className="h-5 w-5 text-blue-500" />
            )}
            AI Question Generator
            <Badge variant="outline" className="ml-2">
              {provider === 'openai' ? 'OpenAI' : 'Gemini'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Chủ đề</label>
              <Select value={topic} onValueChange={setTopic}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn chủ đề..." />
                </SelectTrigger>
                <SelectContent>
                  {topicOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Danh mục lưu</label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Chọn danh mục..." />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">AI Provider</label>
              <div className="flex gap-2">
                <Select value={provider} onValueChange={(value: 'openai' | 'gemini') => setProvider(value)}>
                  <SelectTrigger className="flex-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="openai">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-green-500" />
                        OpenAI
                      </div>
                    </SelectItem>
                    <SelectItem value="gemini">
                      <div className="flex items-center gap-2">
                        <Brain className="h-4 w-4 text-blue-500" />
                        Gemini
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleTestProvider(provider)}
                  disabled={testing.testing}
                  className="px-3"
                >
                  {testing.provider === provider && testing.testing ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <TestTube className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Độ khó</label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">🟢 Dễ</SelectItem>
                  <SelectItem value="medium">🟡 Trung bình</SelectItem>
                  <SelectItem value="hard">🔴 Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Cấp độ</label>
              <Select value={level} onValueChange={(value: 'fresher' | 'junior' | 'senior') => setLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">👨‍🎓 Fresher</SelectItem>
                  <SelectItem value="junior">👨‍💻 Junior</SelectItem>
                  <SelectItem value="senior">👨‍🏫 Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Số lượng câu hỏi: {count[0]}</label>
            <Slider
              value={count}
              onValueChange={setCount}
              max={20}
              min={1}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>1</span>
              <span>20</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating || !topic}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Đang tạo...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Tạo câu hỏi
                </>
              )}
            </Button>
            
            {generatedQuestions.length > 0 && (
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Reset
              </Button>
            )}
          </div>

          {/* Provider Info */}
          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              Đang sử dụng <strong>{provider === 'openai' ? 'OpenAI GPT-4o Mini' : 'Google Gemini 1.5 Flash'}</strong>. 
              Hệ thống có fallback tự động nếu provider chính gặp lỗi. Bạn có thể thay đổi provider trong <Link to="/settings" className="text-primary hover:underline">cài đặt</Link>.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Empty State */}
      {generatedQuestions.length === 0 && !isGenerating && (
        <Card className="text-center py-12">
          <CardContent>
            <div className="flex flex-col items-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-muted/20 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-muted-foreground" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Chưa có câu hỏi nào</h3>
                <p className="text-muted-foreground max-w-md">
                  Hãy chọn chủ đề, độ khó, cấp độ và bấm "Tạo câu hỏi" để bắt đầu.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Câu hỏi đã tạo ({generatedQuestions.length})
              </CardTitle>
              <div className="flex flex-wrap gap-2">
                {selectedQuestions.size > 0 && (
                  <>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={clearSelection}
                    >
                      Bỏ chọn ({selectedQuestions.size})
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={handleApproveAll}
                      disabled={!selectedCategory}
                    >
                      <Check className="h-4 w-4 mr-2" />
                      Duyệt đã chọn
                    </Button>
                  </>
                )}
                <Button 
                  size="sm" 
                  onClick={selectAllQuestions}
                  variant="outline"
                  disabled={generatedQuestions.every(q => q.approved)}
                >
                  Chọn tất cả
                </Button>
                <Button 
                  size="sm" 
                  onClick={handleApproveAll}
                  disabled={!selectedCategory || generatedQuestions.every(q => q.approved)}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Duyệt tất cả
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
              {generatedQuestions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-primary ai-question-card">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-start gap-2 flex-1">
                        <input
                          type="checkbox"
                          checked={selectedQuestions.has(question.id)}
                          onChange={() => toggleQuestionSelection(question.id)}
                          disabled={question.approved}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                        />
                        <h3 className="font-medium text-sm leading-relaxed flex-1">
                          {question.title}
                        </h3>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {levelLabels[question.level]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    {/* Question Content */}
                    <div className="text-sm text-muted-foreground">
                      <div dangerouslySetInnerHTML={{ __html: question.content }} />
                    </div>

                    {/* Collapsible Solution */}
                    <Collapsible 
                      open={question.expanded} 
                      onOpenChange={() => toggleQuestionExpansion(question.id)}
                    >
                      <CollapsibleTrigger asChild>
                        <Button variant="ghost" size="sm" className="w-full justify-between p-2 h-auto">
                          <span className="text-sm font-medium">Lời giải</span>
                          {question.expanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </Button>
                      </CollapsibleTrigger>
                      <CollapsibleContent className="space-y-2">
                        <div className="bg-green-50/50 dark:bg-green-950/20 p-3 rounded-lg text-sm">
                          <div dangerouslySetInnerHTML={{ __html: question.solution }} />
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                    
                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-2 border-t">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveQuestion(question.id)}
                        disabled={question.saving}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                      
                      {question.approved ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                          <Check className="h-3 w-3 mr-1" />
                          Đã lưu
                        </Badge>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => handleApproveQuestion(question.id)}
                          disabled={question.saving || !selectedCategory}
                        >
                          {question.saving ? (
                            <LoadingSpinner size="sm" className="mr-2" />
                          ) : (
                            <Check className="h-4 w-4 mr-2" />
                          )}
                          {question.saving ? 'Đang lưu...' : 'Duyệt & Lưu'}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}