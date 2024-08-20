# Team Health Dashboard Client

A React application that communicates with the backend of Team Health Dashboard, in order to show the development team relevant data.

## SSE Support

For SSE support, we can use the EventSource API, which is supported in modern browsers. We might want to create a custom hook to handle SSE connections, which could be used in conjunction with React Query for real-time updates.

## API Integration

Our frontend application will interact with the Team Health Dashboard backend API. The main endpoints we'll be working with are:

### Authentication

`POST /api/auth/register`
`POST /api/auth/login`

### Metrics

`GET /api/metrics`

### Health Check

`GET /health`

## Pages

- Login Page
- Registration Page
- Dashboard Page (main view with metrics)
- Health Check Page (for system status)

### Login Page

- React Hook Form: For efficient form handling and validation
- React Query: Handle login API request
- Material-UI: Styled components for form inputs and layout
- React Router: For navigation after successful login

### Registration Page

- React Hook Form: For efficient form handling and validation
- React Query: Handle registration API request
- Material-UI: Styled components for form inputs and layout
- React Router: For navigation after successful registration

### Dashboard Page

- React Query: Fetch metrics data, potentially with SSE integration
- Recharts: Visualize metrics data
- Material-UI: Layout components, cards for metrics display
- Custom SSE hook: Real-time updates for metrics

### Health Check Page

- React Query: Fetch health check data
- Material-UI: Display system status information
- Custom SSE hook: Real-time updates for system status

## Folder Structure

```txt
src/
├── components/
│   ├── common/
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   └── ...
│   ├── dashboard/
│   │   ├── MetricCard.tsx
│   │   ├── MetricChart.tsx
│   │   └── ...
│   └── layout/
│       ├── Header.tsx
│       ├── Sidebar.tsx
│       └── ...
├── pages/
│   ├── Dashboard.tsx
│   ├── Login.tsx
│   └── ...
├── services/
│   ├── api.ts
│   └── auth.ts
├── hooks/
│   ├── useMetrics.ts
│   └── ...
├── utils/
│   ├── formatters.ts
│   └── ...
├── types/
│   ├── metrics.ts
│   └── ...
├── styles/
│   ├── theme.ts
│   └── globalStyles.ts
├── App.tsx
└── main.tsx
```

## Target Architecture

- React with TypeScript
- Routing: React Router
- UI Component Library: Material-UI (MUI)
- Data Fetching and Server State Management: React Query
- Charts and Visualizations: Recharts
- Form Handling: React Hook Form
- Testing: Jest and React Testing Library
- Build Tool: Vite
- Linting and Formatting: ESLint and Prettier

Here's a breakdown of each choice and its motivation:

### React with TypeScript

React is a popular, efficient, and well-supported library for building user interfaces.
TypeScript adds static typing, improving code quality, maintainability, and developer productivity.

### React Router

Provides declarative routing for React applications.
Allows for easy navigation between different views of the dashboard.

### Material-UI (MUI)

Offers a comprehensive set of pre-built, customizable React components.
Ensures a consistent, modern look and feel across the application.
Provides responsive design out of the box.
Includes a robust theming system for customization.

### State Management

Server State: Managed by React Query

- Metrics data
- Health check status
- User authentication status

Local State: Managed by React's useState and useContext

- UI state (e.g., open/closed modals, selected tabs)
- Form inputs (leveraging React Hook Form)
- Any necessary global state (e.g., user preferences)

### Recharts

A composable charting library built on React components.
Offers a wide range of chart types suitable for visualizing team health metrics.
Provides responsive and interactive charts out of the box.

### React Hook Form

Efficient form library with easy validation.
Reduces unnecessary re-renders and improves performance.

### Jest and React Testing Library

Jest provides a robust testing framework.
React Testing Library encourages testing user behavior rather than implementation details.

### Vite

Fast build tool and development server.
Offers better performance compared to Create React App.
Provides an excellent developer experience with fast hot module replacement.

### ESLint and Prettier

ESLint ensures code quality and consistency.
Prettier automatically formats code, reducing style-related discussions.

## Styling and Theming

We will use Material-UI's built-in theming system for consistent styling across the application. This approach provides several benefits:

- Centralized theme configuration
- Easy customization of component styles
- Support for light/dark mode and other theme variations
- Consistent look and feel across the application

### Theme Configuration

The main theme will be defined in `src/styles/theme.ts`. This file will export a theme object created using MUI's `createTheme` function. The theme will include:

- Custom color palette
- Typography settings
- Component style overrides
- Responsive breakpoints

### Global Styles

Global styles will be defined in `src/styles/globalStyles.ts`. These styles will be applied using MUI's `GlobalStyles` component and will include:

- Reset CSS
- Base styles for HTML elements
- Any other global styles needed across the application

### Component Styling

For component-specific styling, we will primarily use MUI's `sx` prop. This allows for easy, theme-aware styling directly in components. For more complex components, we may use MUI's `makeStyles` hook to create reusable styles.

### Theme Provider

