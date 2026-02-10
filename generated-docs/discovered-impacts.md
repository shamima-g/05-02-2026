# Discovered Impacts

This file tracks cross-story impacts discovered during implementation.

**Last Updated:** 2026-02-09

---

*No active impacts. All previous impacts have been resolved.*

---

## Previous Impacts (Resolved)

- Story 2 impacts (route mismatch, auth check, cookie storage): Resolved during Story 2 implementation
- Story 3 Impact 3.1 (Missing API endpoints): False positive - endpoints already existed in OpenAPI spec. Added missing `/users/export` endpoint, `DeactivateUserRequest` schema with reason field, expanded `UserDetail` schema, and added department/role filter parameters.
- Story 4 Impact 4.1 (Effective Date & Reason fields): Resolved - OpenAPI spec updated to add `effectiveDate` (optional date) and `reason` (required string) fields to `PUT /users/{id}/roles` endpoint. Story 4 acceptance criteria now fully supported by API.
- Story 4 Impact 4.2 (Approval Authority Config tab): Resolved - Story 4 scoped to 2 tabs (Role Definitions, User Role Assignments). Approval Authority Config is handled by Story 5.

---

## Instructions

When processing impacts:
1. Read this file before implementing each story (REALIGN phase)
2. Check if any impacts affect the current story
3. Propose story revisions if needed
4. Remove impacts from this file after processing
