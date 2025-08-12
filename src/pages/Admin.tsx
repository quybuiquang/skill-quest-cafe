import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, X, Eye, Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const {
    pendingQuestions,
    allQuestions,
    userProfiles,
    loading,
    fetchPendingQuestions,
    fetchAllQuestions,
    fetchUserProfiles,
    approveQuestion,
    rejectQuestion,
    deleteQuestion,
    toggleUserStatus
  } = useAdmin();

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

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
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

  const statusLabels = {
    pending: 'Chờ duyệt',
    approved: 'Đã duyệt',
    rejected: 'Từ chối'
  };

  const userStatusLabels = {
    active: 'Hoạt động',
    locked: 'Bị khóa'
  };

  const handleApprove = async (questionId: string) => {
    try {
      await approveQuestion(questionId);
      toast({
        title: "Thành công",
        description: "Đã duyệt câu hỏi!"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể duyệt câu hỏi. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleReject = async (questionId: string) => {
    try {
      await rejectQuestion(questionId);
      toast({
        title: "Thành công",
        description: "Đã từ chối câu hỏi!"
      });
    } catch (error) {
      toast({
        title: "Lỗi",
        description: "Không thể từ chối câu hỏi. Vui lòng thử lại.",
        variant: "destructive"
      });
    }
  };

  const handleDelete = async (questionId: string) => {
    if (confirm('Bạn có chắc chắn muốn xóa câu hỏi này?')) {
      try {
        await deleteQuestion(questionId);
        toast({
          title: "Thành công",
          description: "Đã xóa câu hỏi!"
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: "Không thể xóa câu hỏi. Vui lòng thử lại.",
          variant: "destructive"
        });
      }
    }
  };

  const handleToggleUserStatus = async (userId: string, currentStatus: string) => {
    const action = currentStatus === 'active' ? 'khóa' : 'mở khóa';
    if (confirm(`Bạn có chắc chắn muốn ${action} tài khoản này?`)) {
      try {
        await toggleUserStatus(userId, currentStatus === 'active' ? 'locked' : 'active');
        toast({
          title: "Thành công",
          description: `Đã ${action} tài khoản!`
        });
      } catch (error) {
        toast({
          title: "Lỗi",
          description: `Không thể ${action} tài khoản. Vui lòng thử lại.`,
          variant: "destructive"
        });
      }
    }
  };

  // Check if user is admin
  useEffect(() => {
    if (user && userProfiles.length > 0) {
      const currentUserProfile = userProfiles.find(p => p.user_id === user.id);
      if (!currentUserProfile || currentUserProfile.role !== 'admin') {
        navigate('/');
        toast({
          title: "Không có quyền truy cập",
          description: "Bạn không có quyền truy cập trang quản trị.",
          variant: "destructive"
        });
      }
    }
  }, [user, userProfiles, navigate, toast]);

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
            <p className="mt-4 text-muted-foreground">Đang tải...</p>
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
          <h1 className="text-3xl font-bold mb-4">Quản trị hệ thống</h1>
        </div>

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending">Câu hỏi chờ duyệt ({pendingQuestions.length})</TabsTrigger>
            <TabsTrigger value="all-questions">Tất cả câu hỏi ({allQuestions.length})</TabsTrigger>
            <TabsTrigger value="users">Người dùng ({userProfiles.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            <div className="space-y-4">
              {pendingQuestions.length === 0 ? (
                <Card>
                  <CardContent className="py-8 text-center">
                    <p className="text-muted-foreground">Không có câu hỏi nào đang chờ duyệt.</p>
                  </CardContent>
                </Card>
              ) : (
                pendingQuestions.map((question) => (
                  <Card key={question.id}>
                    <CardHeader>
                      <div className="flex justify-between items-start gap-4">
                        <CardTitle className="text-lg">{question.title}</CardTitle>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={difficultyColors[question.difficulty]}>
                            {difficultyLabels[question.difficulty]}
                          </Badge>
                          <Badge className={levelColors[question.level]}>
                            {levelLabels[question.level]}
                          </Badge>
                          <Badge className={statusColors[question.status]}>
                            {statusLabels[question.status]}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <p className="text-muted-foreground line-clamp-3">
                          {question.content.substring(0, 200)}...
                        </p>
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <span>Danh mục: {question.categories.name}</span>
                            <span>Bởi: {question.profiles.display_name}</span>
                            <span>
                              {formatDistanceToNow(new Date(question.created_at), { 
                                addSuffix: true, 
                                locale: vi 
                              })}
                            </span>
                          </div>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => navigate(`/questions/${question.id}`)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              Xem
                            </Button>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(question.id)}
                            >
                              <Check className="h-4 w-4 mr-2" />
                              Duyệt
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleReject(question.id)}
                            >
                              <X className="h-4 w-4 mr-2" />
                              Từ chối
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>

          <TabsContent value="all-questions">
            <div className="space-y-4">
              {allQuestions.map((question) => (
                <Card key={question.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                      <CardTitle className="text-lg">{question.title}</CardTitle>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={difficultyColors[question.difficulty]}>
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                        <Badge className={levelColors[question.level]}>
                          {levelLabels[question.level]}
                        </Badge>
                        <Badge className={statusColors[question.status]}>
                          {statusLabels[question.status]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <p className="text-muted-foreground line-clamp-2">
                        {question.content.substring(0, 150)}...
                      </p>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>Danh mục: {question.categories.name}</span>
                          <span>Bởi: {question.profiles.display_name}</span>
                          <span>
                            {formatDistanceToNow(new Date(question.created_at), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => navigate(`/questions/${question.id}`)}
                          >
                            <Eye className="h-4 w-4 mr-2" />
                            Xem
                          </Button>
                          {question.status === 'pending' && (
                            <>
                              <Button
                                size="sm"
                                onClick={() => handleApprove(question.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Duyệt
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleReject(question.id)}
                              >
                                <X className="h-4 w-4 mr-2" />
                                Từ chối
                              </Button>
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(question.id)}
                          >
                            Xóa
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="users">
            <div className="space-y-4">
              {userProfiles.map((profile) => (
                <Card key={profile.id}>
                  <CardContent className="py-6">
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        <h3 className="font-semibold">{profile.display_name}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <Badge variant={profile.role === 'admin' ? 'default' : 'secondary'}>
                            {profile.role === 'admin' ? 'Quản trị viên' : 'Người dùng'}
                          </Badge>
                          <Badge variant={profile.status === 'active' ? 'default' : 'destructive'}>
                            {userStatusLabels[profile.status]}
                          </Badge>
                          <span>
                            Tham gia {formatDistanceToNow(new Date(profile.created_at), { 
                              addSuffix: true, 
                              locale: vi 
                            })}
                          </span>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant={profile.status === 'active' ? 'destructive' : 'default'}
                          onClick={() => handleToggleUserStatus(profile.user_id, profile.status)}
                          disabled={profile.role === 'admin'}
                        >
                          {profile.status === 'active' ? 'Khóa' : 'Mở khóa'}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Admin;