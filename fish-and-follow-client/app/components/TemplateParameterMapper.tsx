import { useEffect, useState } from 'react';
import { apiService, type ContactField } from '~/lib/api';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

interface TemplateParameterMapperProps {
  templateText: string;
  onParameterMappingChange: (mapping: string[]) => void;
}

interface TemplateParameter {
  number: number;
  placeholder: string;
}

function TemplateParameterMapper({ templateText, onParameterMappingChange }: TemplateParameterMapperProps) {
  const [contactFields, setContactFields] = useState<ContactField[]>([]);
  const [parameters, setParameters] = useState<TemplateParameter[]>([]);
  const [parameterMapping, setParameterMapping] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Extract parameters from template text
  useEffect(() => {
    const extractParameters = (text: string): TemplateParameter[] => {
      const parameterPattern = /\{\{(\d+)\}\}/g;
      const foundParameters: TemplateParameter[] = [];
      let match;

      while ((match = parameterPattern.exec(text)) !== null) {
        const paramNumber = parseInt(match[1], 10);
        if (!foundParameters.some(p => p.number === paramNumber)) {
          foundParameters.push({
            number: paramNumber,
            placeholder: match[0]
          });
        }
      }

      return foundParameters.sort((a, b) => a.number - b.number);
    };

    const extractedParams = extractParameters(templateText);
    setParameters(extractedParams);
    
    // Initialize parameter mapping array with empty strings
    const newMapping = new Array(extractedParams.length).fill('');
    setParameterMapping(newMapping);
    onParameterMappingChange(newMapping);
  }, [templateText, onParameterMappingChange]);

  // Load contact fields
  useEffect(() => {
    const loadContactFields = async () => {
      try {
        setLoading(true);
        setError(null);
        const fields = await apiService.getContactFields();
        setContactFields(fields);
      } catch (err) {
        console.error('Failed to load contact fields:', err);
        setError('Failed to load contact fields');
      } finally {
        setLoading(false);
      }
    };

    loadContactFields();
  }, []);

  const handleParameterMappingChange = (parameterIndex: number, fieldKey: string) => {
    const newMapping = [...parameterMapping];
    newMapping[parameterIndex] = fieldKey;
    setParameterMapping(newMapping);
    onParameterMappingChange(newMapping);
  };

  const renderTemplatePreview = () => {
    let previewText = templateText;
    
    parameters.forEach((param, index) => {
      const fieldKey = parameterMapping[index];
      const field = contactFields.find(f => f.key === fieldKey);
      const replacement = field ? `[${field.label}]` : param.placeholder;
      previewText = previewText.replace(param.placeholder, replacement);
    });

    return previewText;
  };

  if (loading) {
    return (
      <div className="py-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-2">
            <div className="h-8 bg-gray-200 rounded"></div>
            <div className="h-8 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="text-red-800 text-sm">{error}</div>
        </div>
      </div>
    );
  }

  if (parameters.length === 0) {
    return (
      <div className="py-4">
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
          <div className="text-blue-800 text-sm">
            This template doesn't have any parameters to configure.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="py-4 space-y-4">
      <div>
        <h4 className="text-sm font-semibold text-gray-900 mb-2">Template Parameters</h4>
        <p className="text-xs text-gray-600 mb-4">
          Map each parameter to a contact field. The values will be automatically filled when sending messages.
        </p>
      </div>

      <div className="space-y-3">
        {parameters.map((param, index) => {
          const selectedField = contactFields.find(f => f.key === parameterMapping[index]);
          
          return (
            <div key={param.number} className="flex items-center space-x-3">
              <div className="flex-shrink-0 w-16">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {param.placeholder}
                </span>
              </div>
              <div className="flex-1">
                <Select 
                  value={parameterMapping[index] || ''} 
                  onValueChange={(value) => handleParameterMappingChange(index, value)}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select contact field" />
                  </SelectTrigger>
                  <SelectContent>
                    {contactFields.map((field) => (
                      <SelectItem key={field.key} value={field.key}>
                        {field.label} ({field.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {selectedField && (
                <div className="flex-shrink-0 text-xs text-gray-500">
                  → {selectedField.label}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-6">
        <h5 className="text-sm font-medium text-gray-900 mb-2">Preview with Field Names</h5>
        <div className="bg-gray-50 border border-gray-200 rounded-md p-3">
          <div className="text-sm text-gray-800 whitespace-pre-wrap">
            {renderTemplatePreview()}
          </div>
        </div>
      </div>
    </div>
  );
}

export default TemplateParameterMapper;
