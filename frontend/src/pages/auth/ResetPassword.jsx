import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Input } from "../../shared/ui/atoms/Input";
import { Button } from "../../shared/ui/atoms/Button";
import api from "../../shared/services/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post(`/auth/reset-password/${token}`, { newPassword: password });
      setMessage(res.data?.message || "Password reset successful. Please log in.");
      setTimeout(() => navigate("/auth/login"), 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Reset Password</h1>
        <p className="text-slate-600 dark:text-slate-400">Enter your new password.</p>
      </div>

      {message && (
        <div className="mb-6 p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="mb-6 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="password"
          label="New Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <Input
          id="confirmPassword"
          label="Confirm Password"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />

        <Button type="submit" className="w-full" size="lg" isLoading={isLoading}>
          Reset Password
        </Button>
      </form>
    </div>
  );
};

export default ResetPassword;