import { useCallback, useEffect, useState } from "react";
import api from "../../../shared/services/api";

const defaultPagination = { page: 1, limit: 10, totalPages: 1, total: 0 };

export const useUsers = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [pagination, setPagination] = useState(defaultPagination);

  const fetchUsers = useCallback(async (page = pagination.page, limit = pagination.limit) => {
    setIsLoading(true);
    setError("");
    try {
      const res = await api.get("/users", { params: { page, limit } });
      const data = res.data?.data;
      setUsers(data?.users || []);
      setPagination({
        page: data?.pagination?.page || page,
        limit: data?.pagination?.limit || limit,
        totalPages: data?.pagination?.totalPages || 1,
        total: data?.pagination?.total || 0,
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load users.");
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.limit]);

  const createUser = async (payload) => {
    setIsLoading(true);
    setError("");
    try {
      await api.post("/users", payload);
      await fetchUsers(1, pagination.limit);
      return true;
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create user.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
    error,
    pagination,
    fetchUsers,
    createUser,
  };
};