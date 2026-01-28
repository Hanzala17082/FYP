import { ActionButton } from './ActionButton'

interface QuickAction {
  icon: string
  label: string
  onClick: () => void
}

interface QuickActionGridProps {
  actions: QuickAction[]
  columns?: 2 | 3 | 4
  className?: string
}

export function QuickActionGrid({ actions, columns = 4, className }: QuickActionGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }

  return (
    <div className={`grid ${gridCols[columns]} gap-3 ${className || ''}`}>
      {actions.map((action, index) => (
        <ActionButton
          key={index}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
        />
      ))}
    </div>
  )
}
