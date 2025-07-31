import { useState } from "react";
import type { Route } from "./+types/login";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Login - Fish and Follow" },
    { name: "description", content: "Sign in to your account" },
  ];
}

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);

  const handleOktaLogin = async () => {
    setIsLoading(true);
    try {
      window.location.href = '/signin';
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center app-bg py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access the admin dashboard and manage contacts
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="rounded-md shadow-sm space-y-4">
            <div className="bg-white p-6 rounded-lg border">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                  <svg
                    className="h-6 w-6 text-blue-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Secure Login with Okta
                </h3>
                <p className="text-sm text-gray-500 mb-6">
                  Click below to authenticate using your Okta credentials
                </p>
                <button
                  onClick={handleOktaLogin}
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Signing in...
                    </>
                  ) : (
                    "Sign in with Okta"
                  )}
                </button>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="/"
              className="font-medium text-blue-600 hover:text-blue-500"
            >
              ← Back to contact form
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
