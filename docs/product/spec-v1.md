# TermsOfUs V1 Product Spec

This is the product intent record. The implementation in `src/` is the source of truth for current behavior.

For implementation, agents should first read:

- AGENTS.md

- docs/product/v1-summary.md


Do not try to implement the full spec in one pass.

# Product Specification - Interactive Relationship Buffet Web App
1. Overview
This document specifies a multilingual web application inspired by the Relationship Anarchy Smorgasbord PDF. The application allows a person to review a configurable set of relationship-related items and assign each item exactly one state:
Not selected
Already present
I'd like that
To discuss
Not for me
The primary use case for V1 is personal reflection in the context of a current or emerging relationship. The application must work without a backend and must persist the full selection in the URL so it can be shared easily.
A future version may allow two people to compare their selections, but that is explicitly out of scope for V1.
2. Product Goals
Primary goal
Help a person reflect on what is already present in a relationship, what they want, and what they want to avoid.
Secondary goals
Make the experience visual and engaging, while staying reasonably faithful to the spirit of the original PDF
Make selections shareable without requiring accounts or server-side storage
Support both desktop and mobile use comfortably
Build on a stable data model that can later support comparison between two people
Support multiple languages from the start
3. Non-goals for V1
The following are explicitly out of scope for V1:
User accounts
Backend persistence
Anonymous link storage on a server
Real-time collaboration
Two-person comparison workflows
Compatibility scores
Admin UI for editing the content model
In-app creation of custom categories or items
PDF export
Advanced animations or force-directed visualizations
4. Core Product Principles
Config-driven: Content must come from versioned JSON files, not hardcoded UI strings.
One item, one state: An item can only be in one state at a time.
URL as source of truth for sharing: the current selection must be recoverable from the URL alone.
Multilingual by design: Text, labels, metadata, and content must support multiple locales cleanly.
Desktop and mobile parity: The same underlying data and state must power both views.
Accessible interaction: The experience must not rely on color alone.
5. User Model
Primary user
A person who wants to think through relationship preferences, boundaries, and existing dynamics.
Context of use
Personal reflection
Preparing for a discussion with a partner
Revisiting a relationship framework together later
Sharing a selection URL with someone else
6. Domain Definitions
Item
The smallest selectable unit in the application. An item corresponds to a word or short phrase such as "Video", "SMS", or "Sleeping together".
Category
A group of related items, such as communication methods, emotional support, physical intimacy, or domesticity.
State
The status assigned to an item by the user.
Supported states in the current code:
none - not selected
present - this is already present in the relationship
important - this matters to me
discuss - this needs discussion
no - this is not for me
Schema version
A version number attached to the content model. This ensures URL-encoded selections can be interpreted correctly even if the content evolves.
Locale
The language variant currently displayed, such as en, fr, or de.
7. Functional Scope - V1
7.1 Content loading
The application must load its content from versioned locale-aware JSON files.
The initial content should stay as close as reasonably possible to the source PDF, with minimal cleanup only where needed for consistency or usability.
7.2 Item selection
The user must be able to:
Choose one state for each item
Apply a state by clicking or tapping the relevant item state button
Remove a state by applying the same state to an already-selected item, which returns it to none
7.3 Visual presentation
The application must provide:
The current primary UI is a responsive structured category-card view.
The repository also contains Sunburst visual map components, but they are not wired into the primary app.
7.4 URL persistence
The application must:
Encode the entire selection into the URL
Restore the selection from the URL on page load
Update the URL immediately when selections change, without full page reload
7.5 Sharing
The application must allow the user to:
Copy the current URL easily
Share a link that reconstructs the same selection state on another device
7.6 Reset
The application must provide a way to clear all selections and return to a blank state.
7.7 Summary
The application should show a lightweight summary such as:
Number of items marked as present
Number of items marked as important
Number of items marked as discuss
Number of items marked as no
Optional category-level summaries may be added if they do not clutter the experience.
8. Multilingual Requirements
Multilingual support is a hard requirement from V1.
8.1 Localized UI
All interface text must be localizable, including:
Palette labels
Buttons
Empty states
Help text
Tooltips
Accessibility labels
Error messages
Summary text
8.2 Localized content
The item and category content must also be localizable.
This means the application must not treat the source content as a single monolingual blob. Each category and item must have stable IDs, while labels are provided per locale.
8.3 Language switching
The application must support an explicit language selector.
Changing the language must:
Preserve the current selection
Preserve the current schema version
Preserve the current view if possible
Update the URL to reflect the selected locale
8.4 Locale in URL
The URL may include the locale explicitly with a `lang` query parameter, for example:
?lang=fr
?lang=en
The default English locale may omit `lang`.
8.5 Fallback strategy
If a translation is missing:
The application should fall back to the default locale
Missing translations should be logged in development
Missing translations must never crash the app
8.6 Data model for multilingual content
Stable item and category IDs must be shared across locales. Only labels and descriptions vary by locale.
9. UX Requirements
9.1 Palette interaction
The current primary UI exposes state buttons on each item row for the four selected states:
Not selected
Already present
I'd like that
To discuss
Not for me
Recommended visual style:
Not selected: white or neutral
Important: highlighter yellow
Present: highlighter green
No: highlighter pink
Discuss: neutral accent
If a future global palette is reintroduced, the active palette state must be clearly visible.
9.2 Desktop view
The desktop view should stay visually faithful to the spirit of the original PDF:
Bubble-based layout
Concentric organization or similar radial grouping
Category-level visual grouping
Direct interaction with items inside each bubble
The desktop view does not need to replicate the original PDF pixel for pixel. It should preserve the visual logic while remaining usable and maintainable.
9.3 Mobile view
The mobile view should prioritize usability over visual fidelity.
Recommended structure:
Categories as cards or accordions
Items as chips, pills, or tappable inline tokens
Palette fixed or sticky in a convenient position
Clear touch targets
The mobile layout should not require pinch zoom to function comfortably.
9.4 Feedback
Interactions should provide immediate visual feedback.
Examples:
Item color/background changes after selection
Icon or marker appears on selected items
URL updates silently
Summary counts update instantly
9.5 Search and filtering
Optional for V1 but recommended if cost is low:
Search items by text
Filter to show only selected items
Filter by current state
These features should not block the initial release.
10. Accessibility Requirements
Accessibility is required from V1.
10.1 Do not rely on color alone
Each state must be distinguishable using more than color. Combine color with at least one of:
icon
border treatment
badge
textual label
pattern or underline style
10.2 Keyboard support
Users must be able to:
Navigate item state controls with keyboard
Apply a state without a mouse
See a clear visible focus indicator
10.3 Screen reader support
Interactive elements must have meaningful labels, such as:
item label
current state
available action if activated
Example:
"Video calls, current state: Already present. Activate to clear state."
10.4 Touch accessibility
Touch targets must be large enough to use comfortably on mobile.
10.5 Contrast and readability
The selected color palette may be bright and highlighter-like, but text contrast must remain readable.
11. Data Model
The application should be built around a versioned schema and a separate selection state.
11.1 Schema shape
Example TypeScript model:
11.2 Selection shape
11.3 Stable IDs
Every category and item must have a stable ID that does not change across locales.
IDs should be:
lowercase
ASCII-safe
deterministic
unique within the schema
12. Content Storage Strategy
Use a JSON-based content source.
Two valid approaches:
Option A - Single multilingual schema file
One file contains all locales for all categories and items.
Pros:
easy to compare locales
one source of truth
easier schema versioning
Cons:
larger file
translations and content changes are tightly coupled
Option B - Base schema plus locale dictionaries
A structural schema defines IDs and layout, and separate locale files define translated labels.
Pros:
cleaner i18n separation
easier translator workflow
easier lazy loading per locale
Cons:
slightly more moving parts
Recommended approach: Option B.
Suggested files:
schema.v1.json
locales/fr.json
locales/en.json
locales/de.json
13. URL Model
The URL must encode at least:
locale
selection state
13.1 Recommended URL format
Example:
/?lang=fr#encodedPayload
/TermsOfUs/?lang=fr#encodedPayload
Where:
lang=fr is the optional locale query parameter
the hash is the encoded selection payload
the hosting base path, such as /TermsOfUs/, is preserved when present
13.2 State encoding strategy
Each item has four selected states plus the implicit unanswered state. Only selected items are encoded in the URL.
Recommended mapping:
001 = important
010 = present
011 = discuss
100 = no
000 = none is implicit and omitted
The encoding order follows permanent numeric item codes.
Then:
Assign every item a permanent positive integer code
Sort selected items by code
Pack each item code with its state
Encode item/state pairs with a URL-safe base62 alphabet
13.3 Permanent item codes
The item code must be deterministic and permanent. Codes must never be recycled, even if an item is renamed, moved, hidden, or removed from the active UI. String item IDs remain required for humans, tests, locale dictionaries, and maintenance.
13.4 Invalid URL handling
If the URL contains:
malformed selection payload
payload too short or too long
Then the app should fail gracefully:
show default empty state, or
show a non-blocking message and reset invalid data
13.5 Future extensibility
The URL model should leave room for future query params such as:
comparison payload
active view
filters
14. View Architecture
14.1 Shared domain layer
A single domain layer should handle:
schema loading
locale resolution
selection state
encoding and decoding
derived summary counts
14.2 Desktop renderer
Recommended: SVG-based renderer.
Reasons:
precise control over bubble positions and sizes
strong fit for diagram-like layout
better maintainability than introducing D3 too early
easier to keep layout deterministic
14.3 Mobile renderer
Recommended: standard DOM layout using cards or accordions.
Reasons:
better touch ergonomics
simpler responsiveness
easier accessibility
easier readability on small screens
14.4 D3 usage
D3 is not recommended for V1. It may be reconsidered in later versions if the project needs:
dynamic force-based layout
animated transitions between views
advanced comparison overlays
15. Suggested Tech Stack
Recommended baseline:
React
TypeScript
Vite or Next.js
SVG for desktop diagram rendering
Standard i18n library such as i18next, react-intl, or next-intl
Lightweight state management using React state, Zustand, or equivalent
Unit tests with Node's built-in test runner
E2E tests with Playwright
Recommended preference
If SEO is not important for V1, Vite + React + TypeScript is sufficient.
If multi-route locale handling and deployment conventions matter more, Next.js is a good option.
16. Application States and Behaviors
16.1 Initial load
On initial load, the app should:
Read locale from the optional `lang` query parameter
Load the correct schema and translations
Read the selection payload from the URL hash
Decode selection if valid
Render the correct view for the device
16.2 Applying a state
When the user clicks an item:
if the item is currently in a different state, apply the active state
if the item is currently already in the active state, reset it to none
update derived counts
update the URL
16.3 Switching locale
When the user switches locale:
preserve selection state
re-render labels in the selected language
update the `lang` query parameter
16.4 Reset
Reset should:
set all items to none
update summary counts
update the URL to an empty or minimal state
17. Error Handling
The app should handle errors simply and safely.
Possible cases:
unknown locale
missing translation key
malformed selection payload
schema loading failure
Expected behavior:
default to safe fallbacks
keep the UI usable
avoid hard crashes
show non-technical messages where relevant
18. Analytics and Privacy
V1 should not require analytics.
If analytics are added later, they must be privacy-conscious.
Important note:
Selections may include sensitive relational or sexual preferences. Since the entire state is shareable via URL, the product should not create a false sense of privacy.
A lightweight informational note may be added to clarify:
links are shareable as-is
no account or name is stored by default
users are responsible for what they share
19. Future Comparison Mode - Preparation Only
Comparison between two people is out of scope for V1, but V1 must prepare for it.
This means V1 must guarantee:
stable item IDs
stable schema versioning
canonical item order
deterministic encoding and decoding
Future comparison inputs may look like:
two encoded selections on the same schema version
or one current selection plus one imported/shared selection
Possible future outputs:
overlap report
incompatibility highlights
category-by-category visual comparison
discussion prompts
20. Acceptance Criteria - V1
Content and schema
The app loads a versioned schema from JSON.
The app supports at least two locales from launch.
Category and item IDs remain stable across locales.
Interaction
The user can select a state for an item.
The user can assign exactly one selected state to an item at a time.
Applying the same state twice resets the item to none.
URL behavior
The current selection is encoded in the URL.
Reloading the page restores the same selection.
The URL includes locale when non-default and stores selection in the hash.
Desktop and mobile
The current primary UI provides a responsive structured category-card view.
Any future separate desktop/mobile visual views must operate on the same selection data.
Accessibility
State is not communicated by color alone.
The app is keyboard-navigable.
Interactive elements have accessible labels.
Touch targets are usable on mobile.
Multilingual
UI labels and content are localized.
Switching locale preserves current selection.
Missing translations fall back safely.
Infrastructure
No backend is required.
No user account is required.
21. Recommended Delivery Plan
Phase 1 - Domain foundation
Define schema format
Define locale file format
Define stable IDs
Implement item flattening and canonical order
Implement encode and decode logic
Add unit tests for encoding and decoding
Phase 2 - Core UI
Build state-selection controls
Build item component
Build shared selection store
Build summary component
Sync state to URL
Phase 3 - Desktop renderer
Build SVG layout renderer
Position categories and items
Apply visual states
Add responsive resizing behavior
Phase 4 - Mobile renderer
Build list or accordion layout
Add sticky palette
Tune touch interactions
Verify readability and ergonomics
Phase 5 - i18n and accessibility
Add locale switching
Localize UI strings
Localize content labels
Add ARIA labels and keyboard support
Validate contrast and focus states
Phase 6 - QA and polish
Test malformed URLs
Test locale switching with existing selection
Test desktop and mobile behavior
Test copy-link flow
Test reset flow
22. Suggested Ticket Breakdown
Epic A - Content model and encoding
Define schema JSON contract
Define locale dictionary contract
Build selection encoder
Build selection decoder
Add tests for version mismatch and invalid payloads
Epic B - Shared application shell
Create app layout
Add locale routing
Add shared state store
Add summary and reset actions
Add copy-link action
Epic C - Desktop visual map
Render categories as positioned bubbles
Render items inside each category bubble
Support selection interaction inside SVG
Add responsive resizing
Epic D - Mobile list experience
Render categories as cards or accordions
Render items as chips
Add sticky or fixed palette
Ensure thumb-friendly interaction
Epic E - Accessibility and internationalization
Implement keyboard navigation
Add screen reader labels
Integrate i18n framework
Add at least English and French locales
Validate fallback behavior
23. Open Questions
These are not blockers for starting implementation, but they should be clarified soon:
Which locales are required at launch besides English and French?
Should the default locale depend on browser language, route, or explicit user choice only?
Should search/filter be included in V1 or postponed?
Should the desktop layout be fully handcrafted or partially algorithmic?
Should category descriptions or helper text appear anywhere, or only labels?
Should there be a short onboarding note explaining what each state means?
24. Recommended Implementation Decisions
To reduce ambiguity for agents, the following decisions are recommended:
Use a versioned schema from day one
Use stable item IDs from day one
Use optional `lang` query routing for locale
Use sparse base62 hash payloads for selection encoding
Use DOM category cards for the current primary UI
Keep SVG Sunburst work separate if it returns
Use Option B for multilingual content storage: base schema plus locale dictionaries
25. Summary
This project should be built as a config-driven, multilingual, backend-free web application that lets a user classify relationship-related items into four states and share the result through the URL.
The first release should optimize for:
clean data foundations
robust URL encoding
strong multilingual support
desktop visual fidelity to the source inspiration
mobile usability
accessibility
The goal for V1 is not to perfectly reproduce the original PDF. The goal is to turn its structure into a usable interactive product while preserving enough of its visual spirit and conceptual richness to remain recognizable and useful.
