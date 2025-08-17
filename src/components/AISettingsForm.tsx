import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { useAISettings } from '@/hooks/useAISettings';
import { useToast } from '@/hooks/use-toast';
import { AIProviderService } from '@/services/aiProvider';
import { 
  Settings, 
  Key, 
  Save, 
  Trash2, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  AlertTriangle,
  Sparkles,
  Brain,
  Zap,
  ExternalLink,
  TestTube,
  Shield,
  Server
} from 'lucide-react';

export function AISettingsForm() {
  const { 
    serverSettings, 
    clientSettings, 
    saveServerSettings, 
    saveClientSettings, 
    clearClientSettings,
    loading 
  } = useAISettings();
  const { toast } = useToast();
  
  const [defaultProvider, setDefaultProvider] = useState<'openai' | 'gemini'>('openai');
  const [openaiApiKey, setOpenaiApiKey] = useState('');
  const [geminiApiKey, setGeminiApiKey] = useState('');
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState<{ provider: string; testing: boolean }>({ provider: '', testing: false });

  useEffect(() => {
    if (serverSettings) {
      setDefaultProvider(serverSettings.default_provider);
    }
    if (clientSettings) {
      setOpenaiApiKey(clientSettings.openaiApiKey);
      setGeminiApiKey(clientSettings.geminiApiKey);
    }
  }, [serverSettings, clientSettings]);

  const handleSaveServerSettings = async () => {
    setSaving(true);
    
    try {
      await saveServerSettings({
        default_provider: defaultProvider
      });

      toast({
        title: 'Thành công',
        description: 'Đã lưu cài đặt server!'
      });
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt server. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleSaveClientSettings = async () => {
    setSaving(true);
    
    try {
      const success = saveClientSettings({
        openaiApiKey: openaiApiKey.trim(),
        geminiApiKey: geminiApiKey.trim()
      });

      if (success) {
        toast({
          title: 'Thành công',
          description: 'Đã lưu API keys!'
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu API keys. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClearClientSettings = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả API keys?')) {
      clearClientSettings();
      setOpenaiApiKey('');
      setGeminiApiKey('');
      toast({
        title: 'Thành công',
        description: 'Đã xóa tất cả API keys!'
      });
    }
  };

  const handleTestProvider = async (provider: 'openai' | 'gemini') => {
    setTesting({ provider, testing: true });
    
    try {
      const result = await AIProviderService.testProvider(provider);
      
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

  const getProviderStatus = (provider: 'openai' | 'gemini') => {
    const hasKey = provider === 'openai' ? !!openaiApiKey : !!geminiApiKey;
    return {
      configured: hasKey,
      label: hasKey ? `${provider === 'openai' ? 'OpenAI' : 'Gemini'} đã cấu hình` : 'Chưa cấu hình'
    };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Server Settings (Admin Only) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-5 w-5 text-primary" />
            Cài đặt Server (Admin)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Provider mặc định</Label>
            <Select value={defaultProvider} onValueChange={(value: 'openai' | 'gemini') => setDefaultProvider(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-green-500" />
                    OpenAI GPT-4o Mini
                  </div>
                </SelectItem>
                <SelectItem value="gemini">
                  <div className="flex items-center gap-2">
                    <Brain className="h-4 w-4 text-blue-500" />
                    Google Gemini 1.5 Flash
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              <strong>Bảo mật:</strong> API keys được lưu trữ an toàn trong Supabase Secrets, không lưu trên client.
              <a 
                href="https://supabase.com/docs/guides/functions/secrets" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-2 inline-flex items-center gap-1"
              >
                Hướng dẫn cấu hình
                <ExternalLink className="h-3 w-3" />
              </a>
            </AlertDescription>
          </Alert>

          <Button onClick={handleSaveServerSettings} disabled={saving}>
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Đang lưu...' : 'Lưu cài đặt server'}
          </Button>
        </CardContent>
      </Card>

      {/* Client Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            API Keys (Client)
            <div className="flex items-center gap-2 ml-auto">
              {['openai', 'gemini'].map((provider) => {
                const status = getProviderStatus(provider as 'openai' | 'gemini');
                return (
                  <Badge key={provider} variant={status.configured ? 'default' : 'secondary'}>
                    {status.configured ? (
                      <CheckCircle className="h-3 w-3 mr-1" />
                    ) : (
                      <AlertTriangle className="h-3 w-3 mr-1" />
                    )}
                    {provider === 'openai' ? 'OpenAI' : 'Gemini'}
                  </Badge>
                );
              })}
            </div>
          </CardTitle>
        </CardContent>
        <CardContent className="space-y-6">
          {/* Provider Cards */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* OpenAI Card */}
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-green-600" />
                  OpenAI
                  {getProviderStatus('openai').configured && (
                    <Badge variant="outline" className="text-xs">Sẵn sàng</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="openai-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="openai-key"
                      type={showOpenAIKey ? 'text' : 'password'}
                      value={openaiApiKey}
                      onChange={(e) => setOpenaiApiKey(e.target.value)}
                      placeholder="sk-..."
                      className="pr-20"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                      >
                        {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleTestProvider('openai')}
                        disabled={!openaiApiKey || testing.testing}
                      >
                        {testing.provider === 'openai' && testing.testing ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lấy API key từ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Gemini Card */}
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  Google Gemini
                  {getProviderStatus('gemini').configured && (
                    <Badge variant="outline" className="text-xs">Sẵn sàng</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="gemini-key" className="flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Key
                  </Label>
                  <div className="relative">
                    <Input
                      id="gemini-key"
                      type={showGeminiKey ? 'text' : 'password'}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AI..."
                      className="pr-20"
                    />
                    <div className="absolute right-1 top-1 flex gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => setShowGeminiKey(!showGeminiKey)}
                      >
                        {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={() => handleTestProvider('gemini')}
                        disabled={!geminiApiKey || testing.testing}
                      >
                        {testing.provider === 'gemini' && testing.testing ? (
                          <LoadingSpinner size="sm" />
                        ) : (
                          <TestTube className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Lấy API key từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Bảo mật:</strong> API keys được lưu trữ cục bộ trong trình duyệt của bạn và chỉ được gửi đến Supabase Edge Functions. 
              Không bao giờ được chia sẻ với bên thứ ba.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSaveClientSettings} 
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu API Keys'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClearClientSettings}
              disabled={saving}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Xóa tất cả
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Zap className="h-5 w-5 text-yellow-500" />
            Hướng dẫn sử dụng
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-green-500" />
                OpenAI (Khuyến nghị)
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chất lượng câu hỏi cao</li>
                <li>• Hỗ trợ tiếng Việt tốt</li>
                <li>• Tốc độ phản hồi nhanh</li>
                <li>• Chi phí: ~$0.15/1M tokens</li>
              </ul>
            </div>
            <div className="space-y-2">
              <h4 className="font-semibold flex items-center gap-2">
                <Brain className="h-4 w-4 text-blue-500" />
                Google Gemini
              </h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Miễn phí với giới hạn</li>
                <li>• Tốc độ phản hồi tốt</li>
                <li>• Hỗ trợ đa ngôn ngữ</li>
                <li>• Giới hạn: 15 requests/phút</li>
              </ul>
            </div>
          </div>

          <Alert>
            <Lightbulb className="h-4 w-4" />
            <AlertDescription>
              <strong>Fallback tự động:</strong> Nếu provider chính gặp lỗi rate limit, hệ thống sẽ tự động thử provider còn lại.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}