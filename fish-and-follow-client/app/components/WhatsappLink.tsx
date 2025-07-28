import React from 'react'
import { Button } from "./ui/button";
import { MessageCircle } from 'lucide-react';

interface WhatsappLinkProps extends React.ComponentProps<typeof Button> {
  number: string;
  message?: string;
}

function WhatsappLink({ number, message, ...props }: WhatsappLinkProps) {
  const URIEncodedMessage = message ? encodeURIComponent(message) : '';
  return (
    <Button variant="outline" {...props} asChild>
      <div className='flex items-center justify-between'>
        <MessageCircle className="h-4 w-4" />
        <a href={`https://wa.me/${number}?text=${URIEncodedMessage}`}>Whatsapp</a>
      </div>
    </Button>
  )
}

export default WhatsappLink