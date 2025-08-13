import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, Clock, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AutoSaveIndicatorProps {
  isEnabled: boolean;
  isSaving: boolean;
  lastSaved?: Date;
  onSave?: () => void;
  className?: string;
}

export function AutoSaveIndicator({ 
  isEnabled, 
  isSaving, 
  lastSaved, 
  onSave,
  className 
}: AutoSaveIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (!lastSaved) return;
    
    const updateTimeAgo = () => {
      const now = new Date();
      const diff = now.getTime() - lastSaved.getTime();
      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      
      if (minutes > 0) {
        setTimeAgo(`${minutes} phút trước`);
      } else {
        setTimeAgo(`${seconds} giây trước`);
      }
    };

    updateTimeAgo();
    const interval = setInterval(updateTimeAgo, 1000);
    
    return () => clearInterval(interval);
  }, [lastSaved]);

  if (!isEnabled) return null;

  return (
    <Card className={cn("border-dashed", className)}>
      <CardContent className="p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm">
            {isSaving ? (
              <>
                <Clock className="h-4 w-4 animate-spin text-blue-500" />
                <span className="text-blue-600">Đang lưu nháp...</span>
              </>
            ) : lastSaved ? (
              <>
                <Save className="h-4 w-4 text-green-500" />
                <span className="text-green-600">Đã lưu {timeAgo}</span>
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                <span className="text-yellow-600">Chưa lưu nháp</span>
              </>
            )}
          </div>
          
          {onSave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onSave}
              disabled={isSaving}
              className="text-xs"
            >
              Lưu ngay
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}