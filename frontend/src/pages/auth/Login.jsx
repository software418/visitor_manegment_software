import { useState } from "react";
import { useAuthStore } from "../../shared/store/authStore";
import { Input } from "../../shared/ui";
import { Button } from "../../shared/ui";
import { Link } from "react-router-dom";

const Login = () => {
  const login = useAuthStore((state) => state.login);
  const isLoading = useAuthStore((state) => state.isLoading);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    companyId: "",
    userEmail: "",
    password: "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await login(formData);
    } catch (err) {
      setError(err.response?.data?.message || "An error occurred during login");
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Welcome Back</h1>
        <p className="text-slate-600 dark:text-slate-400">Sign in to your VMS account</p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="companyId"
          label="Company ID"
          type="text"
          placeholder="Enter your company ID"
          value={formData.companyId}
          onChange={handleChange}
          required
        />
        <Input
          id="userEmail"
          label="Email Address"
          type="email"
          placeholder="name@company.com"
          value={formData.userEmail}
          onChange={handleChange}
          required
        />
        <div className="space-y-1">
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <div className="flex justify-end">
            <Link
              to="/auth/forgot-password"
              className="text-sm font-medium text-primary-600 hover:text-primary-500 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        </div>

        <Button type="submit" className="w-full mt-6" size="lg" isLoading={isLoading}>
          Sign In
        </Button>
      </form>
    </div>
  );
};

export default Login;