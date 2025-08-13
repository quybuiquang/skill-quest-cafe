import { useState, useEffect } from 'react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FormProgressProps {
  title: string;
  content: string;
  categoryId: string;
  className?: string;
}

export function FormProgress({ title, content, categoryId, className }: FormProgressProps) {
  const [progress, setProgress] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);

  const steps = [
    { id: 'title', label: 'Tiêu đề', completed: title.trim().length >= 10 },
    { id: 'content', label: 'Nội dung', completed: content.trim().length >= 50 },
    { id: 'category', label: 'Danh mục', completed: !!categoryId }
  ];

  useEffect(() => {
    const completed = steps.filter(step => step.completed);
    setCompletedSteps(completed.map(step => step.id));
    setProgress((completed.length / steps.length) * 100);
  }, [title, content, categoryId]);

  return (
    <div className={cn("space-y-3 p-4 bg-muted/30 rounded-lg border", className)}>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium">Tiến độ hoàn thành</h4>
        <Badge variant={progress === 100 ? 'default' : 'secondary'}>
          {Math.round(progress)}%
        </Badge>
      </div>
      
      <Progress value={progress} className="h-2" />
      
      <div className="grid grid-cols-3 gap-2">
        {steps.map((step) => (
          <div
            key={step.id}
            className={cn(
              "flex items-center gap-2 text-xs p-2 rounded",
              step.completed 
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400" 
                : "bg-muted text-muted-foreground"
            )}
          >
            {step.completed ? (
              <CheckCircle className="h-3 w-3" />
            ) : (
              <Clock className="h-3 w-3" />
            )}
            <span>{step.label}</span>
          </div>
        ))}
      </div>
      
      {progress < 100 && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <AlertCircle className="h-3 w-3" />
          <span>Hoàn thành tất cả bước để có thể gửi câu hỏi</span>
        </div>
      )}
    </div>
  );
}