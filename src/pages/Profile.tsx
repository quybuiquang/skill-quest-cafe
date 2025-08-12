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
  Camera
} from 'lucide-react';

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
            <p className="mt-4 text-muted-foreground">Đang tải thông tin...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container mx-auto px-4 py-6 md:py-8">
        {/* Back button */}
        <Button 
          variant="ghost" 
          onClick={() => navigate('/')}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Quay lại
        </Button>

        <div className="max-w-4xl mx-auto space-y-6">
          {/* Profile Header Card */}
          <Card className="relative overflow-hidden">
            {/* Background pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
            
            <CardContent className="relative pt-8 pb-6">
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                {/* Avatar Section */}
                <div className="flex flex-col items-center space-y-3">
                  {isEditing ? (
                    <AvatarUpload
                      currentAvatar={profile?.avatar_url}
                      onAvatarChange={setAvatarFile}
                      size="xl"
                      className="ring-4 ring-background shadow-lg"
                    />
                  ) : (
                    <div className="relative">
                      <div className="h-24 w-24 rounded-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center ring-4 ring-background shadow-lg">
                        {profile?.avatar_url ? (
                          <img 
                            src={profile.avatar_url} 
                            alt="Avatar" 
                            className="h-full w-full rounded-full object-cover"
                          />
                        ) : (
                          <Camera className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                  )}
                  
                  {/* Role Badge */}
                  <Badge 
                    variant={profile?.role === 'admin' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    <Shield className="h-3 w-3 mr-1" />
                    {profile?.role === 'admin' ? 'Quản trị viên' : 'Thành viên'}
                  </Badge>
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left space-y-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="displayName" className="text-sm font-medium">
                          Tên hiển thị
                        </Label>
                        <Input
                          id="displayName"
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Nhập tên hiển thị..."
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="bio" className="text-sm font-medium">
                          Giới thiệu
                        </Label>
                        <Textarea
                          id="bio"
                          value={bio}
                          onChange={(e) => setBio(e.target.value)}
                          placeholder="Viết vài dòng giới thiệu về bản thân..."
                          rows={3}
                          className="mt-1 resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h1 className="text-2xl md:text-3xl font-bold">
                        {profile?.display_name || 'Quý Bùi'}
                      </h1>
                      
                      {profile?.bio && (
                        <p className="text-muted-foreground leading-relaxed max-w-2xl">
                          {profile.bio}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {/* Tham gia {formatDistanceToNow(new Date(profile?.created_at || ''), { 
                              addSuffix: true, 
                              locale: vi 
                            })} */}
                            {profile?.created_at && !isNaN(new Date(profile.created_at).getTime())
      ? `Tham gia ${formatDistanceToNow(new Date(profile.created_at), { addSuffix: true, locale: vi })}`
      : 'Ngày tham gia không xác định'}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-4 w-4" />
                          <span>Trạng thái: {profile?.status === 'active' ? 'Hoạt động' : 'Bị khóa'}</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 justify-center md:justify-start pt-2">
                    {isEditing ? (
                      <>
                        <Button 
                          onClick={handleSave} 
                          disabled={saving}
                          size="sm"
                        >
                          <Save className="h-4 w-4 mr-2" />
                          {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={handleCancel}
                          disabled={saving}
                          size="sm"
                        >
                          <X className="h-4 w-4 mr-2" />
                          Hủy
                        </Button>
                      </>
                    ) : (
                      <Button 
                        onClick={() => setIsEditing(true)}
                        size="sm"
                      >
                        <Edit3 className="h-4 w-4 mr-2" />
                        Chỉnh sửa hồ sơ
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Additional Profile Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Account Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Thông tin tài khoản
                </CardTitle>
                <CardDescription>
                  Thông tin cơ bản về tài khoản của bạn
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Email:</span>
                  <span className="text-sm text-muted-foreground">{user.email}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">ID:</span>
                  <span className="text-sm text-muted-foreground font-mono">
                    {user.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Xác thực:</span>
                  <Badge variant="outline" className="text-xs">
                    {user.email_confirmed_at ? 'Đã xác thực' : 'Chưa xác thực'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Activity Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Hoạt động
                </CardTitle>
                <CardDescription>
                  Thống kê hoạt động của bạn trên nền tảng
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Câu hỏi đã tạo:</span>
                  <span className="text-sm font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-sm font-medium">Lời giải đã viết:</span>
                  <span className="text-sm font-semibold">0</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-medium">Bình luận:</span>
                  <span className="text-sm font-semibold">0</span>
                </div>
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