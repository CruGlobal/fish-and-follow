import { Link } from "react-router";

interface PageHeaderCenteredProps {
  title: string;
  description: string;
  showBackButton?: boolean;
  backButtonText?: string;
  backButtonHref?: string;
}

export function PageHeaderCentered({ 
  title, 
  description, 
  showBackButton = false, 
  backButtonText = "Back", 
  backButtonHref = "/" 
}: PageHeaderCenteredProps) {
  return (
    <>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          {description}
        </p>
      </div>

      {/* Navigation */}
      {showBackButton && (
        <div className="mb-8">
          <nav className="flex justify-center">
            <Link
              to={backButtonHref}
              className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              {backButtonText}
            </Link>
          </nav>
        </div>
      )}
    </>
  );
}
