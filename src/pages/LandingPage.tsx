import {
  Crown,
  TrendingUp,
  Gamepad2,
  Shield,
  Zap,
  ArrowRight,
  Users,
  Lock,
  Globe,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-[#0b1221] text-white flex flex-col">
      
      {/* Top Bar */}
      <div className="bg-[#060d18] border-b border-white/5 py-2 px-4 flex justify-between text-xs text-gray-500">
        <div className="flex gap-4">
          <span>🔒 Secure Platform</span>
          <span>📞 24/7 Support</span>
        </div>
        <span>Points-Based Exchange • No Real Money</span>
      </div>

      {/* Header */}
      <header className="h-16 bg-[#0f1829] border-b border-white/5 flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Crown className="w-7 h-7 text-yellow-500" />
          <span className="text-xl font-black">
            KING<span className="text-yellow-500">BET</span>
          </span>
        </div>

        <div className="flex gap-3">
          <Link
            to="/login"
            className="px-4 py-2 text-sm text-gray-300 hover:text-yellow-500"
          >
            Login
          </Link>
          <Link
            to="/register"
            className="px-4 py-2 text-sm bg-yellow-600 hover:bg-yellow-700 rounded-lg font-bold"
          >
            Get ID
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-20">
        <div className="bg-yellow-500/10 border border-yellow-500/20 px-4 py-1 rounded-full text-yellow-400 text-xs font-bold mb-6 flex items-center gap-2">
          <Zap className="w-3 h-3" /> LIVE • 1000+ Markets
        </div>

        <h1 className="text-4xl md:text-5xl font-black leading-tight mb-6">
          India's Premier <br />
          <span className="text-yellow-500">Points Exchange</span>
        </h1>

        <p className="text-gray-400 max-w-xl mb-8">
          Trade live sports odds and enjoy casino games in a secure,
          points-based environment.
        </p>

        <div className="flex gap-4 flex-wrap justify-center">
          <Link
            to="/login"
            className="bg-yellow-600 hover:bg-yellow-700 px-8 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            <TrendingUp className="w-5 h-5" />
            Start Trading
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            to="/register"
            className="bg-[#1e273e] hover:bg-[#283550] border border-white/10 px-8 py-3 rounded-lg font-bold flex items-center gap-2"
          >
            <Gamepad2 className="w-5 h-5" />
            Get Your ID
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="px-6 pb-16 max-w-6xl mx-auto w-full">
        <h2 className="text-xl font-bold text-center mb-8">
          Why Choose <span className="text-yellow-500">KingBet</span>?
        </h2>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <Feature
            icon={<TrendingUp className="w-5 h-5 text-yellow-500" />}
            title="Live Odds"
            desc="Real-time back & lay trading with instant updates."
          />
          <Feature
            icon={<Shield className="w-5 h-5 text-yellow-500" />}
            title="Points System"
            desc="No real money involved. Admin-managed balances."
          />
          <Feature
            icon={<Lock className="w-5 h-5 text-yellow-500" />}
            title="Secure"
            desc="Enterprise-grade protection & safe login."
          />
          <Feature
            icon={<Users className="w-5 h-5 text-yellow-500" />}
            title="Hierarchy"
            desc="Super Admin → Admin → User system."
          />
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#060d18] border-t border-white/5 py-8 px-6">
        <div className="max-w-6xl mx-auto grid sm:grid-cols-3 gap-8 text-xs text-gray-500">
          
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Crown className="w-5 h-5 text-yellow-500" />
              <span className="font-bold">
                KING<span className="text-yellow-500">BET</span>
              </span>
            </div>
            <p>
              India's trusted points-based betting exchange platform.
            </p>
          </div>

          <div>
            <h4 className="text-gray-300 font-bold mb-3">Support</h4>
            <p className="flex items-center gap-2 mb-2">
              <Phone className="w-3 h-3 text-yellow-500" />
              +91 98765 43210
            </p>
            <p className="flex items-center gap-2 mb-2">
              <Mail className="w-3 h-3 text-yellow-500" />
              support@kingbet.com
            </p>
            <p className="flex items-center gap-2">
              <MapPin className="w-3 h-3 text-yellow-500" />
              24/7 Online
            </p>
          </div>

          <div>
            <h4 className="text-gray-300 font-bold mb-3">Links</h4>
            <div className="flex flex-col gap-2">
              <Link to="/login" className="hover:text-yellow-500">
                Login
              </Link>
              <Link to="/register" className="hover:text-yellow-500">
                Register
              </Link>
            </div>
          </div>
        </div>

        <div className="text-center text-[10px] text-gray-600 mt-6">
          © 2026 KingBet Exchange • Points Platform Only
        </div>
      </footer>
    </div>
  );
};

const Feature = ({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) => (
  <div className="bg-[#161d2f] border border-white/5 rounded-lg p-6 text-center">
    <div className="w-10 h-10 bg-yellow-500/10 rounded-lg flex items-center justify-center mx-auto mb-3">
      {icon}
    </div>
    <h3 className="font-bold text-gray-200 mb-1">{title}</h3>
    <p className="text-xs text-gray-500">{desc}</p>
  </div>
);

export default LandingPage;
