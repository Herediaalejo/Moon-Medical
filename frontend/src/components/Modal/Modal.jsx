import { useState, useEffect } from "react";
import styles from "./Modal.module.css";
import { IoClose } from "react-icons/io5";

const Modal = ({ isOpen, onClose, title, children, headerColor }) => {
  const [showModal, setShowModal] = useState(isOpen);
  const [animationState, setAnimationState] = useState("");

  useEffect(() => {
    if (isOpen) {
      setShowModal(true);
      const timer = setTimeout(() => setAnimationState("visible"), 100); // Tiempo de la animación de salida

      return () => clearTimeout(timer);
    } else {
      setAnimationState("hidden");
      const timer = setTimeout(() => setShowModal(false), 500); // Tiempo de la animación de salida
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!showModal) {
    return null;
  }

  return (
    <div
      className={`${styles.backdrop} ${
        animationState === "visible" ? styles.visible : styles.hidden
      }`}
    >
      <div
        className={`${styles.container} ${
          animationState === "visible" ? styles.visible : styles.hidden
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{ backgroundColor: headerColor || "#fff" }}
          className={styles.header}
        >
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.closeButton}>
            <IoClose />
          </button>
        </div>
        <div className={styles.body}>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
