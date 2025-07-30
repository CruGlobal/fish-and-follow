import { useState } from "react";
import GenderDropdown from "app/components/GenderDropdown";
import YearDropdown from "app/components/YearDropdown";
import { apiService } from "~/lib/api";
import type { ContactFormData, YearEnum, GenderEnum } from "~/types/contact";
import { Checkbox } from "./ui/checkbox";

const initialFormData: ContactFormData = {
  firstName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  campus: "",
  major: "",
  year: "1st_year" as YearEnum,
  gender: "male" as GenderEnum,
  isInterested: true,
  followUpStatusNumber: 1,
  notes: "",// Assuming orgId is part of the form data
  orgId: "", // Add orgId to the form data
};

export function ContactForm() {
  const [formData, setFormData] = useState<ContactFormData>(initialFormData);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);;

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
      // Submit contact to database
      await apiService.submitContact(formData);
      
      setSubmitted(true);
      setSuccessMessage(
        `Thanks ${formData.firstName}! Your contact information has been submitted successfully.`
      );
      
      // Reset form after successful submission
      setFormData(initialFormData);
    } catch (error) {
      console.error("Error submitting contact:", error);
      alert("Something went wrong while submitting your contact. Please try again.");
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
              First Name *
            </label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              required
              value={formData.firstName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
            />
          </div>
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Family Name *
            </label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              required
              value={formData.lastName}
              onChange={handleInputChange}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
            />
          </div>
        </div>

        <div>
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700"
          >
            WhatsApp Number *
          </label>
          <input
            type="tel"
            id="phoneNumber"
            name="phoneNumber"
            required
            value={formData.phoneNumber}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="campus"
            className="block text-sm font-medium text-gray-700"
          >
            Campus *
          </label>
          <input
            type="text"
            id="campus"
            name="campus"
            required
            value={formData.campus}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="major"
            className="block text-sm font-medium text-gray-700"
          >
            Major *
          </label>
          <input
            type="text"
            id="major"
            name="major"
            required
            value={formData.major}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="year"
            className="block text-sm font-medium text-gray-700"
          >
            Year *
          </label>
          <YearDropdown
            value={formData.year}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, year: value as YearEnum }))
            }
          />
        </div>

        <div>
          <label
            htmlFor="gender"
            className="block text-sm font-medium text-gray-700"
          >
            Gender *
          </label>
          <GenderDropdown
            value={formData.gender}
            onChange={(value) =>
              setFormData((prev) => ({ ...prev, gender: value as GenderEnum }))
            }
          />
        </div>

        <div>
          <label
            htmlFor="notes"
            className="block text-sm font-medium text-gray-700"
          >
            Do you have any questions for us?
          </label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-[var(--brand-primary)] focus:border-[var(--brand-primary)] sm:text-sm text-gray-900 bg-white px-3 py-2"
            placeholder="Ask anything..."
          />
        </div>

        {/* I agree to receive updates and notifications via WhatsApp */}
        <div className="flex items-center">
          <Checkbox
            checked={agreeToTerms}
            onCheckedChange={(checked) => setAgreeToTerms(checked as boolean)}
            className="data-[state=checked]:bg-[var(--brand-primary)] data-[state=checked]:border-[var(--brand-primary)]"
          />
          <label
            htmlFor="isInterested"
            className="ml-2 block text-sm text-gray-700"
          >
            I agree to receive updates and notifications
          </label>
        </div>

        <div>
          <button
            type="submit"
            disabled={isSubmitting || !agreeToTerms}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[var(--brand-primary)] hover:bg-[var(--brand-secondary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--brand-primary)] disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? "Submitting..." : "Submit Contact"}
          </button>
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