The MUI `ThemeProvider` component will be used to wrap the entire application, making the theme available to all components. This will be set up in the `App.tsx` or `AppLayout.tsx` file.

### Dynamic Theming

If required, we will implement theme switching (e.g., light/dark mode) using React state and MUI's theming system. This can be achieved by creating separate theme objects for each mode and switching between them based on user preference.

## Error Handling & Logging

### Error Handling

**API Errors:**

React Query will handle retries and error states for API calls.
We'll create a custom error boundary component to catch and display errors gracefully.

**Validation Errors:**

Form validation errors will be handled by React Hook Form and displayed inline.

**Global Error Handler:**

Implement a global error handler to catch and log uncaught exceptions.

### Logging

- Development: Console logging for debugging purposes.
- Production: Integrate a logging service (e.g., Sentry, LogRocket) to track errors and user sessions in production.

Example of error handling with React Query:

```typescript
const { data, error, isLoading } = useApiQuery('metrics', fetchMetrics, {
  onError: (error) => {
    logError(error);
    showErrorNotification('Failed to fetch metrics. Please try again later.');
  },
});
```

## Non-Functional Requirements

**Performance:**

- Initial load time should be under 2 seconds on a 3G connection.
- Time to interactive should be under 3 seconds on a 3G connection.
- Use code splitting and lazy loading for larger components and routes.

**Accessibility:**

- The application should be WCAG 2.1 AA compliant.
  All interactive elements must be keyboard accessible.
  Use semantic HTML and ARIA attributes where necessary.

**Browser Support:**

- Support the last two versions of major browsers (Chrome, Firefox, Safari, Edge).
- Graceful degradation for older browsers.

**Responsiveness:**

- The application should be fully functional on devices with screen widths from 320px to 4K.
- Use responsive design principles and fluid layouts.

**Security:**

- Implement proper authentication and authorization checks.
- Use HTTPS for all communications.
- Sanitize all user inputs to prevent XSS attacks.

## Testing Strategy

**Unit Tests:**

- Use Jest and React Testing Library for component and utility function testing.
- Aim for at least 80% code coverage.

**Integration Tests:**

- Test interactions between components and with the API.
- Use Mock Service Worker (MSW) to mock API responses.

**End-to-End Tests:**

- Use Cypress for critical user flows (e.g., login, viewing dashboard).
- Run E2E tests as part of the CI pipeline.

**Accessibility Testing:**

- Use aXe or similar tools to automate accessibility checks.
- Perform manual testing with screen readers.

Example of a unit test:

```typescript
test("MetricCard displays correct data", () => {
  const metric = { name: "Test Metric", value: 42 };
  render(<MetricCard metric={metric} />);
  expect(screen.getByText("Test Metric")).toBeInTheDocument();
  expect(screen.getByText("42")).toBeInTheDocument();
});
```

## CI/CD Pipeline

We will use GitHub Actions for our CI/CD pipeline:

**Continuous Integration:**

Run on every pull request and push to main branch.
Steps:

Install dependencies
Run linter (ESLint)
Run unit and integration tests
Build the application
Run E2E tests on the built application

**Continuous Deployment:**

Triggered on successful merge to main branch.
Steps:

Build the application
Run all tests
Deploy to staging environment
Run smoke tests on staging
If successful, deploy to production
Run smoke tests on production

## Fallback Strategies

**Offline Support:**

Implement a service worker to cache critical assets and API responses.
Display cached data when offline, with a clear indication of the offline status.

**Error States:**

Design and implement error states for all major components.
Provide retry mechanisms for failed API calls.

**Loading States:**

Implement skeleton screens or loading indicators for all async operations.

Example of a fallback strategy in a component:

```typescript
function Dashboard() {
  const { data, error, isLoading } = useApiQuery("metrics", fetchMetrics);

  if (isLoading) return <SkeletonLoader />;
  if (error) return <ErrorMessage error={error} retry={() => refetch()} />;
  if (!data) return <NoDataMessage />;

  return <DashboardContent data={data} />;
}
```

## Performance Monitoring

**Implement Real User Monitoring (RUM):**

- Use a tool like Google Analytics or more specialized solutions like New Relic or Datadog.
- Track key metrics such as Time to First Byte (TTFB), First Contentful Paint (FCP), and Time to Interactive (TTI).

**Error Tracking:**

- Use a service like Sentry to track and alert on frontend errors in real-time.

**API Performance:**

- Monitor API response times and error rates.
- Set up alerts for slow responses or high error rates.

**Custom Performance Marks:**

- Use the Performance API to set custom marks and measures for critical user journeys.

Example of setting a custom performance mark:

```typescript
function Dashboard() {
  useEffect(() => {
    performance.mark('dashboard-start');
    return () => {
      performance.measure('dashboard-duration', 'dashboard-start');
      const measure = performance.getEntriesByName('dashboard-duration')[0];
      logPerformance('dashboard-load', measure.duration);
    };
  }, []);

  // ... rest of the component
```
