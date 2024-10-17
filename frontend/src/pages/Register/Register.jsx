import { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { IoArrowBackCircle } from "react-icons/io5";
import logo from "../../assets/logo_moon-medical.png";
import avatar from "../../assets/avatar.png";
import styles from "./Register.module.css";

function Register() {
  const { register, handleSubmit } = useForm();
  const [validData, setValidData] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const mostrarError = (errorMessage) => {
    setError(errorMessage);
  };

  const onSubmitPersonalData = async (data) => {
    try {
      console.log(data);
      const {
        nombre,
        apellido,
        genero,
        documento,
        fecha_nacimiento,
        correo_electronico,
        telefono,
        direccion,
      } = data;

      if (
        nombre === "" ||
        apellido === "" ||
        genero === "" ||
        documento === "" ||
        fecha_nacimiento === "" ||
        correo_electronico === "" ||
        telefono === "" ||
        direccion === ""
      ) {
        setValidData(false);
        throw new Error("Todos los campos son obligatorios");
      }

      if (documento.length !== 8) {
        setValidData(false);
        throw new Error("El documento debe contener 8 caractéres");
      }

      setValidData(true);
      setError("");
    } catch (error) {
      mostrarError(error.message);
    }
  };
  const onSubmitCredentials = async (data) => {
    try {
      const { username, password, repeatpassword, ...personalData } = data;

      if (username === "" || password === "" || repeatpassword === "") {
        setError("Todos los campos son obligatorios");
        return;
      }

      if (password !== repeatpassword) {
        setError("Las contraseñas no coinciden");
        return;
      }

      if (username.length < 4) {
        setError("El nombre de usuario debe tener al menos 4 caracteres");
        return;
      }

      if (password.length < 8) {
        setError("La contraseña debe tener al menos 8 caracteres");
        return;
      }
      const response = await fetch("http://localhost:3000/usuarios/registrar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: username,
          contrasena: password,
          rol: "client",
          ...personalData,
        }),
      });

      if (response.ok) {
        navigate("/moon-medical/login", {
          state: {
            message: "Usuario registrado con éxito",
            messageType: "success",
          },
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message);
      }
    } catch (error) {
      mostrarError(error.message);
    }
  };

  return (
    <div className={styles.body}>
      <main className={`${styles.register} ${validData ? styles.second : ""}`}>
        <img className={styles.register__logo} src={logo} alt="logo" />
        <button
          className={styles.backButton}
          onClick={
            validData
              ? () => setValidData(false)
              : () => navigate("/moon-medical/login")
          }
        >
          <IoArrowBackCircle />
        </button>
        {!validData && (
          <form
            onSubmit={handleSubmit(onSubmitPersonalData)}
            className={styles.register__form}
            id="loginForm"
          >
            <div className={styles.register__container}>
              <div className={styles.flexContainer}>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="nombre">
                    Nombre
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="nombre"
                    name="nombre"
                    autoComplete="off"
                    {...register("nombre")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="apellido">
                    Apellido
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="apellido"
                    name="apellido"
                    autoComplete="off"
                    {...register("apellido")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="genero">
                    Género
                  </label>
                  <select
                    className={styles.register__input}
                    id="genero"
                    name="genero"
                    autoComplete="off"
                    {...register("genero")}
                  >
                    <option value=""></option>
                    <option value="Masculino">Masculino</option>
                    <option value="Femenino">Femenino</option>
                    <option value="Otro">Otro</option>
                  </select>
                </div>
              </div>
              <div className={styles.flexContainer}>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="documento">
                    Número de documento
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="documento"
                    name="documento"
                    autoComplete="off"
                    {...register("documento")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label
                    className={styles.register__label}
                    htmlFor="nacimiento"
                  >
                    Fecha de nacimiento
                  </label>
                  <input
                    type="date"
                    className={styles.register__input}
                    id="nacimiento"
                    name="nacimiento"
                    autoComplete="off"
                    {...register("fecha_nacimiento")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="correo">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    className={styles.register__input}
                    id="correo"
                    name="correo"
                    autoComplete="off"
                    {...register("correo_electronico")}
                  />
                </div>
              </div>
              <div className={styles.flexContainer}>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="telefono">
                    Telefono
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="telefono"
                    name="telefono"
                    autoComplete="off"
                    {...register("telefono")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="direccion">
                    Dirección
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="direccion"
                    name="direccion"
                    autoComplete="off"
                    {...register("direccion")}
                  />
                </div>
                <button className={styles.register__button} type="submit">
                  Siguiente
                </button>
              </div>
            </div>
          </form>
        )}

        {validData && (
          <form
            onSubmit={handleSubmit(onSubmitCredentials)}
            className={`${styles.register__form} ${validData ? "second" : ""}`}
            id="loginForm"
          >
            <div
              className={`${styles.register__container} ${
                validData ? styles.second : ""
              }`}
            >
              <div className={styles.flexContainer}>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="username">
                    Nombre de Usuario
                  </label>
                  <input
                    type="text"
                    className={styles.register__input}
                    id="username"
                    name="username"
                    autoComplete="off"
                    {...register("username")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label className={styles.register__label} htmlFor="password">
                    Contraseña
                  </label>
                  <input
                    type="password"
                    className={styles.register__input}
                    id="password"
                    name="password"
                    autoComplete="off"
                    {...register("password")}
                  />
                </div>
                <div className={styles.register__formItem}>
                  <label
                    className={styles.register__label}
                    htmlFor="repeatpassword"
                  >
                    Confirmar Contraseña
                  </label>
                  <input
                    className={styles.register__input}
                    type="password"
                    id="repeatpassword"
                    name="repeatpassword"
                    autoComplete="off"
                    {...register("repeatpassword")}
                  />
                </div>
              </div>
              <div className={styles.flexContainer}>
                <img className={styles.register__avatar} src={avatar}></img>

                <button className={styles.register__button} type="submit">
                  Crear Usuario
                </button>
              </div>
            </div>
          </form>
        )}

        <p className={`${styles.error} ${error ? styles.visible : ""}`}>
          {error}
        </p>
      </main>
    </div>
  );
}

export default Register;
