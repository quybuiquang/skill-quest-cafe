import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AvatarUpload } from '@/components/ui/avatar-upload';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Calendar, 
  Shield, 
  Award,
  ArrowLeft,
  Camera,
  Settings,
  CheckCircle2,
  UserCircle,
  Mail,
  Key,
  Activity,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

const Profile = () => {
  const { user } = useAuth();
  const { profile, loading, updateProfile, uploadAvatar } = useProfile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  // Initialize form data when profile loads
  React.useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
  }, [profile]);

  const handleSave = async () => {
    if (!profile) return;

    setSaving(true);
    try {
      let avatarUrl = profile.avatar_url;
      
      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await uploadAvatar(avatarFile);
      }

      await updateProfile({
        display_name: displayName.trim() || 'Quý Bùi',
        bio: bio.trim(),
        avatar_url: avatarUrl
      });

      setIsEditing(false);
      setAvatarFile(null);
      
      toast({
        title: 'Thành công',
        description: 'Đã cập nhật thông tin cá nhân!'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: 'Lỗi',
        description: 'Không thể cập nhật thông tin. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setDisplayName(profile.display_name || '');
      setBio(profile.bio || '');
    }
    setAvatarFile(null);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="text-center animate-fade-in">
            <div className="h-12 w-12 rounded-full bg-muted/20 flex items-center justify-center mx-auto mb-4">
              <UserCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h2 className="text-2xl font-bold mb-4">Vui lòng đăng nhập</h2>
            <Button onClick={() => navigate('/auth')} className="hover-scale">
              Đăng nhập
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
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-2 border-primary/20 border-t-primary mx-auto"></div>
              <div className="absolute inset-0 animate-pulse rounded-full h-16 w-16 bg-primary/5 mx-auto"></div>
            </div>
            <p className="mt-6 text-muted-foreground animate-fade-in">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/10">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6 hover-scale group animate-fade-in"
        >
          <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
          Quay lại
        </Button>

        <div className="max-w-5xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card className="relative overflow-hidden animate-fade-in border-0 shadow-lg">
            {/* Animated background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/2 to-transparent animate-pulse" />
            
            <CardContent className="relative pt-8 pb-8">
              <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-4 animate-scale-in">
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={profile?.avatar_url}
                      onAvatarChange={setAvatarFile}
                      size="xl"
                      className="ring-4 ring-background shadow-xl hover-scale"
                    />
                  ) : (
                    <div className="relative group">
                      <div className="h-28 w-28 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-4 ring-background shadow-xl hover-scale transition-all duration-300 group-hover:shadow-2xl">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Camera className="h-10 w-10 text-muted-foreground" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 h-8 w-8 rounded-full bg-primary/10 backdrop-blur-sm flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-primary animate-pulse" />
                      </div>
                    </div>
                  )}
                  
                  {/* Role Badge */}
                  <Badge 
                    variant={profile?.role === 'admin' ? 'default' : 'secondary'}
                    className="text-xs animate-fade-in hover-scale"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </Badge>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center lg:text-left space-y-6 animate-fade-in">
                  {isEditing ? (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <Label htmlFor="displayName" className="text-sm font-medium flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Tên hiển thị
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Nhập tên hiển thị..."
                          className="transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="bio" className="text-sm font-medium flex items-center gap-2">
                          <Edit3 className="h-4 w-4" />
                          Giới thiệu
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Viết vài dòng giới thiệu về bản thân..."
                          rows={4}
                          className="resize-none transition-all duration-200 focus:scale-[1.02]"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                        {profile?.display_name || 'Quý Bùi'}
                      </h1>
                      
                      {profile?.bio && (
                        <div className="relative">
                          <p className="text-muted-foreground leading-relaxed max-w-3xl text-lg">
                            {profile.bio}
                          </p>
                          <div className="absolute -left-2 top-0 w-1 h-full bg-gradient-to-b from-primary to-transparent rounded-full" />
                        </div>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2 hover-scale">
                          <Calendar className="h-4 w-4 text-primary" />
                          <span>
                            {profile?.created_at && !isNaN(new Date(profile.created_at).getTime())
                              ? `Tham gia ${formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: vi })}`
                              : 'Ngày tham gia không xác định'}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 hover-scale">
                          <Activity className="h-4 w-4 text-green-500" />
                          <span>Trạng thái: {profile?.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center lg:justify-start pt-4">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          className="hover-scale group"
                        >
                          <Save className={cn("h-4 w-4 mr-2 transition-transform", saving && "animate-spin")} />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={saving}
                          className="hover-scale"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="hover-scale group"
                      >
                        <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                        Chỉnh sửa hồ sơ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Cards Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Account Info */}
            <Card className="hover-scale group border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Mail className="h-4 w-4 text-primary" />
                  </div>
                  Thông tin tài khoản
                </CardTitle>
                <CardDescription>
                  Thông tin cơ bản về tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-border/50 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-xs text-muted-foreground font-mono bg-muted/30 px-2 py-1 rounded">
                    {user.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">Xác thực:</span>
                  <Badge variant="outline" className="text-xs">
                    <CheckCircle2 className="h-3 w-3 mr-1 text-green-500" />
                    {user.email_confirmed_at ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card className="hover-scale group border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Activity className="h-4 w-4 text-orange-500" />
                  </div>
                  Hoạt động
                </CardTitle>
                <CardDescription>
                  Thống kê hoạt động của bạn trên nền tảng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-3 border-b border-border/50 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">Câu hỏi đã tạo:</span>
                  <span className="text-sm font-semibold bg-primary/10 text-primary px-2 py-1 rounded">0</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-border/50 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">Lời giải đã viết:</span>
                  <span className="text-sm font-semibold bg-green-500/10 text-green-600 px-2 py-1 rounded">0</span>
                </div>
                <div className="flex justify-between items-center py-3 hover:bg-muted/20 px-2 rounded transition-colors">
                  <span className="text-sm font-medium">Bình luận:</span>
                  <span className="text-sm font-semibold bg-blue-500/10 text-blue-600 px-2 py-1 rounded">0</span>
                </div>
              </CardContent>
            </Card>

            {/* Settings Quick Access */}
            <Card className="hover-scale group border-0 shadow-md hover:shadow-lg transition-all duration-300 animate-fade-in lg:col-span-2 xl:col-span-1">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg group-hover:text-primary transition-colors">
                  <div className="h-8 w-8 rounded-lg bg-purple-500/10 flex items-center justify-center">
                    <Settings className="h-4 w-4 text-purple-500" />
                  </div>
                  Cài đặt nhanh
                </CardTitle>
                <CardDescription>
                  Các tùy chọn và cài đặt tài khoản
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-muted/50 hover-scale group"
                  onClick={() => setIsEditing(true)}
                >
                  <Edit3 className="h-4 w-4 mr-2 group-hover:rotate-12 transition-transform" />
                  Chỉnh sửa thông tin
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-muted/50 hover-scale"
                  disabled
                >
                  <Key className="h-4 w-4 mr-2" />
                  Đổi mật khẩu
                </Button>
                <Button 
                  variant="ghost" 
                  className="w-full justify-start hover:bg-muted/50 hover-scale"
                  disabled
                >
                  <Shield className="h-4 w-4 mr-2" />
                  Bảo mật tài khoản
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;