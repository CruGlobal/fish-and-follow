import { useState } from "react";
import SubmitConfirmation from "./SubmitConfirmation";
import GenderDropdown from "app/components/GenderDropdown";
import YearDropdown from "app/components/YearDropdown";
import CampusDropdown from "app/components/CampusDropdown";
import { useTranslation, Trans } from "react-i18next";
import i18n from "~/i18n";

interface ContactFormData {
  firstName: string;
  lastName: string;
  phone: string;
  campus: string;
  major?: string;
  year: string;
  gender: string;
  message?: string;
}

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  phone: "",
  campus: "",
  major: "",
  year: "",
  gender: "",
  message: "",
};

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { t } = useTranslation();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Optional: Simulate network delay (remove this in production)
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const response = await fetch("http://localhost:3000/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          to: formData.phone,
          message: t("contactForm.success", { name: formData.firstName }),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || "SMS failed");
      }

      setSubmitted(true);
      setSuccessMessage(t("contactForm.success", { name: formData.firstName }));
    } catch (error) {
      console.error("Error submitting form:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              {t("contactForm.labels.firstName")}
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              {t("contactForm.labels.lastName")}
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phone"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.phone")}
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            required
            value={formData.phone}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="campus"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.campus")}
          </label>
          <CampusDropdown
            value={formData.campus}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, campus: value }))
            }
          />
        </div>

        <div>
          <label
            htmlFor="major"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.major")}
          </label>
          <input
            type="text"
            id="major"
            name="major"
            required
            value={formData.major}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.year")}
          </label>
          <YearDropdown
            value={formData.year}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, year: value }))
            }
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.gender")}
          </label>
          <GenderDropdown
            value={formData.gender}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value }))
            }
          />
        </div>

        <div>
          <label
            htmlFor="message"
            className="block text-sm font-medium text-gray-700"
          >
            {t("contactForm.labels.message")}
          </label>
          <textarea
            id="message"
            name="message"
            rows={4}
            value={formData.message}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 bg-white px-3 py-2"
            placeholder={t("contactForm.placeholders.message")}
          />
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
          >
            {isSubmitting
              ? t("contactForm.buttons.submitting")
              : t("contactForm.buttons.submit")}
          </button>
          {/* <button onClick={() => i18n.changeLanguage("pt")}>
            Switch to Portuguese
          </button> */}
        </div>
        {successMessage && (
          <div className="p-4 mb-4 bg-green-100 text-green-800 rounded">
            {successMessage}
          </div>
        )}
      </form>
    </div>
  );
}
