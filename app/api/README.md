# Backend API Architecture

This directory is designed to house Next.js Route Handlers (`app/api/...`), following a specific layered architecture approach to keep the code clean, modular, and testable.

## Architecture Flow

Future API routes should follow this flow of responsibility:

`API Route` (Controller) -> `Service` (Business Logic) -> `Repository` (Data Access) -> `Database` (Supabase)

1.  **API Route Handler**: Receives the HTTP request, validates input, calls the necessary service, and returns the HTTP response.
2.  **Service**: Contains the core business logic. It orchestrates the flow and calls repositories.
3.  **Repository**: The only layer that directly interacts with the database/infrastructure.
4.  **Database**: Underlying infrastructure (e.g., Supabase PostgreSQL).

## Example Future Implementation

You might structure your routes like this:

-   `app/api/productos/route.ts` - Handles fetching or creating products.
-   `app/api/uploads/route.ts` - Handles image uploads interacting with Cloudinary.

**Note:** Currently, no business logic or working API endpoints are implemented. This structure serves as a clean skeleton for future development.
