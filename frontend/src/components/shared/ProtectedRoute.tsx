import { Redirect } from "wouter";

interface ProtectedRouteProps {
  component: React.ComponentType;
}

export function ProtectedRoute({ component: Component }: ProtectedRouteProps) {
  const token = localStorage.getItem("mediscan_token");

  if (!token) {
    return <Redirect to="/login" replace />;
  }

  // Renders the authorized route component
  return <Component />;
}
