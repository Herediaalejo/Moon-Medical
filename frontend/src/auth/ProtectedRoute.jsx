import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { validateToken } from "../../utils/authUtils";

const ProtectedRoute = ({ children }) => {
  const [isValid, setIsValid] = useState(null);

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkToken = async () => {
      const { valid } = await validateToken(token);
      setIsValid(valid);
    };
    checkToken();
  }, [token]);

  if (isValid === null) {
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default ProtectedRoute;
