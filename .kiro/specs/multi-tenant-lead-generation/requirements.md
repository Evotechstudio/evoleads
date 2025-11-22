# Requirements Document

## Introduction

Evo Lead AI is a sophisticated AI-powered Lead Generation SaaS platform that enables organizations to find and manage business leads through an intuitive web interface. The system supports multi-tenancy through an organization-centric approach, secured via OAuth authentication, allowing teams to collaborate on lead generation efforts within shared organizational contexts.

## Glossary

- **Evo Lead AI System**: The complete SaaS platform including frontend, authentication, and integrations
- **Organization**: A tenant entity that groups users and maintains separate data isolation
- **Lead**: A business contact record containing name, email, phone, website, and confidence score
- **Credit**: A unit of consumption where 1 credit = 100 leads generated
- **Trial**: Organization-specific allowance of 2 free searches before requiring paid plan
- **OAuth Provider**: External authentication service (Google, GitHub) for user sign-in
- **Active Organization**: The currently selected organization context for a user's session
- **Organization Member**: A user associated with an organization through the pivot table
- **Search Request**: A lead generation query specifying business type, location, and volume
- **n8n Webhook**: Backend automation endpoint that processes lead generation requests
- **Supabase**: Backend-as-a-Service providing database, authentication, and real-time features

## Requirements

### Requirement 1

**User Story:** As a business professional, I want to authenticate using my existing Google or GitHub account, so that I can quickly access the platform without creating new credentials.

#### Acceptance Criteria

1. WHEN a user visits the authentication page, THE Evo Lead AI System SHALL display "Sign in with Google" and "Sign in with GitHub" buttons
2. WHEN a user clicks an OAuth provider button, THE Evo Lead AI System SHALL redirect to the provider's authorization page
3. WHEN OAuth authentication succeeds, THE Evo Lead AI System SHALL create a user profile in the profiles table if it does not exist
4. WHEN OAuth authentication fails, THE Evo Lead AI System SHALL display an error message and return to the authentication page
5. THE Evo Lead AI System SHALL maintain user session state using Supabase Auth

### Requirement 2

**User Story:** As a new user, I want to create or join an organization after authentication, so that I can collaborate with my team on lead generation.

#### Acceptance Criteria

1. WHEN a new user completes OAuth authentication, THE Evo Lead AI System SHALL prompt to create a new organization or join an existing one
2. WHEN a user creates a new organization, THE Evo Lead AI System SHALL store organization details in the organizations table and assign the user as owner
3. WHEN a user joins an existing organization via invite, THE Evo Lead AI System SHALL add an entry to the organization_members table
4. THE Evo Lead AI System SHALL assign 2 free trial searches to each newly created organization
5. WHEN organization creation or joining fails, THE Evo Lead AI System SHALL display appropriate error messages

### Requirement 3

**User Story:** As an organization member, I want to switch between multiple organizations I belong to, so that I can manage leads for different companies or teams.

#### Acceptance Criteria

1. WHEN a user belongs to multiple organizations, THE Evo Lead AI System SHALL display an organization selector in the navigation
2. WHEN a user selects a different organization, THE Evo Lead AI System SHALL update the active organization context
3. WHILE an organization is active, THE Evo Lead AI System SHALL scope all data displays to that organization
4. THE Evo Lead AI System SHALL persist the active organization selection across user sessions
5. WHEN switching organizations, THE Evo Lead AI System SHALL update credits, trial status, and plan information displays

### Requirement 4

**User Story:** As a lead researcher, I want to search for businesses by type and location with specified volume, so that I can generate targeted prospect lists.

#### Acceptance Criteria

1. THE Evo Lead AI System SHALL provide form fields for business type, country, state/province, city, and lead volume selection
2. WHEN a user submits a search request, THE Evo Lead AI System SHALL validate all required fields are completed
3. WHEN validation passes, THE Evo Lead AI System SHALL send the request to the n8n webhook with user ID, organization ID, and search parameters
4. WHILE the search is processing, THE Evo Lead AI System SHALL display a loading animation and progress indicator
5. WHEN the active organization has insufficient credits or exceeded trial limit, THE Evo Lead AI System SHALL prevent search submission and display upgrade prompts

### Requirement 5

**User Story:** As a lead researcher, I want to view generated leads with business details and confidence scores, so that I can evaluate prospect quality before outreach.

#### Acceptance Criteria

1. WHEN lead generation completes, THE Evo Lead AI System SHALL display results in a modern grid or list view
2. THE Evo Lead AI System SHALL show business name, email, phone, website, and confidence score for each lead
3. THE Evo Lead AI System SHALL provide "Copy All Emails" and "Export CSV" functionality for the results
4. WHEN no leads are found, THE Evo Lead AI System SHALL display an appropriate empty state message
5. THE Evo Lead AI System SHALL store generated leads scoped to the active organization

### Requirement 6

**User Story:** As an organization owner, I want to manage billing and upgrade plans, so that I can ensure continued access to lead generation services.

#### Acceptance Criteria

1. THE Evo Lead AI System SHALL display three pricing tiers: Starter (₨1,200/mo, 20 credits), Growth (₨4,000/mo, 80 credits), Agency (₨12,000/mo, 300 credits)
2. WHEN a user initiates plan upgrade, THE Evo Lead AI System SHALL integrate with Safepay for payment processing
3. WHEN payment succeeds, THE Evo Lead AI System SHALL update the organization's credit balance and plan status
4. THE Evo Lead AI System SHALL display current plan, credit usage, and billing history for the active organization
5. WHEN payment fails, THE Evo Lead AI System SHALL display error messages and maintain current plan status

### Requirement 7

**User Story:** As an organization owner, I want to invite team members and manage organization settings, so that I can collaborate effectively on lead generation.

#### Acceptance Criteria

1. THE Evo Lead AI System SHALL provide functionality to generate unique invite links or codes for organization membership
2. WHEN a user uses a valid invite link, THE Evo Lead AI System SHALL associate them with the organization upon authentication
3. THE Evo Lead AI System SHALL display current organization members with names and roles
4. WHERE the user is an organization owner, THE Evo Lead AI System SHALL provide ability to remove members
5. THE Evo Lead AI System SHALL allow organization owners to update organization name and settings

### Requirement 8

**User Story:** As a platform user, I want a responsive and intuitive interface that works on all devices, so that I can access lead generation tools anywhere.

#### Acceptance Criteria

1. THE Evo Lead AI System SHALL implement mobile-first responsive design using Tailwind CSS
2. WHEN viewed on mobile devices, THE Evo Lead AI System SHALL display collapsible navigation
3. WHEN viewed on desktop, THE Evo Lead AI System SHALL show sidebar and main content split layout
4. THE Evo Lead AI System SHALL provide smooth transitions and animations using Framer Motion
5. THE Evo Lead AI System SHALL support both light and dark mode themes with user preference persistence