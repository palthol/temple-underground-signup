# Component SDK Spec

Goal: Allow base and proprietary components to integrate uniformly.

Contract
```ts
type ComponentProps<T> = {
  id: string; // field id
  value: T;
  onChange: (v: T) => void;
  onBlur?: () => void;
  disabled?: boolean;
  errors?: string[];
  meta?: { required?: boolean; placeholderKey?: string };
  content?: Record<string, string>; // content slots by key
};
```

Manifest
```ts
type ComponentManifest = {
  id: string; // e.g., "mui.text"
  version: string;
  displayName: string;
  valueSchema?: unknown; // zod/yup for component value
  propsSchema?: unknown; // zod/yup for props
  a11y?: { role?: string; describedBy?: string[] };
};
```

Registry
```ts
interface ComponentRegistry {
  register: (id: string, comp: React.ComponentType<any>, manifest: ComponentManifest) => void;
  get: (id: string) => { comp: React.ComponentType<any>; manifest: ComponentManifest } | undefined;
  has: (id: string) => boolean;
}
```

Lifecycle & Guidelines
- Stateless when possible; delegate state to RHF via props.
- Must forward `id`, `aria-*` attributes, and label association.
- Emit minimal re-renders; memoize; avoid heavy effects.
- Provide keyboard support and proper focus behavior.
- Support `disabled` and read-only modes.

Versioning
- Use semantic versioning; breaking prop changes require new major version.

