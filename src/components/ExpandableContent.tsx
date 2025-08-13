import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ExpandableContentProps {
  content: string;
  maxLength?: number;
  className?: string;
}

export function ExpandableContent({ 
  content, 
  maxLength = 300,
  className 
}: ExpandableContentProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  const shouldTruncate = content.length > maxLength;
  const displayContent = shouldTruncate && !isExpanded 
    ? content.substring(0, maxLength) + '...'
    : content;

  return (
    <div className={cn("space-y-3", className)}>
      <div 
        className="prose max-w-none bg-green-50/50 dark:bg-green-950/20 p-4 rounded-lg"
        dangerouslySetInnerHTML={{ __html: displayContent }}
      />
      
      {shouldTruncate && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary hover:bg-primary/10"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-2" />
              Thu gọn
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-2" />
              Xem thêm
            </>
          )}
        </Button>
      )}
    </div>
  );
}