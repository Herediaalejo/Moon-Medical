import { useNavigate } from "react-router-dom";
import styles from "./Home.module.css";
import logo from "../../assets/logo_moon-medical.png";
import { useState } from "react";
import medico1 from "../../assets/medico1.jpg";
import medico2 from "../../assets/medico2.jpg";
import medico3 from "../../assets/medico3.jpg";
import medico4 from "../../assets/medico4.jpeg";
import medico5 from "../../assets/medico5.jpg";

const Home = () => {
  const images = [medico1, medico2, medico3, medico4, medico5];
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(2);

  const goToPrevious = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? images.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const goToNext = () => {
    const isLastSlide = currentIndex === images.length - 1;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div className={styles.homeContainer}>
      <div className={styles.appointmentsContainer}>
        <h2>Mis Citas</h2>
        <div className={styles.appointments}>
          <p>No tiene citas agendadas.</p>
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
          onClick={() => navigate("/order-tracker/pedidos")}
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
    </div>
  );
};

export default Home;
