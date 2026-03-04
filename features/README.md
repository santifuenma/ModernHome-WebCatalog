# Feature-Based Architecture

This project is organized by features in the `features/` directory to group related logic together.
This simplifies development by keeping files organized by the domains they belong to, such as `features/products`.

## Architecture Flow
The application follows a simple data flow from the UI to the underlying database:

`UI` -> `Service` -> `Repository` -> `Infrastructure` -> `Database`

### Responsibilities
- **Service**: Contains business logic and orchestrates actions based on inputs.
- **Repository**: Handles direct database access and provides a data abstraction layer.
- **Infrastructure**: Contains external backend integrations like Supabase setup and Cloudinary APIs.
