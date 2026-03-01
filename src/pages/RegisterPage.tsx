import { Crown } from 'lucide-react';

const RegisterPage = () => {
  // WhatsApp number
  const whatsappNumber = "919999999999"; // apna number yahan daal do
  const message = encodeURIComponent("Hi, I want to get my KINGBET ID");

  const handleGetID = () => {
    // WhatsApp API redirect
    window.open(`https://wa.me/${whatsappNumber}?text=${message}`, "_blank");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
      <div className="surface-card rounded-xl p-8 w-full max-w-sm text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Crown className="w-7 h-7 text-primary" />
          <span className="text-lg font-bold gold-text">KINGBET EXCHANGE</span>
        </div>
        <h2 className="text-xl font-bold text-foreground text-center mb-6">Get Your KINGBET ID</h2>

        <button
          onClick={handleGetID}
          className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          Get ID via WhatsApp
        </button>

        <p className="text-xs text-muted-foreground text-center mt-4">
          Already have an account? <a href="/login" className="text-primary hover:underline">Login</a>
        </p>
        <p className="text-xs text-muted-foreground text-center mt-2">
          <a href="/" className="hover:text-foreground">← Back to Home</a>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;;
