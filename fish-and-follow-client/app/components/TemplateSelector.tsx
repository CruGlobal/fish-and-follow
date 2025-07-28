import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { apiService } from '~/lib/api'
import type { TemplateItem, TemplateComponent, BulkTemplateMessageRequest, BulkTemplateMessageResponse } from '~/lib/api'
import TemplateParameterMapper from './TemplateParameterMapper'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select"
import { Button } from './ui/button'
import { Card, CardContent } from './ui/card'
import { LoadingState } from './ui/LoadingState'
import { ErrorAlert } from './ui/ErrorAlert'
import { TemplateInfoCard } from './ui/TemplateInfoCard'
import { TemplatePreview } from './ui/TemplatePreview'
import { SuccessMessage } from './ui/SuccessMessage'

interface ContactItem {
  name: string;
  key: string;
}

interface TemplateSelectorProps {
  selectedContacts?: ContactItem[];
}

function TemplateSelector({ selectedContacts = [] }: TemplateSelectorProps) {
  const [templates, setTemplates] = useState<TemplateItem[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<TemplateItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sendResult, setSendResult] = useState<BulkTemplateMessageResponse | null>(null)
  const [parameterMapping, setParameterMapping] = useState<string[]>([])
  const [templateBodyText, setTemplateBodyText] = useState('')
  const [facebookConfig, setFacebookConfig] = useState<{businessId: string; assetId: string} | null>(null)

  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true)
        const response = await apiService.getTemplates()
        console.log("API response:", response)
        // Handle the nested structure: response.templates
        const templatesData = response?.templates || []
        setTemplates(templatesData)
        // Store facebook config from response
        if (response?.facebookConfig) {
          setFacebookConfig(response.facebookConfig)
        }
      } catch (err) {
        console.error("Failed to fetch templates:", err)
        setError("Failed to load templates")
      } finally {
        setLoading(false)
      }
    }

    fetchTemplates()
  }, [])

  const handleTemplateSelect = (templateName: string) => {
    console.log("Selected template:", templateName)
    const template = templates.find(t => t.name === templateName)
    setSelectedTemplate(template || null)
    
    // Extract body text for parameter mapping
    if (template) {
      const bodyComponent = template.components.find(c => c.type === 'BODY')
      setTemplateBodyText(bodyComponent?.text || '')
    } else {
      setTemplateBodyText('')
    }
    
    // Reset parameter mapping when template changes
    setParameterMapping([])
  }

  const handleSendMessage = async () => {
    if (!selectedTemplate) {
      console.error("No template selected")
      return
    }

    if (selectedContacts.length === 0) {
      console.error("No contacts selected")
      setError("Please select at least one contact before sending the message")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      const contactIds = selectedContacts.map(contact => contact.key)
      
      const request: BulkTemplateMessageRequest = {
        contactIds,
        template: selectedTemplate.name,
        language: selectedTemplate.language,
        // Only request minimal fields since we're just sending messages
        fields: ['id', 'first_name', 'last_name'],
        // Include parameter mapping if configured
        parameterMapping: parameterMapping.filter(field => field !== ''), // Remove empty mappings
      }

      const result = await apiService.sendBulkTemplateMessage(request)
      
      setSendResult(result)
      setIsSubmitted(true)
    } catch (err) {
      console.error("Failed to send message:", err)
      setError("Failed to send template message. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSendAnother = () => {
    setIsSubmitted(false)
    setSelectedTemplate(null)
    setSendResult(null)
    setError(null)
    setParameterMapping([])
    setTemplateBodyText('')
  }

  if (loading) {
    return <LoadingState />
  }

  if (error) {
    return <ErrorAlert message={error} className="py-4" />
  }

  return (
    <div className="py-4">
      <div className='pb-4'>
        <label htmlFor="template-select" className="block text-sm font-medium text-gray-700 mb-2">
          Select WhatsApp Template
        </label>
        {selectedContacts.length > 0 && (
          <p className="text-sm text-gray-600 mb-2">
            Will send to {selectedContacts.length} selected contact{selectedContacts.length !== 1 ? 's' : ''}
          </p>
        )}
        <Select value={selectedTemplate?.name || ''} onValueChange={handleTemplateSelect}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select Template" />
          </SelectTrigger>
          <SelectContent id="template-select">
            {templates.map((template) => (
              <SelectItem key={template.id} value={template.name}>
                {template.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedTemplate && !isSubmitted && (
        <Card className="bg-gray-50">
          <CardContent className="p-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">WhatsApp Template Preview</h3>
            
            <div className="space-y-4">
              {/* Template Info */}
              <TemplateInfoCard template={selectedTemplate} />

              {/* Template Preview */}
              <TemplatePreview 
                components={selectedTemplate.components} 
                facebookConfig={facebookConfig || undefined}
              />

              {/* Template Parameter Mapping */}
              {templateBodyText && (
                <TemplateParameterMapper
                  templateText={templateBodyText}
                  onParameterMappingChange={setParameterMapping}
                />
              )}
            </div>
            
            <div className="flex justify-center mt-6">
              <Button 
                className="w-48" 
                onClick={handleSendMessage}
                disabled={isSubmitting || selectedContacts.length === 0}
              >
                {isSubmitting ? "Sending..." : `Send to ${selectedContacts.length} Contact${selectedContacts.length !== 1 ? 's' : ''}`}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Success Message */}
      {isSubmitted && sendResult && (
        <SuccessMessage
          title="Bulk Message Sent!"
          message={`WhatsApp template "${selectedTemplate?.name}" sent to selected contacts.`}
          results={sendResult.data}
          onSendAnother={handleSendAnother}
          onBackToContacts={() => window.location.href = '/contacts'}
        />
      )}
    </div>
  )
}

export default TemplateSelector