# Controller API

Purpose: External GUI to author content for schemas and push changes to live previews.

Interfaces
```ts
type ContentMap = Record<string, { default: string; [locale: string]: string }>;

type ControllerState = {
  schemaId: string;
  content: ContentMap;
  locale: string;
  tenant?: string;
  version?: string;
};
```

Preview Sync Protocol
- Channel: `postMessage` (if iframe) or shared Zustand store (same app host).
- Messages:
  - `content:update` { keys: string[] } // update provided keys
  - `content:replace` { content: ContentMap } // replace all
  - `schema:select` { schemaId: string }

Persistence
- Store versions in Supabase (table `content_sets`): id, schema_id, tenant, locale, data(jsonb), version, status(draft/published), created_at.

Auth & Roles
- Editor: edit content; Publisher: publish; Admin: manage roles.

Validation
- Ensure all schema `...Key` entries exist; warn on unused keys.

