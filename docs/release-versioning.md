# Release & Versioning

Policy
- Semantic Versioning for SDK, components, and schema.
- Breaking schema changes require migration notes and codemods where possible.

Packages
- `@tu/core`: engine, schema, rules
- `@tu/sdk`: component SDK, registry
- `@tu/components-base`: base MUI set
- `@tu/components-proprietary`: closed-source packs
- `@tu/controller`: external GUI

Process
- PRs require changelog updates per package.
- Tag releases; generate release notes; publish to registry (private if needed).

Deprecation
- Support previous major for 1 minor version; provide migration guide.

