import { ReactNode } from 'react'
import { Button } from './button'
import { Card, CardContent } from './card'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card className="text-center py-12">
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="text-muted-foreground">
            {icon}
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-semibold">{title}</h3>
            <p className="text-muted-foreground max-w-md">{description}</p>
          </div>
          {action && (
            <Button onClick={action.onClick}>
              {action.label}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}