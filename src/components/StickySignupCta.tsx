import { Link, useLocation } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const HIDDEN_PATHS = ['/login', '/register', '/forgot-password'];

export default function StickySignupCta() {
  const { pathname } = useLocation();
  const { isAuthenticated } = useAuth();

  if (isAuthenticated || HIDDEN_PATHS.includes(pathname)) return null;

  return (
    <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur px-4 py-3 flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">Start from $10 USDT</p>
        <p className="text-[11px] text-muted-foreground leading-tight">Free account · no joining fee</p>
      </div>
      <Link to="/register" className="btn-gold whitespace-nowrap text-sm px-4 py-2.5">
        Sign up <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
