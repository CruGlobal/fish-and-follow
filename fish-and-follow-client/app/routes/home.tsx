import type { Route } from "./+types/home";
import { ContactForm } from "../components/ContactForm";
import { useTranslation } from "react-i18next";

export function meta({}: Route.MetaArgs) {
  const { t } = useTranslation();
  return [
    { title: t('home.meta.title') },
    { name: "description", content: t('home.meta.description') },
  ];
}

export default function Home() {
  const { t } = useTranslation();
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="mx-auto max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {t('home.header.title')}
          </h1>
          <p className="mt-2 text-gray-600">
            {t('home.header.subtitle')}
          </p>
        </div>
        <ContactForm />
      </div>
    </div>
  );
}
