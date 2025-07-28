import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './card'
import { Button } from './button'

interface SuccessMessageProps {
  title: string
  message: string
  results?: {
    totalRequested: number
    totalSent: number
    totalFailed: number
    totalFound: number
  }
  onSendAnother?: () => void
  onBackToContacts?: () => void
}

export function SuccessMessage({ 
  title, 
  message, 
  results, 
  onSendAnother, 
  onBackToContacts 
}: SuccessMessageProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="p-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        
        <h3 className="text-lg font-semibold text-green-900 mb-2">{title}</h3>
        <p className="text-green-700 mb-4">{message}</p>
        
        {/* Results Summary */}
        {results && (
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="font-medium text-gray-900">{results.totalRequested}</div>
                  <div className="text-gray-600">Requested</div>
                </div>
                <div>
                  <div className="font-medium text-green-600">{results.totalSent}</div>
                  <div className="text-gray-600">Sent</div>
                </div>
                <div>
                  <div className="font-medium text-red-600">{results.totalFailed}</div>
                  <div className="text-gray-600">Failed</div>
                </div>
                <div>
                  <div className="font-medium text-blue-600">{results.totalFound}</div>
                  <div className="text-gray-600">Found</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex justify-center gap-3">
          {onSendAnother && (
            <Button onClick={onSendAnother} className="bg-green-600 hover:bg-green-700">
              Send Another Template
            </Button>
          )}
          {onBackToContacts && (
            <Button variant="outline" onClick={onBackToContacts} className="border-green-300 text-green-700 hover:bg-green-100">
              Back to Contacts
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
