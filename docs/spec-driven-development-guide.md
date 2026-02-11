# Spec-Driven Development Guide for UIDAM Project

## Table of Contents
1. [Answering Your Key Questions](#answering-your-key-questions)
2. [HLD vs LLD: When to Use Each](#hld-vs-lld-when-to-use-each)
3. [Document Lifecycle Management](#document-lifecycle-management)
4. [Maintaining Docs, Specs, and Code in Sync](#maintaining-docs-specs-and-code-in-sync)
5. [Applying Spec-Driven to Existing Projects (Brownfield)](#applying-spec-driven-to-existing-projects-brownfield)
6. [Best Practices from Industry](#best-practices-from-industry)

---

## Answering Your Key Questions

### Q1: Will the LLD should be present or not for new requirements?

**Short Answer:** It depends on the complexity and team structure.

**Detailed Answer:**

**When LLD is NEEDED:**
- Complex technical features with multiple integration points
- Security-critical implementations (authentication, authorization)
- Performance-sensitive components requiring algorithmic decisions
- Features requiring architectural changes or new patterns
- When junior developers will implement (need detailed guidance)

**When LLD can be SKIPPED:**
- Simple CRUD operations following established patterns
- UI-only changes (styling, layout adjustments)
- Configuration changes
- Bug fixes in well-understood code
- Small enhancements to existing features

**Spec-Driven Development Approach:**
```
Spec → Plan → Tasks → Implementation
```

This **replaces traditional HLD/LLD** with:
- **Spec (spec.md)**: WHAT and WHY (user-facing requirements)
- **Plan (plan.md)**: HOW (technical architecture, the "LLD")
- **Tasks (tasks.md)**: STEP-BY-STEP execution plan
- **Implementation Details**: Detailed code samples, algorithms (if needed)

**For UIDAM Project:**
```
✅ KEEP: spec.md, plan.md, tasks.md (living documents)
❌ SKIP: Traditional HLD/LLD PDFs that go stale
```

---

### Q2: When doing new features/enhancements, should I delete plan.md → task.md?

**Short Answer:** NO! Update them instead. They are living documents.

**Detailed Workflow:**

#### For New Features (Greenfield)
```bash
# 1. Create new feature branch
git checkout -b 002-password-reset-enhancement

# 2. Create NEW spec/plan/tasks
specs/002-password-reset-enhancement/
  ├── spec.md           # NEW - What/Why
  ├── plan.md           # NEW - How
  ├── tasks.md          # NEW - Execution
  ├── data-model.md     # NEW (if needed)
  └── contracts/        # NEW API contracts
```

#### For Enhancements to Existing Features (Brownfield)
```bash
# 1. Same feature branch or new enhancement branch
git checkout feature/001-password-recovery

# 2. UPDATE existing documents (don't delete!)
specs/001-password-recovery/
  ├── spec.md           # UPDATE - Add new user stories
  ├── plan.md           # UPDATE - Evolve architecture
  ├── tasks.md          # UPDATE - Add new tasks, mark completed ✅
  ├── CHANGELOG.md      # NEW - Track what changed and why
  └── implementation-history/
      ├── v1-plan.md    # ARCHIVE - Original plan
      └── v2-plan.md    # ARCHIVE - Updated plan
```

**Best Practice - Version Control Your Specs:**
```markdown
<!-- spec.md -->
# Password Recovery Feature

## Version History
- v2.0 (2026-01-29): Added SMS recovery option
- v1.0 (2026-01-15): Initial email-based recovery

## Current User Stories (v2.0)
...
```

**When to Archive vs Update:**
| Scenario | Action | Reason |
|----------|--------|--------|
| Add new user story | UPDATE spec.md | Accumulate requirements |
| Change tech stack | UPDATE plan.md + ARCHIVE old plan | Preserve decision history |
| Complete task | UPDATE tasks.md (✅ mark done) | Track progress |
| Pivot/rewrite | ARCHIVE entire spec/, CREATE new spec/ | Major direction change |

---

### Q3: Will Spec auto-update after implementation? Will it reflect current code status?

**Short Answer:** NO, specs don't auto-update. But you should keep them synchronized manually (or with AI assistance).

**The Reality:**
```
Traditional Problem:
Code ────────────────> (Implementation)
                       ↓
PRD/HLD/LLD ─────X────> (Gets outdated immediately)
```

**Spec-Driven Solution:**
```
Spec (Source of Truth)
  ↓ [AI Generation]
Code (Generated Output)
  ↓ [Feedback Loop]
Spec (Updated with learnings) ← Manual/AI-assisted update
```

**How to Keep Specs in Sync:**

#### Option 1: Manual Update (Post-Implementation)
```bash
# After completing implementation
npm run test  # Ensure all tests pass
git diff main  # Review code changes

# Update spec with actual implementation
vim specs/001-password-recovery/plan.md
# Add "Implementation Notes" section
# Document deviations from original plan
```

#### Option 2: AI-Assisted Sync (Recommended)
```bash
# Use Copilot to analyze code and update spec
# Prompt: "Review the implemented code in src/features/password-recovery/
# and update specs/001-password-recovery/plan.md with:
# 1. Actual API endpoints used
# 2. Actual error handling implemented
# 3. Deviations from original plan"
```

#### Option 3: Automated Spec Validation
```bash
# Create a validation script
npm run validate-spec

# This script compares:
# - API endpoints in plan.md vs actual routes in App.tsx
# - Data models in data-model.md vs TypeScript types
# - Test scenarios in plan.md vs actual test files
```

**Example Validation Script:**
```json
// package.json
{
  "scripts": {
    "validate-spec": "node scripts/validate-spec.js",
    "update-spec": "node scripts/update-spec-from-code.js"
  }
}
```

```javascript
// scripts/validate-spec.js
// Checks if implementation matches spec
// Reports drift: "Warning: plan.md mentions /api/reset but code uses /v1/users/self/recovery"
```

**Best Practice - Living Documentation:**
```markdown
<!-- plan.md -->
## Implementation Status

### Completed ✅
- Email-based password recovery
- Rate limiting (implemented with retry-after header)

### Deviations from Original Plan ⚠️
- Originally planned: `/api/password/reset`
- Actually implemented: `/v1/users/self/recovery/forgot-password`
- Reason: Alignment with existing API versioning strategy

### Pending ⏳
- SMS recovery (moved to Phase 2)
```

---

## HLD vs LLD: When to Use Each

### Traditional Approach
```
HLD (High-Level Design)
├── System architecture
├── Component diagrams
├── Technology stack
└── Non-functional requirements

LLD (Low-Level Design)
├── Class diagrams
├── Sequence diagrams
├── Database schemas
└── API contracts
```

### Spec-Driven Approach (Recommended)

**Map to Spec-Kit Structure:**
| Traditional | Spec-Driven | Purpose |
|-------------|-------------|---------|
| HLD | `spec.md` | WHAT users need, WHY it matters |
| LLD | `plan.md` | HOW to build it technically |
| Design Docs | `data-model.md`, `contracts/` | Detailed schemas and APIs |
| Implementation | `tasks.md` + actual code | Executable steps |

**For UIDAM Portal:**
```
specs/001-password-recovery/
  ├── spec.md              ← Replaces HLD (user stories, acceptance criteria)
  ├── plan.md              ← Replaces LLD (architecture, tech decisions)
  ├── data-model.md        ← Database schemas
  ├── contracts/           ← API specifications
  │   └── api.md
  ├── tasks.md             ← Implementation checklist
  └── context.md           ← Existing code context
```

**When to Create Full LLD (plan.md):**
- ✅ New features touching multiple modules
- ✅ API changes affecting clients
- ✅ Database schema migrations
- ✅ Security/performance-critical features
- ✅ Onboarding new team members

**When Lightweight Spec is Enough:**
- ✅ UI tweaks in isolated components
- ✅ Bug fixes with clear root cause
- ✅ Configuration updates
- ✅ Copy/text changes

---

## Document Lifecycle Management

### The Living Document Philosophy

**Core Principle:** Specs are not write-once artifacts. They evolve with your product.

```
Spec Lifecycle:
1. CREATE    → Initial feature spec
2. REFINE    → Clarify ambiguities before coding
3. IMPLEMENT → Code from spec
4. VALIDATE  → Verify implementation matches spec
5. UPDATE    → Reflect actual implementation
6. EXTEND    → Add enhancements over time
7. ARCHIVE   → Preserve history when pivoting
```

### Version Control Strategy

#### Branch-Based Spec Management
```bash
# Feature branch = Spec branch
git checkout -b feature/003-user-profile-edit

# Spec evolves WITH code in same branch
specs/003-user-profile-edit/
  spec.md    # Evolves in feature branch
  plan.md    # Evolves in feature branch

# Merge to main when BOTH spec and code are ready
git merge feature/003-user-profile-edit
```

#### Spec Versioning in File
```markdown
<!-- spec.md -->
# User Profile Edit Feature

**Version:** 2.1.0  
**Last Updated:** 2026-01-29  
**Status:** ✅ Implemented

## Changelog
### v2.1.0 (2026-01-29)
- Added avatar upload functionality
- Changed: Username now editable (was read-only in v2.0)

### v2.0.0 (2026-01-20)
- Migrated from class components to hooks
- Added form validation with Yup

### v1.0.0 (2025-12-15)
- Initial implementation
```

### When to Archive vs Update

| Scenario | Action | Example |
|----------|--------|---------|
| **Small enhancement** | Update spec in-place | Add new field to form |
| **Breaking change** | Update + add changelog entry | Change API endpoint structure |
| **Complete redesign** | Archive old spec, create new | Rewrite feature with different UX |
| **Deprecated feature** | Move to `specs/archived/` | Feature removed from product |

**Archive Structure:**
```
specs/
  ├── 001-password-recovery/       # Active
  ├── 002-user-management/         # Active
  └── archived/
      ├── 000-old-login-flow/      # Replaced by OAuth
      └── implementation-history/
          └── 001-password-recovery-v1.0/  # Old implementation
```

---

## Maintaining Docs, Specs, and Code in Sync

### The Synchronization Problem

**Classic Anti-Pattern:**
```
Week 1:  Spec ═══ Code    (Perfect sync)
Week 5:  Spec ════════     Code ════════  (Divergence begins)
Month 6: Spec (outdated) ✗ Code (actual truth) ✓
```

### Solution 1: Make Specs Part of CI/CD

**Add Spec Validation to PR Checks:**
```yaml
# .github/workflows/spec-validation.yml
name: Spec Validation
on: [pull_request]

jobs:
  validate-spec:
    runs-on: ubuntu-latest
    steps:
      - name: Check spec exists for feature
        run: |
          # Require spec.md update for any /src changes
          if git diff --name-only origin/main | grep "^src/features/"; then
            # Check if corresponding spec was updated
            git diff --name-only origin/main | grep "^specs/"
          fi
      
      - name: Validate API contracts
        run: npm run validate-contracts
```

**Example Contract Validator:**
```typescript
// scripts/validate-contracts.ts
// Reads contracts/api.md
// Parses all API routes from App.tsx, Express routes, etc.
// Fails if:
// - Code has routes not in spec
// - Spec has routes not in code
// - Request/response types don't match TypeScript interfaces
```

### Solution 2: Bidirectional Sync Workflow

```
┌─────────────┐         ┌──────────────┐
│  spec.md    │────────>│ Code         │  (Forward: Spec → Code)
│  plan.md    │   AI    │ Implementation
└─────────────┘         └──────────────┘
       ↑                       │
       │      Feedback Loop    │
       └───────────────────────┘
       Update spec with learnings
```

**Forward Sync (Spec → Code):**
1. Write `spec.md` with user stories
2. Generate `plan.md` with technical design
3. Create `tasks.md` with implementation steps
4. Implement code following tasks

**Backward Sync (Code → Spec):**
1. After implementation, review what changed
2. Update spec with:
   - Actual API endpoints used
   - Performance optimizations added
   - Edge cases discovered
   - Tech debt incurred

**Example Post-Implementation Update:**
```markdown
<!-- plan.md -->

## Implementation Notes (Added 2026-01-29)

### Deviations from Original Plan
- **API Endpoint Change:** Used `/v1/users/self/recovery/forgot-password` instead of `/api/password/reset` to align with existing versioning
- **CORS Workaround:** Added Vite proxy configuration to avoid CORS issues in development
- **Error Handling:** Added specific handling for empty API URL configuration (not in original plan)

### Lessons Learned
- Empty `REACT_APP_UIDAM_USER_MANAGEMENT_URL` causes silent failures → Added validation in userService
- Button loading state required inline content instead of conditional icon → Updated dialog implementation

### Tech Debt
- [ ] Refactor API URL validation to shared utility (tracked in #234)
- [ ] Add Cypress E2E test for full password recovery flow (Phase 3)
```

### Solution 3: Documentation-as-Code

**Treat Specs Like Tests:**
```javascript
// specs/001-password-recovery/__tests__/spec-compliance.test.ts
describe('Password Recovery Spec Compliance', () => {
  it('implements all user stories from spec.md', () => {
    const spec = parseSpecFile('specs/001-password-recovery/spec.md');
    const userStories = spec.getUserStories();
    
    userStories.forEach(story => {
      const testFile = findTestForStory(story.id);
      expect(testFile).toBeDefined(`Missing test for ${story.id}`);
    });
  });
  
  it('API matches contracts/api.md', () => {
    const contract = parseContract('specs/001-password-recovery/contracts/api.md');
    const routes = getAllRoutes(); // Parse from App.tsx
    
    expect(routes).toContainRoute(contract.endpoints.forgotPassword);
  });
});
```

### Solution 4: Automated Spec Generation (Reverse Engineering)

**For Existing Code Without Specs:**
```bash
# Generate spec from existing code
npx copilot-cli generate-spec \
  --source src/features/password-recovery \
  --output specs/001-password-recovery/spec.md
```

**AI Prompt for Reverse Engineering:**
```
Analyze the code in src/features/password-recovery/ and generate:
1. spec.md with user stories (infer from component behavior)
2. plan.md with technical architecture (document existing implementation)
3. data-model.md with TypeScript interfaces
4. contracts/api.md with API endpoints used

Mark sections with [INFERRED] where requirements were guessed from code.
```

---

## Applying Spec-Driven to Existing Projects (Brownfield)

### Challenge: You Have Code but No Specs

**Situation:**
```
uidam-portal/
  ├── src/
  │   ├── features/        # 20+ features implemented
  │   ├── components/      # Shared components
  │   └── services/        # API clients
  ├── docs/
  │   └── old-hld.pdf     # Outdated from 2024
  └── README.md            # Basic setup only
```

**Goal:** Introduce Spec-Driven Development without rewriting everything.

### Strategy 1: Gradual Migration (Recommended)

**Phase 1: Spec for NEW Features Only**
```bash
# Next new feature uses spec-driven approach
mkdir -p specs/008-multi-factor-auth
# Write spec.md BEFORE coding
# Follow spec → plan → tasks → implement workflow
```

**Phase 2: Document Critical Existing Features**
```bash
# Prioritize based on:
# 1. Features that change frequently
# 2. Features with bugs/tech debt
# 3. Features new team members work on

# Example: User management is critical
specs/existing/user-management/
  ├── spec.md              # Reverse-engineered from current code
  ├── plan.md              # Document current architecture
  ├── LEGACY-NOTES.md      # Known issues, tech debt
  └── migration-plan.md    # How to modernize
```

**Phase 3: Full Migration Over Time**
```bash
# As you touch code, add specs
specs/
  ├── 001-password-recovery/   ✅ New feature (spec-first)
  ├── 002-user-profile/        ✅ Enhanced existing (added spec)
  ├── 003-mfa/                 ✅ New feature (spec-first)
  └── existing/
      ├── authentication/      ⏳ Documented existing
      ├── user-management/     ⏳ Documented existing
      └── reporting/           ❌ Not yet documented
```

### Strategy 2: Spec-for-Changes Only

**Rule:** Any code change requires spec update (or creation).

**PR Template:**
```markdown
## Changes Made
- [ ] Code changes
- [ ] Tests updated
- [ ] **Spec updated** (`specs/.../spec.md` or created if missing)
- [ ] Plan reflects implementation (`specs/.../plan.md`)

## Spec Compliance
- Spec file: `specs/XXX-feature-name/spec.md`
- Changed sections: [list]
- New user stories: [if any]
```

**Example Workflow:**
```bash
# Bug fix in existing feature
git checkout -b fix/user-search-pagination

# 1. Create spec if doesn't exist
mkdir -p specs/existing/user-search
# Document CURRENT behavior in spec.md
# Document the BUG as deviation from expected behavior

# 2. Fix bug
vim src/features/user-management/UserSearch.tsx

# 3. Update spec to reflect fix
vim specs/existing/user-search/spec.md
# Mark bug as resolved

# 4. Add test that prevents regression
vim src/features/user-management/__tests__/UserSearch.test.tsx

# Commit: "fix: user search pagination + spec update"
```

### Strategy 3: Architecture Decision Records (ADRs)

**For Existing Systems:**
```bash
specs/adr/
  ├── 001-use-react-query.md
  ├── 002-vite-proxy-for-cors.md
  └── 003-material-ui-component-library.md
```

**ADR Template:**
```markdown
# ADR-002: Use Vite Proxy for CORS in Development

**Status:** Accepted  
**Date:** 2026-01-15  
**Context:** UIDAM User Management API on localhost:9090 doesn't have CORS headers

## Decision
Use Vite dev server proxy to forward `/v1` and `/v2` requests to backend.

## Consequences
**Positive:**
- No CORS errors in development
- Matches production behavior (same-origin requests)

**Negative:**
- Different URLs in dev vs production
- Requires empty `REACT_APP_UIDAM_USER_MANAGEMENT_URL` in config

## Implementation
See `vite.config.ts` proxy configuration.
```

### Strategy 4: Reverse Engineering Existing Code

**Use AI to Generate Specs from Code:**

**Step 1: Generate Initial Spec**
```bash
# AI Prompt:
# "Analyze src/features/user-management/ and generate specs/existing/user-management/spec.md
# Include:
# - User stories (infer from component behavior)
# - Acceptance criteria (infer from tests)
# - Current implementation (document as-is)
# Mark all inferred sections with [INFERRED FROM CODE]"
```

**Step 2: Human Review**
```bash
# Review generated spec
# Fix inaccuracies
# Add missing context (Why this feature exists?)
# Document known issues
```

**Step 3: Validate Spec Against Code**
```bash
# Run validation
npm run validate-spec -- specs/existing/user-management

# Should report:
# ✅ All API endpoints documented
# ✅ All components have user stories
# ⚠️  3 edge cases not covered in spec
```

---

## Best Practices from Industry

### 1. Spotify Model: Specs as Living Documents

**Key Insight:** Treat specs like code—version controlled, reviewed, iterated.

```bash
# Every spec change goes through PR review
git checkout -b update-spec/add-sms-recovery
vim specs/001-password-recovery/spec.md
git commit -m "spec: add SMS recovery user story"
# PR review focuses on SPEC quality before implementation
```

### 2. Amazon Working Backwards (6-Pager)

**Adaptation for Spec-Driven:**
```markdown
<!-- spec.md header -->

## Press Release (Future State)
**Headline:** UIDAM Users Can Now Reset Passwords via Email in Under 2 Minutes

**Problem:** Users forget passwords and must contact support, causing 2-3 day delays.

**Solution:** Self-service password recovery via email link.

**Customer Quote:** "I was locked out of my account at 10 PM. The recovery email arrived in seconds, and I was back in within a minute!"

<!-- Rest of spec follows -->
```

### 3. GitLab Handbook: Single Source of Truth

**Principle:** Everything in Git, nothing in external docs.

**UIDAM Application:**
```
❌ DON'T: Store specs in Confluence/SharePoint
✅ DO:    Store in `specs/` directory, version-controlled

❌ DON'T: Update specs in Google Docs
✅ DO:    Update in Git, review in PR

❌ DON'T: Keep separate "implementation log"
✅ DO:    Update spec.md with "Implementation Notes" section
```

### 4. Microsoft: Executable Specifications (BDD)

**Gherkin-Style User Stories:**
```markdown
<!-- spec.md -->

## User Story 7: Initiate Password Recovery

**As a** registered user  
**I want to** request a password reset email  
**So that** I can regain access to my account without contacting support

### Acceptance Criteria (Given/When/Then)

```gherkin
Given I am on the Security Settings page
And I am logged in
When I click "Reset Password"
And I confirm the action
Then a password reset email is sent to my registered email
And I see a success notification
And the email arrives within 1 minute
```

**Benefits:**
- Clear, testable criteria
- Can be automated with Cucumber/Cypress
- Non-technical stakeholders can validate

### 5. Atlassian: Decision Logs in Specs

**Every technical decision documented:**
```markdown
<!-- plan.md -->

## Technical Decisions

### Decision Log

#### TD-001: Use React Query for Server State
**Date:** 2026-01-15  
**Decided By:** @vpuvvada  
**Alternatives Considered:** Redux RTK Query, Apollo Client  
**Reason:** Already used in project, simpler for REST APIs  
**Trade-offs:** Less features than Apollo, but sufficient for our needs

#### TD-002: Disable Mutation Retry
**Date:** 2026-01-16  
**Decided By:** @vpuvvada  
**Reason:** Password recovery is not idempotent, retrying could send duplicate emails  
**Trade-offs:** User must manually retry on network failure
```

### 6. GitHub Flow: Branch = Feature = Spec

**Tight coupling:**
```bash
# Feature branch includes spec evolution
feature/001-password-recovery
  ├── specs/001-password-recovery/    # Spec files
  └── src/features/password-recovery/ # Code

# Both evolve together
# Merge to main when BOTH are ready
```

### 7. Basecamp Shape Up: Appetite-Driven Specs

**Include time/complexity appetite:**
```markdown
<!-- spec.md -->

## Project Appetite
**Time Budget:** 2 weeks (1 developer)  
**Scope:** Small batch  
**Risk:** Low (existing patterns)

## Must-Have (Core Scope)
- Email-based password recovery
- Rate limiting

## Nice-to-Have (Can Cut)
- SMS recovery (move to Phase 2)
- Password strength meter (separate feature)
```

---

## Recommended Workflow for UIDAM Project

### For New Features

```bash
# 1. Create spec FIRST
mkdir -p specs/009-profile-picture-upload
vim specs/009-profile-picture-upload/spec.md
# Write user stories, acceptance criteria

# 2. Review spec (team/stakeholder)
git add specs/009-profile-picture-upload/
git commit -m "spec: add profile picture upload feature"
# Create PR for spec review BEFORE coding

# 3. Once spec approved, create plan
vim specs/009-profile-picture-upload/plan.md
# Technical architecture, tech stack decisions

# 4. Generate tasks
vim specs/009-profile-picture-upload/tasks.md
# Break plan into executable tasks

# 5. Implement
# Follow tasks.md step-by-step
# Update tasks.md as you progress (mark ✅)

# 6. Validate implementation matches spec
npm run test
npm run validate-spec -- specs/009-profile-picture-upload

# 7. Update spec with learnings
vim specs/009-profile-picture-upload/plan.md
# Add "Implementation Notes" section

# 8. Merge when spec + code + tests all pass
```

### For Existing Features (Enhancements)

```bash
# 1. Check if spec exists
ls specs/001-password-recovery/

# 2. If exists, update it
vim specs/001-password-recovery/spec.md
# Add new user story: "US8: SMS Recovery"

vim specs/001-password-recovery/plan.md
# Add SMS integration details

# 3. Update tasks.md
# Add new tasks for SMS feature

# 4. Implement enhancement

# 5. Update spec with final implementation
```

### For Bug Fixes

```bash
# 1. Document bug in spec
vim specs/001-password-recovery/KNOWN-ISSUES.md
# Log the bug

# 2. Fix code

# 3. Update spec to reflect fix
vim specs/001-password-recovery/spec.md
# Add regression test scenario

# 4. Remove from KNOWN-ISSUES.md
```

---

## Tools and Automation

### Recommended Tools for Spec Management

1. **Spec Validation**
   ```bash
   npm install --save-dev @spec-kit/validator
   # Validates spec.md against templates
   # Checks for [NEEDS CLARIFICATION] markers
   # Ensures all user stories have acceptance criteria
   ```

2. **API Contract Testing**
   ```bash
   npm install --save-dev @pact-foundation/pact
   # Validates code matches contracts/api.md
   ```

3. **Spec Generation from Code**
   ```bash
   npm install --save-dev @ai-spec/generator
   # Reverse-engineers specs from existing code
   ```

4. **Spec Diff Checker**
   ```bash
   # In PR checks
   spec-diff origin/main..HEAD
   # Shows which specs changed
   # Warns if code changed but spec didn't
   ```

### VS Code Extensions

- **Markdown Preview Enhanced**: Preview spec.md with diagrams
- **Gherkin/Cucumber**: Syntax highlighting for acceptance criteria
- **Git Graph**: Visualize spec evolution over time
- **Copilot**: AI-assisted spec writing and validation

---

## Summary: Your Questions Answered

| Question | Answer | Best Practice |
|----------|--------|---------------|
| **LLD for new requirements?** | Use `plan.md` instead of traditional LLD. Skip for simple features. | Create plan.md for features with complexity, API changes, or security implications |
| **Delete plan.md/task.md for new features?** | NO! Update existing or create new in separate feature directory. | Version specs like code. Archive old specs if pivoting completely. |
| **Spec auto-update after implementation?** | NO. Manually update or use AI-assisted sync. | Add "Implementation Notes" section post-coding. Use validation scripts to catch drift. |
| **Maintain docs/spec/code sync?** | Make specs part of CI/CD. Validate in PRs. Treat specs as living documents. | Require spec updates in every PR. Use automated validation tools. |
| **Apply spec-driven to existing project?** | Gradual migration. Start with new features. Document existing features as you touch them. | Create specs for critical existing features. Use ADRs for architectural decisions. |

---

## Next Steps for UIDAM Project

1. ✅ **Adopt Spec-Kit structure** for all new features
   ```bash
   specs/
     ├── NNN-feature-name/
     │   ├── spec.md
     │   ├── plan.md
     │   └── tasks.md
   ```

2. ✅ **Update PR template** to require spec updates
3. ✅ **Add spec validation** to CI/CD pipeline
4. ✅ **Document 3-5 most critical existing features** (reverse-engineer specs)
5. ✅ **Create ADRs** for major architectural decisions already made
6. ⏳ **Train team** on spec-driven workflow (share this guide!)
7. ⏳ **Pilot with next feature** (full spec → plan → tasks → implement cycle)

---

## References

- [GitHub Spec-Kit](https://github.com/github/spec-kit)
- [Specification-Driven Development Methodology](https://github.com/github/spec-kit/blob/main/spec-driven.md)
- [Amazon Working Backwards](https://www.productplan.com/glossary/working-backward-amazon-method/)
- [GitLab Handbook](https://about.gitlab.com/handbook/)
- [Atlassian Decision Log Template](https://www.atlassian.com/software/confluence/templates/decision-log)
- [Microsoft BDD with Gherkin](https://cucumber.io/docs/gherkin/)
