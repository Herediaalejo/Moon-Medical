import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { BiSolidBell } from "react-icons/bi";
import { IoIosSettings } from "react-icons/io";
import styles from "./NavBar.module.css";
import logo from "../../assets/logo_moon-medical.png";

function NavBar() {
  const [selectedItem, setSelectedItem] = useState("INICIO");
  const [menuOpen, setMenuOpen] = useState(false);
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
  }, [location.pathname]);

  const handleItemClick = (item) => {
    setSelectedItem(item);

    const mainRoute = "/moon-medical/app";
    const routes = {
      INICIO: mainRoute,
      AGENDAR_CITA: mainRoute + "/agendar-cita",
    };
    navigate(routes[item]);
  };

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/moon-medical/login");
  };

  return (
    <nav className={styles.navbar}>
      <ul className={styles.navbar__links}>
        {["INICIO", "AGENDAR CITA"].map((item) => (
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
              <IoIosSettings className={styles.configIcon} />
              <ul className={`${styles.notificationList} `}>
                <li className={styles.notification}>
                  Se le recuerda que su cita con el Dr. Omar Tijón es el 17/10 a
                  las 13:00 hs
                </li>
              </ul>
            </div>
          </div>
        )}
        <li
          className={`${styles.navbar__item} ${styles.end}`}
          onClick={handleLogout}
        >
          CERRAR SESIÓN
        </li>
      </ul>

      <img
        src={logo}
        alt="Logo ´Moon Medical"
        className={styles.navbar__logo}
      />
    </nav>
  );
}

export default NavBar;
