import { z } from 'zod';
export const schemas = {
  pages: {
    home: z.object({
      "hero": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "subheadline": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string()
      }),
      "features": z.object({
        "sectionLabel": z.string(),
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "stat": z.string(),
          "statLabel": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "howItWorks": z.object({
        "sectionLabel": z.string(),
        "headline": z.string(),
        "steps": z.array(z.object({
          "id": z.string(),
          "number": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "trustBar": z.object({
        "headline": z.string(),
        "companies": z.array(z.object({
          "id": z.string(),
          "name": z.string()
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "subheadline": z.string(),
        "buttonLabel": z.string(),
        "note": z.string()
      })
    }),
    register_placeholder: z.object({
      "heading": z.string(),
      "subtext": z.string(),
      "backLabel": z.string()
    }),
    auth: z.object({
      "login": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "submitLabel": z.string(),
        "switchPrompt": z.string(),
        "switchLabel": z.string()
      }),
      "signup": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "submitLabel": z.string(),
        "switchPrompt": z.string(),
        "switchLabel": z.string()
      }),
      "legal": z.string(),
      "forgotPassword": z.string(),
      "backToHome": z.string(),
      "passwordHint": z.string()
    }),
    dashboard: z.object({
      "greeting": z.string(),
      "subtitle": z.string(),
      "stats": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "value": z.string(),
        "change": z.string()
      })),
      "recentActivity": z.array(z.object({
        "id": z.string(),
        "app": z.string(),
        "action": z.string(),
        "time": z.string()
      })),
      "quickActions": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "icon": z.string()
      }))
    }),
    app_launcher: z.object({
      "placeholderHeading": z.string(),
      "placeholderBody": z.string(),
      "backLabel": z.string(),
      "launchLabel": z.string(),
      "tryLabel": z.string(),
      "samplePrompts": z.array(z.object({
        "id": z.string(),
        "text": z.string()
      })),
      "inputPlaceholder": z.string(),
      "outputPlaceholder": z.string(),
      "tipLabel": z.string(),
      "tipText": z.string()
    }),
    account: z.object({
      "profile": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "nameLabel": z.string(),
        "emailLabel": z.string(),
        "emailNote": z.string(),
        "saveLabel": z.string(),
        "savedLabel": z.string(),
        "avatarAlt": z.string()
      }),
      "password": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "currentLabel": z.string(),
        "newLabel": z.string(),
        "confirmLabel": z.string(),
        "hint": z.string(),
        "saveLabel": z.string(),
        "savedLabel": z.string()
      }),
      "team": z.object({
        "title": z.string(),
        "subtitle": z.string(),
        "inviteLabel": z.string(),
        "invitePlaceholder": z.string(),
        "inviteButton": z.string(),
        "membersHeading": z.string(),
        "roles": z.array(z.string()),
        "emptyState": z.string()
      }),
      "danger": z.object({
        "title": z.string(),
        "deleteLabel": z.string(),
        "deleteDescription": z.string(),
        "deleteConfirm": z.string()
      }),
      "nav": z.array(z.object({
        "id": z.string(),
        "label": z.string(),
        "icon": z.string()
      }))
    }),
    gridspace: z.object({
      "hero": z.object({
        "badge": z.string(),
        "headline": z.string(),
        "subheadline": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string(),
        "stat1Value": z.string(),
        "stat1Label": z.string(),
        "stat2Value": z.string(),
        "stat2Label": z.string(),
        "stat3Value": z.string(),
        "stat3Label": z.string()
      }),
      "valueProp": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "body": z.string(),
        "points": z.array(z.object({
          "id": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "howItWorks": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "steps": z.array(z.object({
          "id": z.string(),
          "number": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "participants": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "intro": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "type": z.string(),
          "label": z.string(),
          "tagline": z.string(),
          "description": z.string()
        }))
      }),
      "features": z.object({
        "eyebrow": z.string(),
        "headline": z.string(),
        "items": z.array(z.object({
          "id": z.string(),
          "icon": z.string(),
          "title": z.string(),
          "description": z.string()
        }))
      }),
      "cta": z.object({
        "headline": z.string(),
        "subheadline": z.string(),
        "ctaPrimary": z.string(),
        "ctaSecondary": z.string()
      })
    })
  },
  data: {
    ai_apps: z.array(z.object({
      "id": z.string(),
      "name": z.string(),
      "description": z.string(),
      "category": z.string(),
      "icon": z.string(),
      "color": z.string(),
      "href": z.string(),
      "badge": z.string(),
      "status": z.string()
    }))
  }
};
export type Schemas = typeof schemas;