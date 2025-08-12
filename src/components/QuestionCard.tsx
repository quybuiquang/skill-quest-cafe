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
    <Card className="hover:shadow-lg transition-all duration-200 hover:scale-[1.02] border-l-4 border-l-primary/20">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">
            <Link 
              to={`/questions/${question.id}`}
              className="hover:text-primary transition-colors line-clamp-2"
            >
              {question.title}
            </Link>
          </CardTitle>
          <div className="flex gap-2 flex-wrap">
            <Badge className={difficultyColors[question.difficulty]}>
              {difficultyLabels[question.difficulty]}
            </Badge>
            <Badge className={levelColors[question.level]}>
              {levelLabels[question.level]}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <p className="text-muted-foreground line-clamp-3 text-sm leading-relaxed">
            {question.content.substring(0, 150)}...
          </p>
          <div className="flex justify-between items-center pt-3 border-t">
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{question.profiles.display_name}</span>
              </div>
              <span>•</span>
              <span>{question.categories.name}</span>
              <span>•</span>
              <span>
                {formatDistanceToNow(new Date(question.created_at), { 
                  addSuffix: true, 
                  locale: vi 
                })}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button asChild size="sm" variant="outline">
                <Link to={`/questions/${question.id}`}>
                  <Eye className="h-3 w-3 mr-1" />
                  Xem chi tiết
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}