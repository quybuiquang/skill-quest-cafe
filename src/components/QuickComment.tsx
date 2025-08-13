import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { RichTextEditor } from '@/components/RichTextEditor';
import { Badge } from '@/components/ui/badge';
import { 
  MessageCircle, 
  Send, 
  X, 
  Minimize2, 
  Maximize2, 
  Type, 
  Code,
  User,
  Calendar
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { cn } from '@/lib/utils';

interface QuickCommentProps {
  targetType: 'question' | 'solution';
  targetId: string;
  targetTitle?: string;
  onSubmit: (content: string) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  className?: string;
}

export function QuickComment({ 
  targetType, 
  targetId, 
  targetTitle,
  onSubmit, 
  onCancel,
  loading = false,
  className 
}: QuickCommentProps) {
  const [content, setContent] = useState('');
  const [isRichMode, setIsRichMode] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!content.trim()) return;
    
    setIsSubmitting(true);
    try {
      await onSubmit(content);
      setContent('');
    } catch (error) {
      console.error('Error submitting comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isValid = content.trim().length >= 5;

  return (
    <Card className={cn(
      "sticky bottom-4 z-50 shadow-lg border-2 transition-all duration-200",
      isMinimized ? "h-auto" : "",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm">
            <MessageCircle className="h-4 w-4" />
            Bình luận cho {targetType === 'question' ? 'câu hỏi' : 'lời giải'}
            {targetTitle && (
              <Badge variant="outline" className="ml-2 text-xs max-w-[200px] truncate">
                {targetTitle}
              </Badge>
            )}
          </CardTitle>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsMinimized(!isMinimized)}
            >
              {isMinimized ? (
                <Maximize2 className="h-4 w-4" />
              ) : (
                <Minimize2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {!isMinimized && (
        <CardContent className="space-y-4">
          {/* Editor Mode Toggle */}
          <div className="flex items-center gap-2">
            <Button
              variant={!isRichMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRichMode(false)}
            >
              <Type className="h-4 w-4 mr-2" />
              Text đơn giản
            </Button>
            <Button
              variant={isRichMode ? "default" : "outline"}
              size="sm"
              onClick={() => setIsRichMode(true)}
            >
              <Code className="h-4 w-4 mr-2" />
              Rich Text
            </Button>
          </div>
          
          {/* Content Input */}
          {isRichMode ? (
            <RichTextEditor
              content={content}
              onChange={setContent}
              placeholder="Nhập bình luận của bạn... Hỗ trợ markdown, code blocks..."
              className="min-h-[100px]"
            />
          ) : (
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Nhập bình luận của bạn..."
              rows={3}
              className="resize-none focus:ring-2 focus:ring-primary/20"
            />
          )}
          
          {/* Character count and hints */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className={cn(
                content.length < 5 ? "text-red-500" : "text-green-600"
              )}>
                {content.length} ký tự {content.length < 5 && "(tối thiểu 5)"}
              </span>
              {isRichMode && (
                <span className="text-blue-500">
                  Tip: Sử dụng ``` để tạo code block
                </span>
              )}
            </div>
          </div>
          
          {/* Action buttons */}
          <div className="flex items-center gap-2">
            <Button
              onClick={handleSubmit}
              disabled={!isValid || isSubmitting || loading}
              className="flex-1"
            >
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Đang gửi...' : 'Gửi bình luận'}
            </Button>
            <Button
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting || loading}
            >
              Hủy
            </Button>
          </div>
        </CardContent>
      )}
    </Card>
  );
}