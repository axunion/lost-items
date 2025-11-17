# Feature Specification: Lost Item Tracking

**Version**: 1.0
**Status**: DRAFT
**Author**: Gemini
**Created**: 2025-11-17
**Last Updated**: 2025-11-17

## 1. Feature Name

Lost Item Tracking

## 2. Description

This feature provides the core functionality for managing lost and found items for a specific event or location. It allows users to register found items with a photo and comment via a dedicated registration page. A corresponding viewing page displays all active items, allowing owners to search for their belongings. Access to these page pairs is controlled by unique, randomly generated URLs, removing the need for traditional user authentication. Item status can be managed to control visibility on the viewing page.

## 3. Actors

- **Item Registrar**: A person who finds an item and uses the registration URL to add it to the list.
- **Item Seeker**: A person who has lost an item and uses the viewing URL to browse the list of found items.
- **List Administrator**: A person who initially creates the registration/viewing page pair and shares the URLs.

## 4. User Scenarios & Testing

### Scenario 1: Registering a New Found Item

- **As an** Item Registrar,
- **When I** access the unique registration URL,
- **Then I** see a simple form to upload a photo of the item and add a descriptive comment (e.g., "Black wallet found near the north entrance").
- **And when I** submit the form,
- **Then** the item is added to the list and becomes visible on the corresponding viewing page.

### Scenario 2: Searching for a Lost Item

- **As an** Item Seeker,
- **When I** access the unique viewing URL,
- **Then I** see a gallery or list of all found items that are currently marked as "active".
- **And** each item in the list displays its photo and the registrar's comment, helping me identify my property.

### Scenario 3: Marking an Item as Claimed

- **As an** Item Registrar or List Administrator,
- **When** an item has been returned to its owner,
- **Then I** need a way to change the item's status from "active" to "claimed".
- **And when** the status is "claimed",
- **Then** the item is no longer displayed on the public viewing page to keep the list clean.

## 5. Functional Requirements

### FR1: Item Registration Page

- The system must provide a web page accessible via a unique, non-guessable URL where users can register a found item.
- **AC1.1**: The page must include a file input field that allows the user to select or take a photo.
- **AC1.2**: The page must include a text input field for a descriptive comment.
- **AC1.3**: A "Register Item" button submits the item details to the system.
- **AC1.4**: Upon successful registration, the item is assigned a default status of "active".
- **AC1.5**: The system must only accept common image formats (e.g., JPEG, PNG) and limit file size (e.g., up to 5MB). Attempts to upload invalid formats or oversized files must result in an error message.
- **AC1.6**: The registration page must include a mechanism (e.g., a simple password or a unique token) to allow the Item Registrar to change the status of items within that specific list.

### FR2: Item Viewing Page

- The system must provide a web page accessible via a unique, non-guessable URL that displays registered items.
- **AC2.1**: The page must display a list or grid of all items whose status is "active".
- **AC2.2**: Each item displayed must show its photo, associated comment, and a relative time indicator (e.g., '2 hours ago', 'yesterday').
- **AC2.3**: Items with a status other than "active" (e.g., "claimed") must not be displayed on this page.

### FR3: Item Status Management

- The system must provide a mechanism to change an item's status.
- **AC3.1**: The registration page itself will serve as the management interface for item statuses, accessible via the same unique URL.

## 6. Success Criteria

- **SC1 (Registration Speed)**: An Item Registrar can successfully register an item (including photo upload) within 30 seconds on a standard network connection.
- **SC2 (Viewing Performance)**: The viewing page loads and displays 50 items within 3 seconds on a standard network connection.
- **SC3 (Status Update)**: An Item Registrar can change an item's status within 5 seconds of accessing the management interface.
- **SC4 (Item Visibility)**: Items marked as "claimed" are removed from the viewing page within 1 second of status update.

## 7. Non-Functional Requirements

- **NFR1 (Usability)**: The registration and viewing pages must be highly intuitive and require no instructions for a first-time user.
- **NFR2 (Security)**: The URLs for the registration and viewing pages must be sufficiently random and long to prevent unauthorized access through guessing.

## 8. Key Entities & Data Model

- **ItemList**
  - `list_id` (Primary Key, e.g., a UUID)
  - `registration_url_secret` (Part of the URL path)
  - `viewing_url_secret` (Part of the URL path)
  - `created_at`
- **Item**
  - `item_id` (Primary Key)
  - `list_id` (Foreign Key to ItemList)
  - `photo_url` (URL to the stored image)
  - `comment` (Text)
  - `status` (String, e.g., "active", "claimed")
  - `created_at`

## 9. Assumptions & Dependencies

- **Assumption 1**: The "random URLs" are the sole mechanism for access control. There is no user login system.
- **Assumption 2**: Image files will be stored in a cloud storage service, and the application will handle the upload and URL generation process.
- **Assumption 3**: The viewing screen will display the item's photo, comment, and a relative time indicator of when it was registered.
- **Assumption 4**: The system will enforce limits on photo uploads, accepting common image formats (JPEG, PNG) up to a maximum size of 5MB.

## 10. Out of Scope

- User authentication (login/password).
- A central dashboard to view all created lists.
- Editing an item's photo or comment after registration.