# Schema Reference

Purpose: Define a portable form schema to render steps, fields, validation, and content keys.

Top-Level
```ts
type FormSchema = {
  id: string;
  version: string;
  titleKey: string; // content key
  steps: Step[];
  rules?: GlobalRule[]; // cross-field or step rules
};
```

Steps
```ts
type Step = {
  id: string;
  titleKey: string;
  descriptionKey?: string;
  sections: Section[];
  nextCondition?: Condition; // allow branching
};
```

Sections and Fields
```ts
type Section = {
  id: string;
  titleKey?: string;
  fields: Field[];
};

type Field = {
  id: string; // data path in RHF, e.g., "participant.full_name"
  component: string; // registry id e.g., "mui.text"
  labelKey: string;
  helpKey?: string;
  required?: boolean;
  props?: Record<string, unknown>; // component props
  validate?: ValidationRule[]; // yup-like constraints
  visibleIf?: Condition; // conditional display
};
```

Validation
```ts
type ValidationRule =
  | { type: 'string'; min?: number; max?: number; patternKey?: string }
  | { type: 'email' }
  | { type: 'date'; minKey?: string; maxKey?: string }
  | { type: 'boolean'; mustBe: boolean }
  | { type: 'custom'; name: string; params?: unknown };
```

Conditions
```ts
type Condition =
  | { op: 'equals'; field: string; value: unknown }
  | { op: 'notEquals'; field: string; value: unknown }
  | { op: 'in'; field: string; values: unknown[] }
  | { op: 'and'; conditions: Condition[] }
  | { op: 'or'; conditions: Condition[] };
```

Content Keys
- Each `...Key` points into the content store.
- Supports locale overrides and tenant theming.

Example (excerpt)
```json
{
  "id": "waiver.v1",
  "version": "1.0.0",
  "titleKey": "form.title",
  "steps": [
    {
      "id": "personal",
      "titleKey": "step.personal",
      "sections": [
        {
          "id": "name",
          "fields": [
            { "id": "participant.full_name", "component": "mui.text", "labelKey": "full_name", "required": true },
            { "id": "participant.date_of_birth", "component": "mui.date", "labelKey": "dob", "required": true }
          ]
        }
      ]
    }
  ]
}
```

