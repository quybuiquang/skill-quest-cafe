import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/useAuth';
import { useQuestionDetail } from '@/hooks/useQuestionDetail';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heart, MessageCircle, ArrowLeft, Plus } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const QuestionDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const {
    question,
    solutions,
    comments,
    loading,
    fetchQuestionDetail,
    addSolution,
    addComment,
    toggleLike,
    hasLiked
  } = useQuestionDetail(id);

  const [newSolution, setNewSolution] = useState('');
  const [newComment, setNewComment] = useState('');
  const [commentTarget, setCommentTarget] = useState<{ type: 'question' | 'solution', id: string } | null>(null);
  const [showSolutionForm, setShowSolutionForm] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    hard: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  };

  const levelColors = {
    fresher: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    junior: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    senior: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  };

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

  const handleAddSolution = async () => {
    if (!newSolution.trim()) return;

    try {
      await addSolution(newSolution);
      setNewSolution('');
      setShowSolutionForm(false);
      toast({
        title: "Thành công",
        description: "Đã thêm lời giải mới!"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm lời giải. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !commentTarget) return;

    try {
      await addComment(newComment, commentTarget.type, commentTarget.id);
      setNewComment('');
      setCommentTarget(null);
      toast({
        title: "Thành công",
        description: "Đã thêm bình luận!"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể thêm bình luận. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleLike = async (type: 'question' | 'solution', targetId: string) => {
    try {
      await toggleLike(type, targetId);
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể like. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <Button onClick={() => navigate('/auth')}>Đăng nhập</Button>
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

  if (!question) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Không tìm thấy câu hỏi</h2>
            <Button onClick={() => navigate('/')}>Quay lại</Button>
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
          Quay lại danh sách
        </Button>

        {/* Question */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex justify-between items-start gap-4">
              <CardTitle className="text-2xl">{question.title}</CardTitle>
              <div className="flex gap-2 flex-wrap">
                <Badge className={difficultyColors[question.difficulty]}>
                  {difficultyLabels[question.difficulty]}
                </Badge>
                <Badge className={levelColors[question.level]}>
                  {levelLabels[question.level]}
                </Badge>
                <Badge variant="outline">
                  {question.categories.name}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{question.content}</p>
              </div>
              
              <div className="flex items-center justify-between border-t pt-4">
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>Bởi: {question.profiles.display_name}</span>
                  <span>
                    {formatDistanceToNow(new Date(question.created_at), { 
                      addSuffix: true, 
                      locale: vi 
                    })}
                  </span>
                </div>
                
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleLike('question', question.id)}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${hasLiked('question', question.id) ? 'fill-red-500 text-red-500' : ''}`} />
                    Like
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setCommentTarget({ type: 'question', id: question.id })}
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Bình luận
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Solutions */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Lời giải ({solutions.length})</h2>
            <Button onClick={() => setShowSolutionForm(!showSolutionForm)}>
              <Plus className="h-4 w-4 mr-2" />
              Thêm lời giải
            </Button>
          </div>

          {showSolutionForm && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Thêm lời giải mới</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Textarea
                    placeholder="Nhập lời giải của bạn..."
                    value={newSolution}
                    onChange={(e) => setNewSolution(e.target.value)}
                    rows={8}
                  />
                  <div className="flex gap-2">
                    <Button onClick={handleAddSolution}>Đăng lời giải</Button>
                    <Button variant="outline" onClick={() => setShowSolutionForm(false)}>
                      Hủy
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="space-y-4">
            {solutions.map((solution) => (
              <Card key={solution.id}>
                <CardContent className="pt-6">
                  <div className="space-y-4">
                    <div className="prose max-w-none">
                      <p className="whitespace-pre-wrap">{solution.content}</p>
                    </div>
                    
                    <div className="flex items-center justify-between border-t pt-4">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Bởi: {solution.profiles.display_name}</span>
                        <span>
                          {formatDistanceToNow(new Date(solution.created_at), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleLike('solution', solution.id)}
                        >
                          <Heart className={`h-4 w-4 mr-2 ${hasLiked('solution', solution.id) ? 'fill-red-500 text-red-500' : ''}`} />
                          {solution.likes_count || 0}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCommentTarget({ type: 'solution', id: solution.id })}
                        >
                          <MessageCircle className="h-4 w-4 mr-2" />
                          Bình luận
                        </Button>
                      </div>
                    </div>

                    {/* Solution Comments */}
                    {comments.filter(c => c.parent_type === 'solution' && c.parent_id === solution.id).length > 0 && (
                      <div className="ml-8 space-y-2 border-l-2 border-muted pl-4">
                        {comments
                          .filter(c => c.parent_type === 'solution' && c.parent_id === solution.id)
                          .map((comment) => (
                            <div key={comment.id} className="bg-muted/50 rounded p-3">
                              <p className="text-sm">{comment.content}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                                <span>{comment.profiles.display_name}</span>
                                <span>•</span>
                                <span>
                                  {formatDistanceToNow(new Date(comment.created_at), { 
                                    addSuffix: true, 
                                    locale: vi 
                                  })}
                                </span>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Question Comments */}
        {comments.filter(c => c.parent_type === 'question' && c.parent_id === question.id).length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold mb-4">Bình luận câu hỏi</h3>
            <div className="space-y-3">
              {comments
                .filter(c => c.parent_type === 'question' && c.parent_id === question.id)
                .map((comment) => (
                  <Card key={comment.id}>
                    <CardContent className="pt-4">
                      <p className="text-sm">{comment.content}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2">
                        <span>{comment.profiles.display_name}</span>
                        <span>•</span>
                        <span>
                          {formatDistanceToNow(new Date(comment.created_at), { 
                            addSuffix: true, 
                            locale: vi 
                          })}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
            </div>
          </div>
        )}

        {/* Comment Form */}
        {commentTarget && (
          <Card>
            <CardHeader>
              <CardTitle>
                Thêm bình luận cho {commentTarget.type === 'question' ? 'câu hỏi' : 'lời giải'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea
                  placeholder="Nhập bình luận của bạn..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={3}
                />
                <div className="flex gap-2">
                  <Button onClick={handleAddComment}>Đăng bình luận</Button>
                  <Button variant="outline" onClick={() => setCommentTarget(null)}>
                    Hủy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default QuestionDetail;