# Membership Application & Upgrade Plan

This plan details the implementation of a dedicated Membership Application page, integrating a mock online credit/debit card transaction method, writing updates to the SQLite database in real-time, logging activity/audits, and displaying custom prestige membership badges on the user's profile and sidebar.

## Proposed Changes

### Component 1: Backend Server Endpoints

We will create a new endpoint to handle user membership upgrades and audit logs.

#### [MODIFY] [index.js](file:///d:/Arun%20projects/DYICS%20Task-1/server/src/index.js)
- Add a new route `POST /api/membership/upgrade`:
  - **Body parameters:** `{ email, tierName }`
  - **Logic:**
    1. Look up the user by email in the SQLite database.
    2. Look up the target tier in `membership_tiers` by name.
    3. Update the user's `membership_tier_id` in the `users` table.
    4. Log the action to `audit_logs` and `user_activity_logs`.
    5. Return the updated user information containing the new tier name.

---

### Component 2: Frontend App routing & Homepage links

We will wire up the membership navigation and register the new page.

#### [MODIFY] [Homepage.jsx](file:///d:/Arun%20projects/DYICS%20Task-1/client/src/pages/Homepage.jsx)
- Update the "Apply for Membership" button action:
  - If a user session exists, navigate them to `#/membership`.
  - If no user session exists (guest or unauthenticated), trigger the login/signup modal or redirect them to `/login` with a redirect state to `/membership`.

#### [MODIFY] [App.jsx](file:///d:/Arun%20projects/DYICS%20Task-1/client/src/App.jsx)
- Import `Membership` from `./pages/Membership`.
- Register Route: `<Route path="/membership" element={<OnboardingGuard><Membership /></OnboardingGuard>} />`.

---

### Component 3: Membership Application Page [NEW]

We will build an ultra-premium, interactive membership page with step-by-step transaction processing.

#### [NEW] [Membership.jsx](file:///d:/Arun%20projects/DYICS%20Task-1/client/src/pages/Membership.jsx)
- **Design System:** Use dark theme backgrounds, HSL tailored gold highlights, glassmorphism cards, and Tenor Sans typography.
- **Features:**
  1. **Tier Picker:** Dynamic cards showing VIP ($49/mo), Platinum ($99/mo), and Diamond ($199/mo) features.
  2. **Online Payment Gateway Form:** Simulated checkout wizard asking for Cardholder Name, Card Number, Expiration, and CVV.
  3. **Processing Animation:** A gold spinner indicating secure credit card processing.
  4. **Confirmation Screen:** A beautiful congratulations modal with a direct shortcut link to `/profile` to view their new badge.

---

### Component 4: Badge Visual Display Upgrades

We will display the tier badges inside the client app to highlight the user's prestige status.

#### [MODIFY] [Profile.jsx](file:///d:/Arun%20projects/DYICS%20Task-1/client/src/pages/Profile.jsx)
- Ensure the membership tier is prominently featured as a glowing gold badge next to the user's profile picture or under their name in the main card.
- Maintain support for local profile edits and dynamic page transitions.

#### [MODIFY] [Navigation.jsx](file:///d:/Arun%20projects/DYICS%20Task-1/client/src/components/Navigation.jsx)
- Add the active membership tier badge underneath the user's name/email in the bottom footer of the desktop sidebar navigation so that users feel the premium presence across all views.

---

## Verification Plan

### Automated Tests
- Create a test script `/scratch/test_membership.js` to send requests to `/api/membership/upgrade` and verify the SQLite schema is modified and logged.

### Manual Verification
- Launch the application and click "Apply for Membership" on the homepage.
- Walk through the tier selection, credit card checkout, and purchase activation.
- Go to the profile page and verify the badge updates.
- Check the Admin console's Audit Log tab to verify the upgrade event was written.
