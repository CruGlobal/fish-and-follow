import React from 'react'
import { Card, CardContent } from './card'
import { StatusBadge } from './StatusBadge'

interface TemplateInfoCardProps {
  template: {
    name: string
    language: string
    category: string
    status: string
  }
}

export function TemplateInfoCard({ template }: TemplateInfoCardProps) {
  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex items-center justify-between text-sm px-2">
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Name:</span>
            <span className="font-medium text-gray-900">{template.name}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Language:</span>
            <span className="text-gray-900">{template.language}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Category:</span>
            <span className="text-gray-900">{template.category}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-medium">Status:</span>
            <StatusBadge status={template.status} />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
