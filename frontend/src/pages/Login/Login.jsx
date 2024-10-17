import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useLocation, useNavigate } from "react-router-dom";
import logo from "../../assets/logo_moon-medical.png";
import styles from "./Login.module.css";
import Message from "../../components/Message/Message";
import useMessage from "../../hooks/useMessage";

function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const location = useLocation();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { message, type, visible, showMessage } = useMessage();

  useEffect(() => {
    if (location.state?.message) {
      showMessage(location.state.message, location.state.messageType);
    }
  }, [location]);

  const mostrarError = (errorMessage) => {
    setError(errorMessage);
  };

  const onSubmit = async (data) => {
    try {
      const loginData = {
        usuario: data.username,
        contrasena: data.password,
      };

      if (loginData.nombre_usuario === "" || loginData.contrasena === "") {
        throw new Error("Todos los campos son obligatorios");
      }

      const response = await fetch("http://localhost:3000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(loginData),
      });

      if (!response.ok) {
        throw new Error("Credenciales incorrectas");
      }
      const responseData = await response.json();
      console.log(responseData);

      if (!responseData || !responseData.access_token) {
        throw new Error("Credenciales incorrectas");
      }

      const { access_token } = responseData;

      localStorage.removeItem("authToken");
      localStorage.setItem("authToken", access_token);

      navigate("/moon-medical/home");
    } catch (error) {
      mostrarError(error.message);
    }
  };

  return (
    <div className={styles.body}>
      <Message message={message} type={type} visible={visible} />
      <main className={styles.login}>
        <img className={styles.login__logo} src={logo} alt="logo" />
        <form
          onSubmit={handleSubmit(onSubmit)}
          className={styles.login__form}
          id="loginForm"
        >
          <label className={styles.login__label} htmlFor="username">
            Usuario
          </label>
          <input
            type="text"
            className={styles.login__input}
            id="username"
            name="username"
            autoComplete="off"
            {...register("username")}
          />
          <label className={styles.login__label} htmlFor="password">
            Contraseña
          </label>
          <input
            type="password"
            className={styles.login__input}
            id="password"
            name="password"
            {...register("password")}
          />
          <small
            className={styles.login__forgot}
            onClick={() => navigate("/moon-medical/recuperar-cuenta")}
          >
            ¿Olvidó su contraseña?
          </small>
          <p className={`${styles.error} ${error ? styles.visible : ""}`}>
            {error}
          </p>
          <div className={styles.login__buttonContainer}>
            <button className={styles.login__button} type="submit">
              Ingresar
            </button>
            <button
              className={`${styles.login__button} ${styles.register}`}
              type="submit"
              onClick={() => navigate("/moon-medical/register")}
            >
              Registrarse
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default Login;
