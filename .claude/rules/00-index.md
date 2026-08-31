# Workspace Rules — Index

> Project-specific rules that extend global. Per
> `~/.claude/rules/common/rule-authoring-global-vs-project.md`.
> Workspace rules MAY raise thresholds (stricter) but MUST NOT
> lower them.

## Conventions

- One rule per file
- File name is kebab-case + descriptive
- Each rule cites the global rule it extends (if any) at the top
- Each rule includes a "Why this rule exists" section naming the
  specific project failure mode it prevents

## Index

| Rule | Extends global | Purpose |
| --- | --- | --- |
| `day-boundary.md` | `verify-before-claim.md` | Local calendar day is stored, not inferred |
| `rls-required.md` | security.md | RLS + db tests on every public table |
