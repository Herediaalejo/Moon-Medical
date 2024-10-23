import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiSolidBell } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo_moon-medical.png";
import Modal from "../Modal/Modal";
import { AuthContext } from "../Main/Main";

function NavBar() {
  const { role, username } = useContext(AuthContext);
  const [navOptions, setNavOptions] = useState(["INICIO", "AGENDAR CITA"]);
  const [selectedItem, setSelectedItem] = useState("INICIO");
  const [menuOpen, setMenuOpen] = useState(false);
  const [userId, setUserId] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [notiDays, setNotiDays] = useState(0);
  const [notiMenuOpen, setNotiMenuOpen] = useState(false);
  const [isHabilitadas, setIsHabilitadas] = useState(false);
  const [isSms, setIsSms] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const fetchNotificaciones = async () => {
    try {
      console.log("Ejecutando fetchNotificaciones");
      const response = await fetch(
        `http://localhost:3000/cita-medica/notificaciones/${userId}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener las citas médicas");
      }
      const notificaciones = await response.json();
      const notificacionesFiltradas = notificaciones.filter(
        (noti) => !noti.eliminada
      );
      setNotifications(notificacionesFiltradas);
    } catch (error) {
      throw new Error(error.message);
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/usuarios/${username}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener el usuario");
        }
        const user = await response.json();
        setUserId(user.id_usuario);
      } catch (error) {
        throw new Error(error.message);
      }
    };
    if (username !== undefined) {
      fetchUser();
    }
  }, [username, location.pathname]);

  useEffect(() => {
    if (userId && Number(userId)) {
      fetchNotificaciones();
    }
  }, [userId, location.pathname]);

  useEffect(() => {
    const savedHabilitadas = localStorage.getItem("notificaciones_habilitadas");
    const savedSms = localStorage.getItem("modo_envio");
    const savedNotiDays = localStorage.getItem("noti_days");

    if (savedHabilitadas) {
      setIsHabilitadas(JSON.parse(savedHabilitadas));
    }
    if (savedSms) {
      setIsSms(JSON.parse(savedSms));
    }
    if (savedNotiDays) {
      setNotiDays(Number(savedNotiDays));
    }
  }, []);

  useEffect(() => {
    const pathname = location.pathname;

    if (pathname.startsWith("/moon-medical/app/home")) {
      setSelectedItem("INICIO");
    }
    if (pathname.startsWith("/moon-medical/app/agendar-cita")) {
      setSelectedItem("AGENDAR CITA");
    }
    if (pathname.startsWith("/moon-medical/app/registrar-doctor")) {
      setSelectedItem("REGISTRAR DOCTOR");
    }
    if (pathname.startsWith("/moon-medical/app/mi-agenda")) {
      setSelectedItem("MI AGENDA");
    }
  }, [location.pathname]);

  useEffect(() => {
    if (role === "client") {
      setNavOptions(["INICIO", "AGENDAR CITA"]);
    }
    if (role === "admin") {
      setNavOptions(["INICIO", "REGISTRAR DOCTOR"]);
    }
    if (role === "doctor") {
      setNavOptions(["INICIO", "MI AGENDA"]);
    }
  }, [role]);

  const handleItemClick = (item) => {
    setSelectedItem(item);

    const mainRoute = "/moon-medical/app";
    const routes = {
      INICIO: mainRoute,
      "AGENDAR CITA": mainRoute + "/agendar-cita",
      "REGISTRAR DOCTOR": mainRoute + "/registrar-doctor",
      "MI AGENDA": mainRoute + "/mi-agenda",
    };
    navigate(routes[item]);
  };

  const closeNotiMenu = () => {
    setNotiMenuOpen(false);
  };

  const handleToggle = (option, type) => {
    if (type === "habilitadas") {
      const newValue = option === "yes";
      setIsHabilitadas(newValue);
      localStorage.setItem(
        "notificaciones_habilitadas",
        JSON.stringify(newValue)
      );
    }

    if (type === "sms") {
      const newValue = option === "yes";
      setIsSms(newValue);
      localStorage.setItem("modo_envio", JSON.stringify(newValue));
    }
  };

  const handleSliderChange = (event) => {
    const newValue = Number(event.target.value);
    setNotiDays(newValue);
    localStorage.setItem("noti_days", newValue);
  };

  const toggleMenu = async () => {
    setMenuOpen(!menuOpen);
    const noLeidas = notifications.some((noti) => !noti.leida);

    if (noLeidas) {
      setNotifications((prev) => {
        return prev.map((noti) => {
          return { ...noti, leida: true }; // Cambia 'noti.leida' a 'leida'
        });
      });

      const idsToUpdate = notifications
        .filter((noti) => !noti.leida)
        .map((noti) => noti.id_notificacion);

      try {
        // Envía una solicitud PUT o PATCH a tu API
        const response = await fetch(
          `http://localhost:3000/cita-medica/notificaciones`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ ids: idsToUpdate, leida: true }),
          }
        );

        if (!response.ok) {
          throw new Error("Error al actualizar las notificaciones");
        }

        // Si necesitas hacer algo después de la actualización exitosa
        console.log("Notificaciones actualizadas con éxito");
      } catch (error) {
        console.error("Error al actualizar las notificaciones:", error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/moon-medical/login");
  };

  const deleteNotification = async (id) => {
    try {
      const response = await fetch(
        `http://localhost:3000/cita-medica/notificaciones/${id}`,
        {
          method: "DELETE",
        }
      );
      if (!response.ok) {
        throw new Error("Error al eliminar la notificación");
      }

      fetchNotificaciones();
    } catch (error) {
      console.error("Error al eliminar la notificación:", error);
    }
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbar__links}>
        {navOptions.map((item) => (
          <li
            key={item}
            className={`${styles.navbar__item} ${
              selectedItem === item ? styles.selected : ""
            }`}
            onClick={() => handleItemClick(item)}
          >
            {item}
          </li>
        ))}
        <li
          className={`${styles.navbar__item} ${styles.navbar__icon} ${
            notifications.some((noti) => !noti.leida) && styles.mark
          }`}
          onClick={toggleMenu}
        >
          <BiSolidBell />
        </li>
        {menuOpen && (
          <div className={styles.backdrop} onClick={toggleMenu}>
            <div
              className={styles.dropdownMenu}
              onClick={(e) => e.stopPropagation()}
            >
              <h5 className={styles.menu__title}>Notificaciones</h5>
              <IoIosSettings
                className={styles.configIcon}
                onClick={() => setNotiMenuOpen(true)}
              />
              <ul className={`${styles.notificationList} `}>
                {notifications && notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <li
                      className={styles.notification}
                      key={notification.id_notificacion}
                      onClick={() =>
                        deleteNotification(notification.id_notificacion)
                      }
                    >
                      {notification.mensaje}
                    </li>
                  ))
                ) : (
                  <p className={styles.noNotifications}>
                    No hay notificaciones
                  </p>
                )}
              </ul>
            </div>
          </div>
        )}
        <Modal
          isOpen={notiMenuOpen}
          onClose={closeNotiMenu}
          headerColor={"#a0dbeb"}
          title={`Configuración de notificaciones`}
        >
          <div className={styles.notiOptions}>
            <div className={styles.notiOption}>
              <p>Notificaciones habilitadas</p>
              <div className="slider-container">
                <button
                  className={`${styles.slider_button} ${
                    !isHabilitadas ? styles.active : ""
                  }`}
                  onClick={() => handleToggle("no", "habilitadas")}
                >
                  NO
                </button>
                <button
                  className={` ${styles.slider_button} ${
                    isHabilitadas ? styles.active : ""
                  }`}
                  onClick={() => handleToggle("yes", "habilitadas")}
                >
                  SI
                </button>
              </div>
            </div>
            <div className={styles.notiOption}>
              <p>Modo de envío</p>
              <div className="slider-container">
                <button
                  className={`${styles.slider_button} ${
                    isSms ? styles.active : ""
                  }`}
                  onClick={() => handleToggle("yes", "sms")}
                >
                  SMS
                </button>
                <button
                  className={` ${styles.slider_button} ${
                    !isSms ? styles.active : ""
                  }`}
                  onClick={() => handleToggle("no", "sms")}
                >
                  EMAIL
                </button>
              </div>
            </div>
            <div className={styles.notiOption}>
              <p>Recordar cita antes de </p>
              <div className={styles.range_slider_container}>
                <h3>Día/s</h3>
                <input
                  type="range"
                  min="1"
                  max="5"
                  step="1"
                  value={notiDays}
                  onChange={handleSliderChange}
                  className={styles.slider}
                />
                <div className={styles.range_ticks}>
                  {[1, 2, 3, 4, 5].map((tick) => (
                    <span
                      key={tick}
                      className={` ${tick} ${
                        notiDays == tick ? styles.active : ""
                      }`}
                    >
                      {tick}
                    </span>
                  ))}
                </div>
              </div>
              <p> antes.</p>
            </div>
            <button
              className={`${styles.saveButton} button green`}
              onClick={() => closeNotiMenu()}
            >
              Guardar Cambios
            </button>
          </div>
        </Modal>
        <li
          className={`${styles.navbar__item} ${styles.end}`}
          onClick={handleLogout}
        >
          CERRAR SESIÓN
        </li>
      </ul>

      <img src={logo} alt="Logo Moon Medical" className={styles.navbar__logo} />
    </nav>
  );
}

export default NavBar;
