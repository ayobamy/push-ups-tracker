# ADR 0003 — Honor system, no camera

## Status

Accepted. 2026-08-31.

## Context

Commercial apps (Lockin, Pushup Social) sell camera counting.
Ahmed asked for a simple check-in for a friend group. The agent
contract forbids calling an LLM API unless asked.

## Decision

v1 is self-report. Accountability is the today board and the
365 leaderboard, not computer vision.

## Consequences

- People can lie. That is accepted for this cohort.
- No special-category biometric processing.
- Camera counting, if ever wanted, is a new ADR and a new
  privacy review. It is not a flag on this schema.
