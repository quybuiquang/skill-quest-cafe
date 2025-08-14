import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { useQuestions } from '@/hooks/useQuestions';
import { useAuth } from '@/hooks/useAuth';
import { useDraftSave } from '@/hooks/useDraftSave';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { OptimizedRichTextEditor } from '@/components/OptimizedRichTextEditor';
import { FormProgress } from '@/components/FormProgress';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, X, FileText, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
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
  const [showDraftPrompt, setShowDraftPrompt] = useState(false);

  // Draft saving functionality
  const {
    data: draftData,
    isSaving: isDraftSaving,
    lastSaved,
    updateDraft,
    clearDraft,
    restoreDraft
  } = useDraftSave('add-question');

  // Auto-update draft when form changes
  useEffect(() => {
    updateDraft({
      title,
      content,
      categoryId,
      difficulty,
      level
    });
  }, [title, content, categoryId, difficulty, level, updateDraft]);

  // Check for existing draft on mount
  useEffect(() => {
    const draft = restoreDraft();
    if (draft && (draft.title || draft.content)) {
      setShowDraftPrompt(true);
    }
  }, [restoreDraft]);

  const loadDraft = () => {
    if (draftData.title) setTitle(draftData.title);
    if (draftData.content) setContent(draftData.content);
    if (draftData.categoryId) setCategoryId(draftData.categoryId);
    if (draftData.difficulty) setDifficulty(draftData.difficulty as any);
    if (draftData.level) setLevel(draftData.level as any);
    setShowDraftPrompt(false);
  };

  const discardDraft = () => {
    clearDraft();
    setShowDraftPrompt(false);
  };

  // Form validation
  const isFormValid = title.trim().length >= 10 && 
                     content.trim().length >= 50 && 
                     categoryId;

  const getValidationErrors = () => {
    const errors = [];
    if (title.trim().length < 10) errors.push('Tiêu đề cần ít nhất 10 ký tự');
    if (content.trim().length < 50) errors.push('Nội dung cần ít nhất 50 ký tự');
    if (!categoryId) errors.push('Vui lòng chọn danh mục');
    return errors;
  };

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

    if (!isFormValid) {
      const errors = getValidationErrors();
      toast({
        title: 'Lỗi validation',
        description: errors.join(', '),
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
      
      // Clear draft after successful submission
      clearDraft();
      
      toast({
        title: 'Thành công',
        description: 'Câu hỏi đã được gửi và đang chờ duyệt',
        action: (
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Xem danh sách
          </Button>
        )
      });
      
      navigate('/');
    } catch (error) {
      console.error('Error creating question:', error);
      toast({
        title: 'Lỗi',
        description: 'Có lỗi xảy ra khi tạo câu hỏi. Vui lòng thử lại.',
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
        
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Draft prompt */}
          {showDraftPrompt && (
            <Alert className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
              <Lightbulb className="h-4 w-4" />
              <AlertDescription className="flex items-center justify-between">
                <span>Tìm thấy bản nháp chưa hoàn thành. Bạn có muốn tiếp tục không?</span>
                <div className="flex gap-2 ml-4">
                  <Button size="sm" variant="outline" onClick={loadDraft}>
                    Tiếp tục
                  </Button>
                  <Button size="sm" variant="ghost" onClick={discardDraft}>
                    Bỏ qua
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Form */}
            <div className="lg:col-span-2">
              <Card>
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
                        placeholder="Ví dụ: Explain closures in JavaScript"
                        maxLength={200}
                        required
                        className={title.length < 10 && title.length > 0 ? "border-red-300" : ""}
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={title.length < 10 ? "text-red-500" : "text-muted-foreground"}>
                          {title.length}/200 ký tự {title.length < 10 && "(tối thiểu 10)"}
                        </span>
                        {title.length >= 10 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs">Tốt</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="content">Nội dung câu hỏi *</Label>
                      <OptimizedRichTextEditor
                        content={content}
                        onChange={setContent}
                        placeholder="Mô tả chi tiết câu hỏi:&#10;- Bối cảnh và yêu cầu&#10;- Ví dụ code (nếu có)&#10;- Mức độ chi tiết mong muốn"
                        className="min-h-[250px]"
                      />
                      <div className="flex justify-between items-center text-sm">
                        <span className={content.length < 50 ? "text-red-500" : "text-muted-foreground"}>
                          {content.length} ký tự {content.length < 50 && "(tối thiểu 50)"}
                        </span>
                        {content.length >= 50 && (
                          <div className="flex items-center gap-1 text-green-600">
                            <CheckCircle className="h-3 w-3" />
                            <span className="text-xs">Đủ chi tiết</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="category">Danh mục *</Label>
                        <Select value={categoryId} onValueChange={setCategoryId} required>
                          <SelectTrigger className={!categoryId ? "border-red-300" : ""}>
                            <SelectValue placeholder="Chọn danh mục" />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
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
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="easy">🟢 Dễ</SelectItem>
                            <SelectItem value="medium">🟡 Trung bình</SelectItem>
                            <SelectItem value="hard">🔴 Khó</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="level">Cấp bậc</Label>
                        <Select value={level} onValueChange={(value: 'fresher' | 'junior' | 'senior') => setLevel(value)}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-popover z-50">
                            <SelectItem value="fresher">👨‍🎓 Fresher</SelectItem>
                            <SelectItem value="junior">👨‍💻 Junior</SelectItem>
                            <SelectItem value="senior">👨‍🏫 Senior</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    {/* Validation feedback */}
                    {!isFormValid && (title || content || categoryId) && (
                      <Alert variant="destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          <ul className="list-disc list-inside space-y-1">
                            {getValidationErrors().map((error, index) => (
                              <li key={index}>{error}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-4">
                      <Button 
                        type="submit" 
                        disabled={loading || !isFormValid} 
                        className="flex-1" 
                        size="lg"
                      >
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

            {/* Sidebar */}
            <div className="space-y-4">
              {/* Progress indicator */}
              <FormProgress
                title={title}
                content={content}
                categoryId={categoryId}
              />

              {/* Auto-save indicator */}
              <AutoSaveIndicator
                isEnabled={!!(title || content)}
                isSaving={isDraftSaving}
                lastSaved={lastSaved}
              />

              {/* Tips card */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">💡 Mẹo viết câu hỏi hay</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground space-y-2">
                  <ul className="space-y-1">
                    <li>• Tiêu đề rõ ràng, súc tích</li>
                    <li>• Mô tả bối cảnh cụ thể</li>
                    <li>• Đưa ví dụ code nếu có</li>
                    <li>• Sử dụng code blocks cho code</li>
                    <li>• Chọn đúng danh mục và độ khó</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default AddQuestion;