import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Question } from '@/hooks/useQuestions';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';
import { MessageCircle, Heart, Eye, User } from 'lucide-react';

interface QuestionCardProps {
  question: Question;
}

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

export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <Card className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-primary/30 bg-card/50 backdrop-blur-sm group">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2">
          {/* Header: Title and Badges */}
          <div className="flex justify-between items-start gap-2">
            <h3 className="flex-1 text-sm sm:text-base font-medium leading-tight line-clamp-2">
              <Link 
                to={`/questions/${question.id}`}
                className="hover:text-primary transition-colors group-hover:text-primary"
              >
                {question.title}
              </Link>
            </h3>
            <div className="flex gap-1 flex-shrink-0">
              <Badge variant="secondary" className={`${difficultyColors[question.difficulty]} text-xs px-1.5 py-0.5`}>
                {difficultyLabels[question.difficulty]}
              </Badge>
              <Badge variant="secondary" className={`${levelColors[question.level]} text-xs px-1.5 py-0.5`}>
                {levelLabels[question.level]}
              </Badge>
            </div>
          </div>
          
          {/* Content Preview */}
          <p className="text-muted-foreground text-xs sm:text-sm line-clamp-2 leading-relaxed">
            {question.content.substring(0, 120)}...
          </p>
          
          {/* Footer: Metadata and Action */}
          <div className="flex items-center justify-between pt-2 border-t border-border/50">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground overflow-hidden">
              <div className="flex items-center gap-1 flex-shrink-0">
                <User className="h-3 w-3" />
                <span className="font-medium truncate max-w-[80px]">{question.profiles.display_name}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="bg-muted/70 px-1.5 py-0.5 rounded text-xs truncate max-w-[100px]">
                {question.categories.name}
              </span>
              <span className="hidden lg:inline">•</span>
              <span className="hidden lg:inline text-xs">
                {formatDistanceToNow(new Date(question.created_at), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </span>
            </div>
            <Button asChild size="sm" variant="ghost" className="text-xs h-7 px-2 hover:bg-primary/10">
              <Link to={`/questions/${question.id}`}>
                <Eye className="h-3 w-3 mr-1" />
                <span className="hidden sm:inline">Xem</span>
              </Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}