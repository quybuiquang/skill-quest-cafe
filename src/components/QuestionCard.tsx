import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Question } from '@/hooks/useQuestions';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { vi } from 'date-fns/locale';

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
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start gap-2">
          <CardTitle className="text-lg">
            <Link 
              to={`/questions/${question.id}`}
              className="hover:text-primary transition-colors"
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
          <p className="text-muted-foreground line-clamp-3">
            {question.content.substring(0, 150)}...
          </p>
          <div className="flex justify-between items-center text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span>Danh mục: {question.categories.name}</span>
              <span>Bởi: {question.profiles.display_name}</span>
            </div>
            <span>
              {formatDistanceToNow(new Date(question.created_at), { 
                addSuffix: true, 
                locale: vi 
              })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}