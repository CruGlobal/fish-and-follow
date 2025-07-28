import React from 'react'
import { Badge } from './badge'

interface StatusBadgeProps {
  status: string
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const getStatusVariant = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'APPROVED':
        return 'default' // Green
      case 'PENDING':
        return 'secondary' // Yellow/Gray
      case 'REJECTED':
        return 'destructive' // Red
      default:
        return 'outline'
    }
  }

  return (
    <Badge 
      variant={getStatusVariant(status)}
      className={className}
    >
      {status}
    </Badge>
  )
}
