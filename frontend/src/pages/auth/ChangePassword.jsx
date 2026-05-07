import { useState } from "react";
import { Input } from "../../shared/ui/atoms/Input";
import { Button } from "../../shared/ui/atoms/Button";
import api from "../../shared/services/api";

const ChangePassword = () => {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
      });
      setMessage(res.data?.message || "Password changed successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to change password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-xl">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Change Password</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Update your password for this account.</p>
      </div>

      {message && (
        <div className="p-3 bg-emerald-100 border border-emerald-300 text-emerald-700 rounded-lg text-sm">
          {message}
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5 bg-white dark:bg-slate-900 rounded-xl shadow-sm p-6">
        <Input
          id="currentPassword"
          label="Current Password"
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <Input
          id="newPassword"
          label="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
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

        <Button type="submit" size="lg" isLoading={isLoading}>
          Update Password
        </Button>
      </form>
    </div>
  );
};

export default ChangePassword;