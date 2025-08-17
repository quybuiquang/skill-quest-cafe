import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AdminSidebar } from '@/components/AdminSidebar';
import { MobileNav } from '@/components/ui/mobile-nav';
import { AIQuestionGenerator } from '@/components/AIQuestionGenerator';
import { AISettingsForm } from '@/components/AISettingsForm';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CategoryModal } from '@/components/CategoryModal';
import { useAuth } from '@/hooks/useAuth';
import { useAdmin } from '@/hooks/useAdmin';
import { useCategories } from '@/hooks/useCategories';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Check, X, Eye, Settings, Shield, Users, FileText, AlertTriangle, TrendingUp, Plus, Edit, Trash2, Tag, Sparkles } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Category } from '@/hooks/useQuestions';

// Overview Dashboard Component
function Overview() {
  const {
    pendingQuestions,
    allQuestions,
    userProfiles,
    loading,
    approveQuestion,
    rejectQuestion,
    deleteQuestion,
    toggleUserStatus
  } = useAdmin();
  
  const { toast } = useToast();
  const navigate = useNavigate();

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

  if (loading) {
    return (
      <div className="flex-1 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Shield className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Tổng quan quản trị</h1>
          <p className="text-muted-foreground">Quản lý câu hỏi và người dùng</p>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{pendingQuestions.length}</p>
                <p className="text-sm text-muted-foreground">Chờ duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <FileText className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{allQuestions.length}</p>
                <p className="text-sm text-muted-foreground">Tổng câu hỏi</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{userProfiles.length}</p>
                <p className="text-sm text-muted-foreground">Người dùng</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">
                  {allQuestions.filter(q => q.status === 'approved').length}
                </p>
                <p className="text-sm text-muted-foreground">Đã duyệt</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Pending Questions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Câu hỏi chờ duyệt gần đây
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingQuestions.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Không có câu hỏi nào đang chờ duyệt.</p>
          ) : (
            <div className="space-y-4">
              {pendingQuestions.slice(0, 5).map((question) => (
                <Card key={question.id} className="border-l-4 border-l-yellow-500">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start gap-4">
                      <h3 className="font-medium text-sm">{question.title}</h3>
                      <div className="flex gap-2 flex-wrap">
                        <Badge className={difficultyColors[question.difficulty]}>
                          {difficultyLabels[question.difficulty]}
                        </Badge>
                        <Badge className={levelColors[question.level]}>
                          {levelLabels[question.level]}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
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
                          <Eye className="h-4 w-4 mr-1" />
                          Xem
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => handleApprove(question.id)}
                        >
                          <Check className="h-4 w-4 mr-1" />
                          Duyệt
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleReject(question.id)}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Từ chối
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Placeholder components for other routes
function PendingQuestions() {
  return <div className="flex-1 p-6"><h1>Pending Questions Page</h1></div>;
}

function AllQuestions() {
  return <div className="flex-1 p-6"><h1>All Questions Page</h1></div>;
}

function UsersManagement() {
  return <div className="flex-1 p-6"><h1>Users Management Page</h1></div>;
}

function CategoriesManagement() {
  return <div className="flex-1 p-6"><h1>Categories Management Page</h1></div>;
}

function APIKeyManagement() {
  return <div className="flex-1 p-6"><h1>API Key Management Page</h1></div>;
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const { userProfiles } = useAdmin();
  const navigate = useNavigate();
  const { toast } = useToast();

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

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <SidebarProvider>
        <div className="flex h-[calc(100vh-4rem)] w-full">
          {/* Desktop Sidebar */}
          <div className="hidden md:block">
            <AdminSidebar />
          </div>
          
          {/* Mobile Navigation */}
          <div className="md:hidden fixed top-16 left-4 z-50">
            <MobileNav />
          </div>

          {/* Main Content */}
          <main className="flex-1 overflow-auto">
            <Routes>
              <Route index element={<Overview />} />
              <Route path="pending" element={<PendingQuestions />} />
              <Route path="questions" element={<AllQuestions />} />
              <Route path="ai-generator" element={
                <div className="flex-1 p-4 md:p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Sparkles className="h-8 w-8 text-primary" />
                        AI Question Generator
                      </h1>
                      <p className="text-muted-foreground">Tạo câu hỏi interview tự động bằng AI</p>
                    </div>
                    <AIQuestionGenerator />
                  </div>
                </div>
              } />
              <Route path="ai-settings" element={
                <div className="flex-1 p-4 md:p-6">
                  <div className="max-w-4xl mx-auto">
                    <div className="mb-6">
                      <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
                        <Settings className="h-8 w-8 text-primary" />
                        Cài đặt AI
                      </h1>
                      <p className="text-muted-foreground">Cấu hình AI providers cho hệ thống</p>
                    </div>
                    <AISettingsForm />
                  </div>
                </div>
              } />
              <Route path="users" element={<UsersManagement />} />
              <Route path="categories" element={<CategoriesManagement />} />
              <Route path="api-key" element={<APIKeyManagement />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
          </main>
        </div>
      </SidebarProvider>
      <Footer />
    </div>
  );
}