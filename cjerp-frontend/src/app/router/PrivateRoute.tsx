import { Navigate, Outlet } from "react-router-dom";
import { getAuthUser } from "../../utils/authStorage";

export default function PrivateRoute() {
  const authUser = getAuthUser();

  if (!authUser?.token) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}