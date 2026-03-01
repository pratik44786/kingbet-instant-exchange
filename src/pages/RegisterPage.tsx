import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown } from 'lucide-react';

interface RegisterPageProps {
  whatsappNumber?: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ 
  whatsappNumber = '919876543210' 
}) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleGetID = () => {
    setIsLoading(true);
    // Redirect to WhatsApp
    const waLink = `https://wa.me/${whatsappNumber}`;
    window.open(waLink, '_blank');
    setIsLoading(false);
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {/* Header with Crown Icon */}
      <header className="bg-gray-900 border-b border-gray-700 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-center gap-3">
            <Crown className="w-8 h-8 text-yellow-500" />
            <h1 className="text-3xl font-bold text-white tracking-wider">
              KINGBET EXCHANGE
            </h1>
            <Crown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex items-center justify-center px-4 py-16 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {/* Card Container */}
          <div className="bg-gray-800 rounded-lg shadow-2xl border border-gray-700 overflow-hidden">
            {/* Card Header */}
            <div className="bg-gradient-to-r from-yellow-600 to-yellow-500 px-6 py-8 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Welcome to KINGBET
              </h2>
              <p className="text-yellow-100 text-sm">
                Get your ID and start playing
              </p>
            </div>

            {/* Card Body */}
            <div className="px-6 py-8 space-y-6">
              {/* Information Text */}
              <div className="bg-gray-700 rounded-lg p-4 border-l-4 border-yellow-500">
                <p className="text-gray-200 text-sm leading-relaxed">
                  Click the button below to connect with us on WhatsApp. 
                  Our team will provide you with your unique ID and complete 
                  your registration.
                </p>
              </div>

              {/* Get ID Button */}
              <button
                onClick={handleGetID}
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg"
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-2 h-5 w-5 text-white"
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
                    Redirecting...
                  </>
                ) : (
                  <>
                    <svg
                      className="w-5 h-5"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.272-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-5.031 1.378l-.361.214-3.741-.982.998 3.645-.235.374a9.86 9.86 0 .019 12.402c1.02.895 2.212 1.59 3.5 2.055l.384.128 3.85.571-.971-3.718.231-.369a9.866 9.866 0 001.51-15.286" />
                    </svg>
                    Get ID on WhatsApp
                  </>
                )}
              </button>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-800 text-gray-400">or</span>
                </div>
              </div>

              {/* Back to Home Link */}
              <button
                onClick={handleBackToHome}
                className="w-full text-gray-300 hover:text-yellow-500 font-semibold py-2 px-4 rounded-lg border border-gray-600 hover:border-yellow-500 transition-all duration-200 flex items-center justify-center gap-2"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Back to Home
              </button>
            </div>

            {/* Card Footer */}
            <div className="bg-gray-900 px-6 py-4 border-t border-gray-700">
              <p className="text-gray-400 text-xs text-center">
                Need help? Chat with us on WhatsApp for instant support.
              </p>
            </div>
          </div>

          {/* Security Note */}
          <div className="mt-6 text-center">
            <p className="text-gray-500 text-xs">
              🔒 Your information is secure and encrypted
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default RegisterPage;
