import { Helmet } from '@dr.pogodin/react-helmet';
import { Link } from "react-router";
import { register_placeholder } from 'virtual:content';
export default function RegisterPage() {
  return <>
      <Helmet>
        <title>Sign Up — AlternMind</title>
        <meta name="description" content="Create your AlternMind account and start using AI tools for your team." />
        <link rel="canonical" href="https://alternmind.com/register" />
        <meta property="og:title" content="Sign Up — AlternMind" />
        <meta property="og:description" content="Create your AlternMind account and start using AI tools for your team." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://alternmind.com/register" />
        <meta name="twitter:card" content="summary_large_image" />
      </Helmet>
      <main className="min-h-screen bg-background flex items-center justify-center px-6">
        <div className="text-center flex flex-col items-center gap-4">
          <h1 className="text-2xl font-bold text-foreground">{register_placeholder.heading}</h1>
          <p className="text-muted-foreground">{register_placeholder.subtext}</p>
          <Link to="/" className="text-primary hover:text-primary/80 text-sm font-medium transition-colors">
            {register_placeholder.backLabel}
          </Link>
        </div>
      </main>
    </>;
}
