import { useHealthCheck } from '../hooks/useQuery';

const HealthCheck = () => {
  const { status, isLoading, error } = useHealthCheck();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return <div>HealthCheck {JSON.stringify(status)}</div>;
};

export default HealthCheck;
