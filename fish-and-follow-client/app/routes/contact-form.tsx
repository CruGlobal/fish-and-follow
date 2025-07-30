import type { Route } from "./+types/contact-form";
import { ContactForm } from "../components/ContactForm";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Contact Form - Fish and Follow" },
    { name: "description", content: "Submit your contact information" },
  ];
}

export default function ContactFormPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#CDF5FD] to-white py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Get in Touch</h1>
          <p className="mt-2 text-gray-600">We'd love to hear from you</p>
        </div>
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl shadow-sm border border-[#A0E9FF]/30 p-6">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
