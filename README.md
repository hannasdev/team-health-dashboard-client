# Team Health Dashboard Client

This project is a React Typescript Client that consumes the Endpoints available through the backend of Team Health Dashboard.

## Commits

Excerpt from <https://www.conventionalcommits.org/en/v1.0.0/#summary>:

The commit message should be structured as follows:

```txt
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

The commit contains the following structural elements, to communicate intent to the consumers of your library:

`fix:` a commit of the type fix patches a bug in your codebase (this correlates with PATCH in Semantic Versioning).

`feat:` a commit of the type feat introduces a new feature to the codebase (this correlates with MINOR in Semantic Versioning).

`BREAKING CHANGE:` a commit that has a footer BREAKING CHANGE:, or appends a ! after the type/scope, introduces a breaking API change (correlating with MAJOR in Semantic Versioning). A BREAKING CHANGE can be part of commits of any type.

Types other than `fix:` and `feat:` are allowed, for example `@commitlint/config-conventional` (based on the Angular convention) recommends `build:`, `chore:`, `ci:`, `docs:`, `style:`, `refactor:`, `perf:`, `test:`, and others.

Footers other than `BREAKING CHANGE: <description>` may be provided and follow a convention similar to git trailer format.

Additional types are not mandated by the Conventional Commits specification, and have no implicit effect in Semantic Versioning (unless they include a BREAKING CHANGE). A scope may be provided to a commit’s type, to provide additional contextual information and is contained within parenthesis, e.g., `feat(parser):` add ability to parse arrays.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

## Architecture

```mermaid
classDiagram
    App *-- ErrorBoundary
    App *-- AppLayout
    App *-- QueryClientProvider
    App *-- Router

    AppLayout *-- Dashboard
    AppLayout *-- Login
    AppLayout *-- Register
    AppLayout *-- HealthCheck

    Dashboard *-- MetricChart

    class App {
        +render()
    }

    class ErrorBoundary {
        +handleError(error, info)
        +render()
    }

    class AppLayout {
        -isLoggedIn: boolean
        -logout(): void
        +render()
    }

    class Dashboard {
        -metrics: any[]
        -loading: boolean
        -error: Error
        +render()
    }

    class MetricChart {
        +title: string
        +data: any[]
        +dataKey: string
        +color: string
        +render()
    }

    class Login {
        -error: string
        -isLoading: boolean
        +onSubmit(data)
        +render()
    }

    class Register {
        -error: string
        -success: boolean
        +onSubmit(data)
        +render()
    }

    class HealthCheck {
        -status: any
        -isLoading: boolean
        -error: Error
        +render()
    }

    class QueryClientProvider {
        +queryClient: QueryClient
    }

    class Router {
        +routes: Route[]
    }

    %% Hooks
    class useAuth {
        +isLoggedIn: boolean
        +login(email, password): Promise
        +logout(): void
        +register(email, password): Promise
    }

    class useMetricsData {
        +metrics: any[]
        +loading: boolean
        +error: Error
    }

    class useHealthCheck {
        +status: any
        +isLoading: boolean
        +error: Error
    }

    %% Services
    class AuthenticationService {
        +login(email, password): Promise
        +register(email, password): Promise
        +logout(): void
        +getCurrentUser(): Promise
        +isLoggedIn(): boolean
    }

    class ApiService {
        +get(url, params): Promise
        +post(url, data): Promise
        +put(url, data): Promise
        +delete(url): Promise
    }

    class TokenManager {
        +getAccessToken(): string
        +getRefreshToken(): string
        +refreshToken(): Promise
        +setTokens(accessToken, refreshToken): void
        +clearTokens(): void
        +hasValidAccessToken(): boolean
    }

    Dashboard --> useMetricsData
    Login --> useAuth
    Register --> useAuth
    HealthCheck --> useHealthCheck
    useAuth --> AuthenticationService
    AuthenticationService --> ApiService
    AuthenticationService --> TokenManager
    useMetricsData --> ApiService
    useHealthCheck --> ApiService
```
