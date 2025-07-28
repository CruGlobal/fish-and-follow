import React from 'react'
import { Button } from './button'
import { ExternalLink } from 'lucide-react'

interface TemplateComponent {
  type: "HEADER" | "BODY" | "FOOTER" | "BUTTONS"
  text?: string
  format?: "TEXT" | "MEDIA"
  buttons?: Array<{
    type?: string
    text?: string
    url?: string
    phone_number?: string
  }>
  example?: unknown
}

interface FacebookConfig {
  businessId: string
  assetId: string
}

interface TemplatePreviewProps {
  components: TemplateComponent[]
  facebookConfig?: FacebookConfig
}

export function TemplatePreview({ components, facebookConfig }: TemplatePreviewProps) {
  const renderComponent = (component: TemplateComponent, index: number) => {
    // Header component
    if (component.type === 'HEADER') {
      return (
        <div key={index} className="border-b border-blue-200 pb-2">
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Header</div>
          <div className="text-sm font-semibold text-gray-800">
            {component.text || '[Header Content]'}
          </div>
        </div>
      )
    }
    
    // Body component
    if (component.type === 'BODY') {
      return (
        <div key={index} className="py-1">
          <div className="text-xs text-gray-600 uppercase tracking-wide mb-1">Message</div>
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {component.text || '[Message Body]'}
          </div>
        </div>
      )
    }
    
    // Footer component
    if (component.type === 'FOOTER') {
      return (
        <div key={index} className="border-t border-blue-200 pt-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Footer</div>
          <div className="text-xs text-gray-600">
            {component.text || '[Footer Content]'}
          </div>
        </div>
      )
    }
    
    // Buttons component
    if (component.type === 'BUTTONS' && component.buttons) {
      return (
        <div key={index} className="border-t border-blue-200 pt-2">
          <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Buttons</div>
          <div className="space-y-1">
            {component.buttons.map((button, buttonIndex) => (
              <div 
                key={buttonIndex} 
                className="inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded text-xs text-gray-700 mr-2 mb-1"
              >
                {button.type === 'URL' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                )}
                {button.type === 'PHONE_NUMBER' && (
                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                )}
                {button.text || '[Button]'}
              </div>
            ))}
          </div>
        </div>
      )
    }
    
    // Fallback for other component types
    return (
      <div key={index} className="text-sm text-gray-600">
        <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{component.type}</div>
        <div>{component.text || '[Content]'}</div>
      </div>
    )
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-base font-semibold text-gray-900">Template Preview</h4>
        {facebookConfig?.businessId && facebookConfig?.assetId ? (
          <Button
            variant="outline"
            size="sm"
            asChild
          >
            <a
              href={`https://business.facebook.com/latest/whatsapp_manager/message_templates?business_id=${facebookConfig.businessId}&asset_id=${facebookConfig.assetId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Manage Templates
              <ExternalLink className="w-3 h-3 ml-1" />
            </a>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            disabled
          >
            Manage Templates
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        )}
      </div>
      <div className="space-y-3">
        {components.map(renderComponent)}
      </div>
    </div>
  )
}
