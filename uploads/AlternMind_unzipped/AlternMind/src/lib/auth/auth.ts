/**
 * BetterAuth Server Configuration
 *
 * Supports both Email/Password and OAuth authentication.
 * Enable/disable methods by uncommenting the relevant sections.
 *
 * Secrets (via getSecret from #airo/secrets):
 * - BETTER_AUTH_SECRET: Session encryption key (auto-generated during install)
 * - OAuth credentials (GOOGLE_CLIENT_ID, etc.) for social login
 *
 * CORS/Trusted Origins:
 * - Only trusts origins matching the server's hostname
 */

import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sendEmail } from '@/server/email';

import { db } from '@/server/db/client';
import { user, session, account, verification } from '@/server/db/schema';
import { getSecret } from '#airo/secrets';

// Lazy singleton — betterAuth() must NOT run at module init time.
//
// The BETTER_AUTH_SECRET is loaded from the alloc config at runtime, so the
// auth instance must be constructed after the secrets are available (i.e. on
// the first HTTP request, not at import time).
//
// Pattern mirrors how db/client.ts defers the actual MySQL connection — the
// pool object is safe to create at init, but anything that reads schema state
// or secrets must be deferred to request time.
let _auth: ReturnType<typeof betterAuth> | null = null;

export function getAuth() {
  if (_auth) return _auth;

  const authSecret = getSecret('BETTER_AUTH_SECRET');
  if (!authSecret || typeof authSecret !== 'string') {
    throw new Error('BETTER_AUTH_SECRET is not set or invalid — run requestSecrets() first');
  }

  if (!db) {
    throw new Error('Database not configured. Install the database skill first, then configure auth.');
  }

  const auth = betterAuth({
    // Schema passed explicitly — avoids BetterAuth's runtime schema inference.
    database: drizzleAdapter(db, {
      provider: 'mysql',
      schema: { user, session, account, verification },
    }),

    secret: authSecret,

    // Explicit base URL so BetterAuth can construct callback/redirect URLs correctly.
    baseURL: process.env.BETTER_AUTH_URL || process.env.AIRO_APP_URL || 'https://alternmind.com',

    // Protect admin status field from user input
    user: {
      additionalFields: {
        isAdmin: {
          type: 'boolean',
          defaultValue: false,
          input: false,  // Prevent clients from writing this field
          returned: true,
        },
      },
    },

    // CORS: Trusts .airoapp.ai subdomains and localhost by default.
    // If your app has a custom domain, add it here or set BETTER_AUTH_TRUSTED_ORIGINS.
    trustedOrigins: (request?: Request) => {
      // Always include static trusted origins so redirectTo URLs in password-reset
      // requests pass the isTrustedOrigin() check regardless of the request's Origin header.
      const staticOrigins = [
        'https://alternmind.com',
        'https://gridspace.alternmind.com',
        'http://localhost:20010',
        'http://localhost',
      ];

      if (!request) return staticOrigins;

      const origin = request.headers.get('origin');
      if (!origin) return staticOrigins;

      try {
        const originUrl = new URL(origin);
        const hostname = originUrl.hostname;

        // Trust all airoapp.ai subdomains
        if (hostname.endsWith('.airoapp.ai') || hostname.endsWith('.test-airoapp.ai')) {
          return [...staticOrigins, origin];
        }

        // Trust AlternMind custom domains including GridSpace subdomain
        if (hostname === 'alternmind.com' || hostname.endsWith('.alternmind.com')) {
          return [...staticOrigins, origin];
        }

        // Trust localhost for development
        if (hostname === 'localhost' || hostname === '127.0.0.1') {
          return [...staticOrigins, origin];
        }

        return staticOrigins;
      } catch {
        return staticOrigins;
      }
    },

    // In preview mode the site runs in an iframe embedded by the builder on a different
    // origin, so cookies need SameSite=None + Secure + Partitioned (CHIPS) for cross-site
    // access. In publish mode (standalone) we use the safer SameSite=Lax default.
    // disableCSRFCheck is set in both modes: the preview iframe suppresses the Origin header
    // on same-origin fetches, and the published custom domain is trusted by trustedOrigins.
    advanced: {
      disableCSRFCheck: true,
      ...(process.env.AIRO_PREVIEW === 'true' && {
        defaultCookieAttributes: {
          sameSite: 'none' as const,
          secure: true,
          partitioned: true,
        },
      }),
    },

    emailAndPassword: {
      enabled: true,
      resetPasswordTokenExpiresIn: 3600, // 1 hour
      sendResetPassword: async ({ user, url }) => {
        try {
          await sendEmail({
            fromName: 'AlternMind',
            to: user.email,
            subject: 'Reset your AlternMind password',
            text: `Hi ${user.name || 'there'},\n\nClick the link below to reset your password. This link expires in 1 hour.\n\n${url}\n\nIf you didn't request this, you can safely ignore this email.\n\n— The AlternMind Team`,
            html: `
              <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;background:#050D1A;color:#e2e8f0;border-radius:12px;">
                <h1 style="font-size:22px;font-weight:700;margin:0 0 8px;color:#ffffff;">Reset your password</h1>
                <p style="margin:0 0 24px;color:#94a3b8;font-size:15px;">Hi ${user.name || 'there'}, we received a request to reset your AlternMind password.</p>
                <a href="${url}" style="display:inline-block;padding:12px 28px;background:#00D4FF;color:#050D1A;font-weight:700;font-size:15px;border-radius:999px;text-decoration:none;">Reset password</a>
                <p style="margin:24px 0 0;color:#64748b;font-size:13px;">This link expires in 1 hour. If you didn't request a reset, you can safely ignore this email.</p>
              </div>
            `,
          });
        } catch (err) {
          console.error('auth.password.reset.email_failed', err);
        }
      },
    },

    // socialProviders: {
    //   google: {
    //     clientId: getSecret('GOOGLE_CLIENT_ID') as string,
    //     clientSecret: getSecret('GOOGLE_CLIENT_SECRET') as string,
    //   },
    //   github: {
    //     clientId: getSecret('GITHUB_CLIENT_ID') as string,
    //     clientSecret: getSecret('GITHUB_CLIENT_SECRET') as string,
    //   },
    // },
  });

  _auth = auth as unknown as ReturnType<typeof betterAuth>;
  return auth;
}

export type Session = ReturnType<typeof getAuth>['$Infer']['Session'];
export type User = ReturnType<typeof getAuth>['$Infer']['Session']['user'];
