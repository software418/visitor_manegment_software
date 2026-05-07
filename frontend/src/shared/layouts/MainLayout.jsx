import { Outlet, Navigate } from "react-router-dom";
import { useAuthStore } from "../store/authStore";
import Sidebar from "../ui/organisms/Sidebar";
import Header from "../ui/organisms/Header";

const MainLayout = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background-light dark:bg-background-dark">
      <Sidebar />
      <div className="flex flex-col flex-1 w-0 overflow-hidden">
        <Header />
        <main className="flex-1 relative overflow-y-auto focus:outline-none p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;