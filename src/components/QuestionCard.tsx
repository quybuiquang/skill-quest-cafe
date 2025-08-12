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
    <Card className="hover:shadow-md transition-all duration-200 border-l-4 border-l-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <CardTitle className="text-base sm:text-lg leading-tight">
            <Link 
              to={`/questions/${question.id}`}
              className="hover:text-primary transition-colors line-clamp-2 font-semibold"
            >
              {question.title}
            </Link>
          </CardTitle>
          <div className="flex gap-1.5 flex-wrap">
            <Badge className={`${difficultyColors[question.difficulty]} text-xs px-2 py-0.5`}>
              {difficultyLabels[question.difficulty]}
            </Badge>
            <Badge className={`${levelColors[question.level]} text-xs px-2 py-0.5`}>
              {levelLabels[question.level]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <p className="text-muted-foreground line-clamp-2 text-sm leading-relaxed">
            {question.content.substring(0, 150)}...
          </p>
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3 pt-3 border-t">
            <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span className="font-medium">{question.profiles.display_name}</span>
              </div>
              <span className="hidden sm:inline">•</span>
              <span className="bg-muted px-2 py-0.5 rounded text-xs">{question.categories.name}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-xs">
                {formatDistanceToNow(new Date(question.created_at), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2 self-end sm:self-auto">
              <Button asChild size="sm" variant="outline" className="text-xs h-8">
                <Link to={`/questions/${question.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  <span className="hidden sm:inline">Xem chi tiết</span>
                  <span className="sm:hidden">Xem</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}