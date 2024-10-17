import styles from './Message.module.css'; // Asegúrate de tener los estilos adecuados

const Message = ({ message, type, visible }) => {
  return (
    <div className={`${styles.message} ${styles[type]? styles[type] : ''} ${visible ? '' : styles.hidden}`}>
      {message}
    </div>
  );
};

export default Message;
