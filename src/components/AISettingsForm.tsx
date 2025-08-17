import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAISettings } from '@/hooks/useAISettings';
import { useToast } from '@/hooks/use-toast';
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
  Zap
} from 'lucide-react';

export function AISettingsForm() {
  const { settings, saveSettings, clearSettings, isConfigured } = useAISettings();
  const { toast } = useToast();
  
  const [provider, setProvider] = useState(settings.provider);
  const [openaiApiKey, setOpenaiApiKey] = useState(settings.openaiApiKey);
  const [geminiApiKey, setGeminiApiKey] = useState(settings.geminiApiKey);
  const [showOpenAIKey, setShowOpenAIKey] = useState(false);
  const [showGeminiKey, setShowGeminiKey] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const success = saveSettings({
        provider,
        openaiApiKey: openaiApiKey.trim(),
        geminiApiKey: geminiApiKey.trim()
      });

      if (success) {
        toast({
          title: 'Thành công',
          description: 'Đã lưu cài đặt AI!'
        });
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể lưu cài đặt. Vui lòng thử lại.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleClear = () => {
    if (confirm('Bạn có chắc chắn muốn xóa tất cả cài đặt AI?')) {
      clearSettings();
      setProvider('openai');
      setOpenaiApiKey('');
      setGeminiApiKey('');
      toast({
        title: 'Thành công',
        description: 'Đã xóa tất cả cài đặt AI!'
      });
    }
  };

  const getProviderStatus = () => {
    if (provider === 'openai' && openaiApiKey) {
      return { configured: true, label: 'OpenAI đã cấu hình' };
    } else if (provider === 'gemini' && geminiApiKey) {
      return { configured: true, label: 'Gemini đã cấu hình' };
    }
    return { configured: false, label: 'Chưa cấu hình' };
  };

  const status = getProviderStatus();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Cài đặt AI Provider
          </CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant={status.configured ? 'default' : 'secondary'}>
              {status.configured ? (
                <CheckCircle className="h-3 w-3 mr-1" />
              ) : (
                <AlertTriangle className="h-3 w-3 mr-1" />
              )}
              {status.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider Selection */}
          <div className="space-y-3">
            <Label>Chọn AI Provider mặc định</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  provider === 'openai' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setProvider('openai')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">OpenAI</h3>
                      <p className="text-xs text-muted-foreground">GPT-4o Mini</p>
                    </div>
                    {provider === 'openai' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>

              <Card 
                className={`cursor-pointer transition-all hover:shadow-md ${
                  provider === 'gemini' ? 'ring-2 ring-primary bg-primary/5' : 'hover:bg-muted/50'
                }`}
                onClick={() => setProvider('gemini')}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <Brain className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Google Gemini</h3>
                      <p className="text-xs text-muted-foreground">Gemini 1.5 Flash</p>
                    </div>
                    {provider === 'gemini' && (
                      <CheckCircle className="h-5 w-5 text-primary ml-auto" />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* API Keys */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="openai-key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                OpenAI API Key
                {provider === 'openai' && (
                  <Badge variant="outline" className="text-xs">Đang sử dụng</Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="openai-key"
                  type={showOpenAIKey ? 'text' : 'password'}
                  value={openaiApiKey}
                  onChange={(e) => setOpenaiApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowOpenAIKey(!showOpenAIKey)}
                >
                  {showOpenAIKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Lấy API key từ <a href="https://platform.openai.com/api-keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">OpenAI Platform</a>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="gemini-key" className="flex items-center gap-2">
                <Key className="h-4 w-4" />
                Gemini API Key
                {provider === 'gemini' && (
                  <Badge variant="outline" className="text-xs">Đang sử dụng</Badge>
                )}
              </Label>
              <div className="relative">
                <Input
                  id="gemini-key"
                  type={showGeminiKey ? 'text' : 'password'}
                  value={geminiApiKey}
                  onChange={(e) => setGeminiApiKey(e.target.value)}
                  placeholder="AI..."
                  className="pr-10"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowGeminiKey(!showGeminiKey)}
                >
                  {showGeminiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Lấy API key từ <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google AI Studio</a>
              </p>
            </div>
          </div>

          {/* Security Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <strong>Bảo mật:</strong> API keys được lưu trữ cục bộ trong trình duyệt của bạn và không được gửi đến server của chúng tôi.
            </AlertDescription>
          </Alert>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              onClick={handleSave} 
              disabled={saving}
              className="flex-1"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Đang lưu...' : 'Lưu cài đặt'}
            </Button>
            <Button 
              variant="outline" 
              onClick={handleClear}
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
        </CardContent>
      </Card>
    </div>
  );
}