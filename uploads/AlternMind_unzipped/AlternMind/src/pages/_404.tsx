import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from 'react-router';
import { ArrowLeft, Home } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <Helmet>
        <title>Page Not Found — AlternMind</title>
        <meta name="description" content="The page you're looking for doesn't exist or has been moved." />
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>

      <main className="min-h-screen flex items-center justify-center bg-background px-6">
        <div className="max-w-md w-full text-center flex flex-col items-center gap-8">
          <div className="flex flex-col items-center gap-3">
            <p className="text-8xl font-black text-primary leading-none">404</p>
            <h1 className="text-2xl font-bold text-foreground">Page not found</h1>
            <p className="text-muted-foreground leading-relaxed">
              Sorry, the page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              <Home size={15} />
              Go home
            </Link>
            <button
              onClick={() => window.history.back()}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-border text-sm font-semibold text-foreground hover:bg-muted/50 hover:border-primary/40 transition-all"
            >
              <ArrowLeft size={15} />
              Go back
            </button>
          </div>
        </div>
      </main>
    </>
  );
}
