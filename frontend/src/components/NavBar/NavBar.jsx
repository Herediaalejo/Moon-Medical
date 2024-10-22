import { useState, useEffect, useContext } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiSolidBell } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo_moon-medical.png";
import Modal from "../Modal/Modal";
import { AuthContext } from "../Main/Main";

function NavBar() {
  const { role } = useContext(AuthContext);
  const [navOptions, setNavOptions] = useState(["INICIO", "AGENDAR CITA"]);
  const [selectedItem, setSelectedItem] = useState("INICIO");
  const [menuOpen, setMenuOpen] = useState(false);
  const [notiDays, setNotiDays] = useState(0);
  const [notiMenuOpen, setNotiMenuOpen] = useState(false);
  const [isHabilitadas, setIsHabilitadas] = useState(false);
  const [isSms, setIsSms] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
      setIsHabilitadas(option === "yes");
    }

    if (type === "sms") {
      setIsSms(option === "yes");
    }
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleSliderChange = (event) => {
    setNotiDays(event.target.value);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/moon-medical/login");
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
          className={`${styles.navbar__item} ${styles.navbar__icon} ${styles.mark}`}
          onClick={toggleMenu}
        >
          <BiSolidBell />
        </li>
        {menuOpen && (
          <div className={styles.backdrop} onClick={toggleMenu}>
            <div className={styles.dropdownMenu}>
              <h5 className={styles.menu__title}>Notificaciones</h5>
              <IoIosSettings
                className={styles.configIcon}
                onClick={() => setNotiMenuOpen(true)}
              />
              <ul className={`${styles.notificationList} `}>
                <li className={styles.notification}>
                  Se le recuerda que su cita con el Dr. Omar Tijón es el 17/10 a
                  las 13:00 hs
                </li>
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
            <button className={`${styles.saveButton} button green`}>
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
