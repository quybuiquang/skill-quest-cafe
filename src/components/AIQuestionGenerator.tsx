import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { ExpandableContent } from '@/components/ExpandableContent';
import { useToast } from '@/hooks/use-toast';
import { useCategories } from '@/hooks/useCategories';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Sparkles, Check, CheckCheck, X, RotateCcw } from 'lucide-react';

type GeneratedQuestion = {
  id: string;
  question: string;
  solution: string;
  difficulty: 'easy' | 'medium' | 'hard';
  level: 'fresher' | 'junior' | 'senior';
  topic: string;
  approved?: boolean;
  saving?: boolean;
};

const topicOptions = [
  { value: 'frontend', label: 'Frontend Development' },
  { value: 'backend', label: 'Backend Development' },
  { value: 'devops', label: 'DevOps' },
  { value: 'database', label: 'Database' },
  { value: 'algorithms', label: 'Algorithms & Data Structures' },
  { value: 'system-design', label: 'System Design' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'react', label: 'React' },
  { value: 'nodejs', label: 'Node.js' },
  { value: 'aws', label: 'AWS' },
  { value: 'docker', label: 'Docker' },
  { value: 'kubernetes', label: 'Kubernetes' }
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

export function AIQuestionGenerator() {
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [level, setLevel] = useState<'fresher' | 'junior' | 'senior'>('junior');
  const [count, setCount] = useState([5]);
  const [generatedQuestions, setGeneratedQuestions] = useState<GeneratedQuestion[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  const { toast } = useToast();
  const { categories } = useCategories();
  const { user } = useAuth();

  const handleGenerate = async () => {
    if (!topic) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn chủ đề',
        variant: 'destructive'
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-questions', {
        body: {
          topic,
          difficulty,
          level,
          count: count[0]
        }
      });

      if (error) throw error;

      if (data.success && data.questions) {
        setGeneratedQuestions(data.questions.map((q: any) => ({
          ...q,
          approved: false,
          saving: false
        })));
        toast({
          title: 'Thành công',
          description: `Đã tạo ${data.questions.length} câu hỏi!`
        });
      } else {
        throw new Error(data.error || 'Có lỗi xảy ra khi tạo câu hỏi');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo câu hỏi. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleApproveQuestion = async (questionId: string) => {
    const question = generatedQuestions.find(q => q.id === questionId);
    if (!question || !selectedCategory || !user) return;

    setGeneratedQuestions(prev => 
      prev.map(q => q.id === questionId ? { ...q, saving: true } : q)
    );

    try {
      const { error } = await supabase
        .from('questions')
        .insert({
          title: question.question.substring(0, 200),
          content: question.solution,
          category_id: selectedCategory,
          difficulty: question.difficulty,
          level: question.level,
          creator_id: user.id,
          status: 'approved'
        });

      if (error) throw error;

      setGeneratedQuestions(prev => 
        prev.map(q => q.id === questionId ? { ...q, approved: true, saving: false } : q)
      );

      toast({
        title: 'Thành công',
        description: 'Đã lưu câu hỏi vào hệ thống!'
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
    if (!selectedCategory || !user) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn danh mục trước khi lưu',
        variant: 'destructive'
      });
      return;
    }

    const unapprovedQuestions = generatedQuestions.filter(q => !q.approved);
    
    setGeneratedQuestions(prev => 
      prev.map(q => ({ ...q, saving: !q.approved }))
    );

    try {
      const questionsToInsert = unapprovedQuestions.map(question => ({
        title: question.question.substring(0, 200),
        content: question.solution,
        category_id: selectedCategory,
        difficulty: question.difficulty,
        level: question.level,
        creator_id: user.id,
        status: 'approved' as const
      }));

      const { error } = await supabase
        .from('questions')
        .insert(questionsToInsert);

      if (error) throw error;

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
    setTopic('');
    setDifficulty('medium');
    setLevel('junior');
    setCount([5]);
    setSelectedCategory('');
  };

  return (
    <div className="space-y-6">
      {/* Generator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Question Generator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Chủ đề</Label>
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
              <Label htmlFor="category">Danh mục lưu</Label>
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
              <Label htmlFor="difficulty">Độ khó</Label>
              <Select value={difficulty} onValueChange={(value: 'easy' | 'medium' | 'hard') => setDifficulty(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Dễ</SelectItem>
                  <SelectItem value="medium">Trung bình</SelectItem>
                  <SelectItem value="hard">Khó</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Cấp độ</Label>
              <Select value={level} onValueChange={(value: 'fresher' | 'junior' | 'senior') => setLevel(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fresher">Fresher</SelectItem>
                  <SelectItem value="junior">Junior</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="count">Số lượng câu hỏi: {count[0]}</Label>
            <Slider
              value={count}
              onValueChange={setCount}
              max={10}
              min={1}
              step={1}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <Button 
              onClick={handleGenerate} 
              disabled={isGenerating}
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
        </CardContent>
      </Card>

      {/* Generated Questions Preview */}
      {generatedQuestions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Câu hỏi đã tạo ({generatedQuestions.length})</CardTitle>
              <div className="flex gap-2">
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
            <div className="space-y-4">
              {generatedQuestions.map((question) => (
                <Card key={question.id} className="border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-medium text-sm leading-relaxed">
                        {question.question}
                      </h3>
                      <div className="flex gap-2 flex-shrink-0">
                        <Badge variant="outline" className="text-xs">
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {levelLabels[question.level]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-3">
                      <ExpandableContent content={question.solution} maxLength={200} />
                      
                      <div className="flex justify-end">
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