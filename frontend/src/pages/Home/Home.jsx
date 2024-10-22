import { useLocation, useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import { FaEye } from "react-icons/fa";
import logo from "../../assets/logo_moon-medical.png";
import { useContext, useEffect, useState } from "react";
import medico1 from "../../assets/medico1.jpg";
import medico2 from "../../assets/medico2.jpg";
import medico3 from "../../assets/medico3.jpg";
import medico4 from "../../assets/medico4.jpeg";
import medico5 from "../../assets/medico5.jpg";
import useMessage from "../../hooks/useMessage";
import Message from "../../components/Message/Message";
import useItems from "../../hooks/useItems";
import { AuthContext } from "../../components/Main/Main";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal/Modal";

const Home = () => {
  const { username, role } = useContext(AuthContext);
  const images = [medico1, medico2, medico3, medico4, medico5];
  const { openModal, closeModal, modalOpen, selected } = useModal();
  const {
    openModal: openCancelModal,
    closeModal: closeCancelModal,
    modalOpen: cancelModalOpen,
  } = useModal();
  const [userId, setUserId] = useState(0);
  const [citasMedicas, setCitasMedicas] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [currentIndex, setCurrentIndex] = useState(2);
  const { message, type, visible, showMessage } = useMessage();

  const fetchUser = async () => {
    try {
      const response = await fetch(
        `http://localhost:3000/usuarios/${username}`
      );
      if (!response.ok) {
        throw new Error("Error al obtener el usuario");
      }
      const user = await response.json();
      // Asegúrate de que user tenga el id_usuario antes de llamar a setUserId
      if (user && user.id_usuario) {
        setUserId(user.id_usuario);
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  const fetchCitas = async () => {
    try {
      if (userId && Number(userId)) {
        const response = await fetch(
          `http://localhost:3000/cita-medica/${userId}`
        );
        if (!response.ok) {
          throw new Error("Error al obtener las citas médicas");
        }
        const citas = await response.json();

        // Filtrar citas que no estén canceladas
        const citasFiltradas = citas.filter(
          (cita) => cita.estado !== "Cancelada"
        );

        setCitasMedicas(citasFiltradas);
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  useEffect(() => {
    fetchUser();
  }, [role]);

  useEffect(() => {
    if (role === "client") {
      fetchCitas();
    }
  }, [userId]);

  useEffect(() => {
    if (location.state?.message) {
      showMessage(location.state.message, location.state.messageType);
    }
  }, [location]);

  useEffect(() => {
    console.log("citas: ", citasMedicas);
  }, [citasMedicas]);

  useEffect(() => {
    const interval = setInterval(() => {
      goToNext();
    }, 5000);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const goToPrevious = () => {
    const newIndex = currentIndex === 0 ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const newIndex = currentIndex === images.length - 1 ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  const cancelAppointment = async () => {
    try {
      if (selected.id_cita) {
        const response = await fetch(
          "http://localhost:3000/cita-medica/" + selected.id_cita,
          {
            method: "DELETE",
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error("Error al cancelar la cita médica");
        }
        showMessage("Cita cancelada con exito", "success");

        closeCancelModal();
        closeModal();
        fetchCitas();
      }
    } catch (error) {
      showMessage(error.message, "error");
    }
  };

  return (
    <div className={styles.homeContainer}>
      <Message message={message} type={type} visible={visible} />
      <div className={styles.appointmentsContainer}>
        <h2>{role === "client" ? "Mis citas" : "Citas de hoy"}</h2>
        <div className={styles.appointmentListContainer}>
          <ul
            className={
              Object.entries(citasMedicas).length > 0
                ? styles.appointmentList
                : styles.hidden
            }
          >
            {Object.entries(citasMedicas).length > 0 &&
              citasMedicas.map((cita) => {
                const fechaTurno = new Date(cita.fecha_turno);
                const fecha =
                  fechaTurno.toLocaleDateString().split("/")[0] +
                  "/" +
                  fechaTurno.toLocaleDateString().split("/")[1];
                const hora =
                  fechaTurno.toLocaleTimeString().split(":")[0] +
                  ":" +
                  fechaTurno.toLocaleTimeString().split(":")[1];

                return (
                  <li className={styles.appointment} key={cita.id_cita}>
                    <span>
                      {cita.generoDoctor === "Masculino" ? "Dr." : "Dra."}{" "}
                      {cita.nombreDoctor} {cita.apellidoDoctor}
                    </span>
                    <span className={styles.appointment_date}>{fecha}</span>
                    <span className={styles.appointment_time}>{hora}</span>
                    <FaEye
                      className={styles.appointment_button}
                      onClick={() => openModal(cita)}
                    />
                  </li>
                );
              })}
          </ul>
          {!citasMedicas ||
            (citasMedicas.length === 0 && (
              <div className={styles.noAppointments}>
                <p>No tienes citas médicas agendadas</p>
              </div>
            ))}
        </div>
      </div>
      <div className={styles.midContainer}>
        <img className={styles.login__logo} src={logo} alt="logo" />
        <p className={styles.subtitle}>Tu salud, nuestra prioridad.</p>
        <div className={styles.carousel}>
          <div className={styles.carousel_images}>
            <button
              className={`${styles.carousel_button} ${styles.left}`}
              onClick={goToPrevious}
            >
              &#10094; {/* Flecha izquierda */}
            </button>
            {images.map((image, index) => (
              <div
                className={`${styles.carousel_image} ${
                  index === currentIndex ? styles.active : ""
                }`}
                key={index}
              >
                <img src={image} alt={`Slide ${index}`} />
              </div>
            ))}
            <button
              className={`${styles.carousel_button} ${styles.right}`}
              onClick={goToNext}
            >
              &#10095; {/* Flecha derecha */}
            </button>
            <div className={styles.carousel_dots}>
              {images.map((_, index) => (
                <span
                  key={index}
                  className={`${styles.dot} ${
                    index === currentIndex ? styles.activeDot : ""
                  }`}
                ></span>
              ))}
            </div>
          </div>
        </div>

        <button
          className={`button lightblue`}
          onClick={() => navigate("/moon-medical/app/agendar-cita")}
        >
          Agendar Cita
        </button>
      </div>
      <div className={styles.reviewsContainer}>
        <h2>Reseñas</h2>
        <div className={styles.reviews}>
          <p>
            &quot;La interfaz es muy amigable. Puedo ver mis citas de manera
            clara y gestionar mi salud sin complicaciones.&quot;
          </p>
          <p>
            &quot;Excelente atención al cliente. Siempre están disponibles para
            ayudarme con mis dudas.&quot;
          </p>
          <p>
            &quot;Una aplicación que realmente se preocupa por la salud de sus
            usuarios. ¡La amo!&quot;
          </p>
          <p>
            &quot;¡Increíble! La mejor experiencia para agendar mis citas. Todo
            es tan fácil y rápido.&quot;
          </p>
          <p>
            &quot;Los médicos son muy profesionales. Gracias a esta app, puedo
            encontrar a los mejores.&quot;
          </p>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        headerColor={"#a0dbeb"}
        title={`Cita Médica`}
      >
        <div className={styles.confirmContainer}>
          <div className={styles.confirmItem}>
            <label>Fecha</label>
            <span>{new Date(selected?.fecha_turno).toLocaleDateString()}</span>
          </div>
          <div className={styles.confirmItem}>
            <label>Hora</label>
            <span>
              {
                new Date(selected?.fecha_turno)
                  .toLocaleTimeString()
                  .split(":")[0]
              }
              :
              {
                new Date(selected?.fecha_turno)
                  .toLocaleTimeString()
                  .split(":")[1]
              }
            </span>
          </div>
          <div className={styles.confirmItem}>
            <label>Dóctor/a</label>
            <span>
              {selected?.nombreDoctor} {selected?.apellidoDoctor}
            </span>
          </div>
          <div className={styles.confirmItem}>
            <label>Especialidad</label>
            <span>{selected?.especialidad}</span>
          </div>
          <div className={`${styles.confirmItem} ${styles.costItem}`}>
            <label>Costo aproximado</label>
            <span>${selected?.costo}</span>
          </div>
          <button
            className={`${styles.confirmButton} button red`}
            onClick={openCancelModal}
          >
            Cancelar cita
          </button>
        </div>
      </Modal>
      <Modal
        isOpen={cancelModalOpen}
        onClose={closeCancelModal}
        headerColor={"#DD7777"}
        title={`Cancelar Cita Médica`}
      >
        <div className="deleteContainer">
          <p>¿Estás seguro de que deseas cancelar la cita?</p>
          <div className="deleteModalActions">
            <button onClick={cancelAppointment} className="deleteButton">
              Si
            </button>
            <button onClick={closeCancelModal} className="cancelButton">
              No
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Home;
