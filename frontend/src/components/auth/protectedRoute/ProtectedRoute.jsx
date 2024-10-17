import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import styles from "./ProtectedRoute.module.css";
import { validateToken } from "../../../utils/authUtils";

const ProtectedRoute = ({ children, requiredRole }) => {
  const [isValid, setIsValid] = useState(null);
  const [role, setRole] = useState(null); // Estado para almacenar el rol

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    const checkToken = async () => {
      const { valid, role } = await validateToken(token);
      setIsValid(valid);
      if (valid) {
        setRole(role); // Actualiza el estado del rol si el token es válido
      }
    };
    checkToken();
  }, [token]);

  if (isValid === null) {
    // Puedes mostrar un loader aquí mientras se valida el token
    return <div>Loading...</div>;
  }

  if (!isValid) {
    return <Navigate to="/moon-medical/login" />;
  }
  if (role === "client" || role === "admin" || role === "doctor") {
    return children;
  }

  if (requiredRole && role !== requiredRole) {
    return (
      <h1 className={styles.unauthorized}>
        Usted no tiene acceso a esta sección
      </h1>
    );
  }

  return children;
};

export default ProtectedRoute;
