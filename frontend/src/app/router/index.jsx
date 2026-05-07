import { createBrowserRouter, Navigate } from "react-router-dom";
import AuthLayout from "../../shared/layouts/AuthLayout";

import Login from "../../pages/auth/Login";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/auth" replace />,
  },
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      { path: "login", element: <Login /> },
      { path: "forgot-password", element: <div>Forgot Password</div> },
    ],
  },
 
  {
    path: "*",
    element: <div className="p-8 text-center"><h1>404 Not Found</h1></div>,
  }
]);