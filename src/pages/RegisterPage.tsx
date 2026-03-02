import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, MessageCircle, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const WHATSAPP_NUMBER = '919876543210';
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=Hello%20I%20want%20to%20get%20my%20Betting%20Exchange%20ID`;

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();

  const openWhatsApp = () => {
    window.open(WHATSAPP_URL, '_blank');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Crown className="w-10 h-10 text-yellow-500 drop-shadow-[0_0_10px_rgba(234,179,8,0.5)]" />
            <h1 className="text-4xl font-black text-white tracking-tighter italic">KINGBET</h1>
          </div>
        </div>

        <Card className="bg-gray-800/50 backdrop-blur-xl border-white/10 shadow-2xl">
          <CardHeader className="text-center pb-2">
            <CardTitle className="text-2xl font-bold text-white">Get Your Betting ID</CardTitle>
            <CardDescription className="text-gray-400">
              Contact support on WhatsApp to receive your login ID
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6 pt-4">
            <div className="bg-gray-700/50 rounded-xl p-4 border-l-4 border-yellow-500">
              <p className="text-gray-200 text-sm leading-relaxed">
                Click the button below to connect with us on WhatsApp. Our team will provide you with your unique ID and complete your registration.
              </p>
            </div>

            <Button
              onClick={openWhatsApp}
              className="w-full bg-green-600 hover:bg-green-700 h-12 text-white font-bold text-lg rounded-xl shadow-lg transition-all active:scale-[0.98] flex items-center gap-2"
            >
              <MessageCircle className="w-5 h-5" />
              Get ID on WhatsApp
            </Button>
          </CardContent>

          <CardFooter className="flex flex-col gap-4 pt-2">
            <div className="w-full flex items-center gap-2">
              <div className="flex-1 border-t border-gray-600" />
              <span className="text-gray-400 text-sm">or</span>
              <div className="flex-1 border-t border-gray-600" />
            </div>

            <Button
              variant="outline"
              onClick={() => navigate('/login')}
              className="w-full border-gray-600 text-gray-300 hover:text-yellow-500 hover:border-yellow-500"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Login
            </Button>
          </CardFooter>
        </Card>

        <p className="text-center mt-8 text-gray-600 text-xs tracking-widest uppercase">
          🔒 Your information is secure and encrypted
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
