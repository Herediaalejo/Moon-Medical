import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo_moon-medical.png";
import styles from "./Recovery.module.css";

function Recovery() {
  const { register, handleSubmit } = useForm();
  const [error, setError] = useState("");
  const [validEmail, setValidEmail] = useState(false);
  const [userId, setUserId] = useState(null);
  const navigate = useNavigate();

  const mostrarError = (errorMessage) => {
    setError(errorMessage);
  };

  useEffect(() => {
    if (error) {
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  }, [error]);

  const onSubmitEmail = async (data) => {
    try {
      const { correo_electronico } = data;
      if (correo_electronico === "") {
        throw new Error("Debe proporcionar un correo electrónico");
      }

      const response = await fetch(
        "http://localhost:3000/usuarios/verificar-correo",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ correo_electronico }),
        }
      );

      if (!response.ok) {
        throw new Error("Error al enviar el correo de recuperación");
      }

      const { id_usuario } = await response.json();
      setUserId(id_usuario);

      setValidEmail(true);
    } catch (error) {
      mostrarError(error.message);
    }
  };

  const onSubmitPassword = async (data) => {
    try {
      const { newPassword, repeatNewPassword } = data;
      console.log(newPassword, repeatNewPassword);

      if (newPassword === "" || repeatNewPassword === "") {
        throw new Error("Todos los campos son obligatorios");
      }

      if (newPassword !== repeatNewPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      const response = await fetch(`http://localhost:3000/usuarios/${userId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ contrasena: newPassword }),
      });

      if (!response.ok) {
        throw new Error("Error al cambiar la contraseña");
      }

      navigate("moon-medical/login", {
        state: {
          message: "Contraseña actualizada con exito",
          messageType: "success",
        },
      });
    } catch (error) {
      mostrarError(error.message);
    }
  };

  return (
    <div className={styles.body}>
      <main className={styles.login}>
        <img className={styles.login__logo} src={logo} alt="logo" />
        {validEmail && (
          <form
            onSubmit={handleSubmit(onSubmitPassword)}
            className={styles.login__form}
            id="loginForm"
          >
            <div className={styles.login__formItem}>
              <label className={styles.login__label} htmlFor="newpassword">
                Nueva Contraseña
              </label>
              <input
                type="password"
                className={`${styles.login__input} ${styles.smaller}`}
                id="newpassword"
                name="newpassword"
                autoComplete="off"
                {...register("newPassword")}
              />
              <label
                className={styles.login__label}
                htmlFor="repeatNewpassword"
              >
                Confirmar Contraseña
              </label>
              <input
                type="password"
                className={`${styles.login__input} ${styles.smaller}`}
                id="repeatNewpassword"
                name="repeatNewpassword"
                autoComplete="off"
                {...register("repeatNewPassword")}
              />
              <div className={styles.login__buttonContainer}>
                <button
                  className={` ${styles.login__button} ${styles.bigger}`}
                  type="submit"
                >
                  Confirmar
                </button>
              </div>
              <p className={`${styles.error} ${error ? styles.visible : ""}`}>
                {error}
              </p>
            </div>
          </form>
        )}
        {!validEmail && (
          <form
            onSubmit={handleSubmit(onSubmitEmail)}
            className={styles.login__form}
            id="loginForm"
          >
            <p className={styles.recoveryMessage}>
              Por favor, introduzca su correo electrónico para restablecer la
              contraseña.
            </p>
            <div className={styles.login__formItem}>
              <label className={styles.login__label} htmlFor="correo">
                Correo Electrónico
              </label>
              <input
                type="email"
                className={styles.login__input}
                id="correo"
                name="correo"
                autoComplete="off"
                {...register("correo_electronico")}
              />
              <p className={`${styles.error} ${error ? styles.visible : ""}`}>
                {error}
              </p>
              <div className={styles.login__buttonContainer}>
                <button className={styles.login__button} type="submit">
                  Enviar
                </button>
              </div>
            </div>
            <p className={styles.recoveryMessage}>
              Si coincide con una cuenta registrada, recibirá un correo de
              recuperación.
            </p>
          </form>
        )}
      </main>
    </div>
  );
}

export default Recovery;
