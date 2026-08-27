import { Link } from "react-router";
const footerLinks = [{
  label: 'Features',
  href: '#features'
}, {
  label: 'How It Works',
  href: '#how-it-works'
}, {
  label: 'Pricing',
  href: '#pricing'
}, {
  label: 'Privacy Policy',
  href: '/privacy'
}, {
  label: 'Terms of Service',
  href: '/terms'
}];
export default function Footer() {
  const year = new Date().getFullYear();
  return <footer className="relative bg-background border-t border-border/40 overflow-hidden">
      {/* Subtle network texture overlay */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{
      backgroundImage: `radial-gradient(circle at 1px 1px, hsl(var(--primary)) 1px, transparent 0)`,
      backgroundSize: '40px 40px'
    }} />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 items-start">
          {/* Brand */}
          <div className="flex flex-col gap-4">
            <Link to="/" className="inline-flex">
              <img src="/airo-assets/images/logo/horizontal/dark" alt="AlternMind" className="block h-auto max-h-9 w-auto max-w-full object-contain self-center" />
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              The AI platform built for forward-thinking teams. Launch powerful tools, streamline workflows, and work smarter.
            </p>
          </div>

          {/* Links */}
          <nav aria-label="Footer links" className="flex flex-col gap-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-1">
              Platform
            </p>
            {footerLinks.map(link => <Link key={link.label} to={link.href} className="text-sm text-foreground/60 hover:text-foreground transition-colors duration-200">
                {link.label}
              </Link>)}
          </nav>

          {/* CTA */}
          <div className="flex flex-col gap-4">
            <p className="text-sm font-medium text-foreground/80">
              Ready to get started?
            </p>
            <Link to="/register" className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 hover:-translate-y-0.5 ring-1 ring-primary/50 w-fit">
              Create Free Account
            </Link>
            <p className="text-xs text-muted-foreground">
              No credit card required.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            &copy; {year} AlternMind. All rights reserved.
          </p>
          <Link to="/register" className="text-xs text-primary hover:text-primary/80 transition-colors font-medium">
            Sign Up Free →
          </Link>
        </div>
      </div>
    </footer>;
}
