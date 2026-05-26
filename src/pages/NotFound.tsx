import { Link } from 'react-router-dom';
import Logo from '@/components/layout/Logo';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 text-center">
      <div>
        <Logo className="h-14 w-14 mx-auto mb-6" />
        <h1 className="font-display text-7xl font-extrabold text-gradient-gold">404</h1>
        <p className="mt-3 text-muted-foreground">This page doesn't exist or has moved.</p>
        <Link to="/" className="btn-gold mt-6 inline-flex">Back to home</Link>
      </div>
    </div>
  );
}
