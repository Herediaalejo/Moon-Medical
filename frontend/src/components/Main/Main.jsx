import { Outlet } from "react-router-dom";
import NavBar from "../../components/NavBar/NavBar";
import styles from "./Main.module.css";
import { createContext, useEffect, useState } from "react";
import { jwtDecode } from "jwt-decode";

export const AuthContext = createContext();
const Main = () => {
  const token = localStorage.getItem("authToken");

  const [username, setUsername] = useState("");

  useEffect(() => {
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setUsername(decodedToken.username || "Usuario");
      } catch (error) {
        console.error("Error al decodificar el token", error);
        setUsername("Usuario");
      }
    } else {
      setUsername("Usuario");
    }
  }, [token]);

  return (
    <AuthContext.Provider value={{ token, username }}>
      <NavBar page={"INICIO"} />
      <Outlet />
    </AuthContext.Provider>
  );
};

export default Main;
