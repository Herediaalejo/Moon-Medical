import { useCallback, useContext, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import styles from "./Schedule.module.css"; // Aquí puedes añadir tus estilos personalizados
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal/Modal";
import useItems from "../../hooks/useItems";
import { AuthContext } from "../../components/Main/Main";
import { useNavigate } from "react-router-dom";
import Message from "../../components/Message/Message";
import useMessage from "../../hooks/useMessage";

const Schedule = () => {
  const { token, username } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectDoctor, setSelectDoctor] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedTurn, setSelectedTurn] = useState(null);
  const [appointmentDays, setAppointmentDays] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [idDiasLaborales, setIdDiasLaborales] = useState([]);
  const { openModal, closeModal, modalOpen } = useModal();
  const {
    openModal: openCancelModal,
    closeModal: closeCancelModal,
    modalOpen: cancelModalOpen,
  } = useModal();
  const { message, type, visible, showMessage } = useMessage();
  const { filteredItems: doctores, getItems: getDoctores } = useItems({
    url: "http://localhost:3000/doctores",
  });
  const navigate = useNavigate();
  const { items: especialidades, getItems: getEspecialidades } = useItems({
    url: "http://localhost:3000/doctores/especialidades",
  });

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

    fetchUser();
  }, []);

  useEffect(() => {
    if (doctores && Object.entries(doctores).length > 0) {
      const doctor = doctores.find((doctor) => doctor.usuario === username);
      setSelectDoctor(doctor);
    }
  }, [doctores]);

  useEffect(() => {
    if (selectDoctor && Object.keys(selectDoctor).length > 0) {
      console.log(selectDoctor);
      const diasSemana = [
        "Domingo",
        "Lunes",
        "Martes",
        "Miércoles",
        "Jueves",
        "Viernes",
        "Sábado",
      ];
      const diasLaboralesDoctor =
        selectDoctor && selectDoctor.dias_laborales
          ? selectDoctor.dias_laborales.map((dia) => diasSemana.indexOf(dia))
          : [];

      setIdDiasLaborales(diasLaboralesDoctor);

      const [hora_inicio, minuto_inicio] = selectDoctor.horario_inicio
        .split(":")
        .map(Number);
      const [hora_fin, minuto_fin] = selectDoctor.horario_fin
        .split(":")
        .map(Number);

      // Inicializamos el array de horas disponibles
      let horarios = [];

      // Creamos variables para mantener la hora y minuto actual en cada iteración
      let currentHora = hora_inicio;
      let currentMinuto = minuto_inicio;

      // Iteramos hasta que la hora actual sea igual o mayor a la hora de fin
      while (
        currentHora < hora_fin ||
        (currentHora === hora_fin && currentMinuto < minuto_fin)
      ) {
        // Formateamos la hora y minuto para que tengan el formato HH:MM
        const horaFormateada = currentHora.toString().padStart(2, "0");
        const minutoFormateado = currentMinuto.toString().padStart(2, "0");

        // Agregamos la hora formateada al array
        horarios.push(`${horaFormateada}:${minutoFormateado}`);

        // Sumamos 30 minutos
        currentMinuto += 30;

        // Si los minutos son 60 o más, reseteamos los minutos y aumentamos una hora
        if (currentMinuto >= 60) {
          currentMinuto = currentMinuto - 60;
          currentHora++;
        }
      }

      setHorasDisponibles(horarios);
    }
  }, [selectDoctor]);

  useEffect(() => {
    if (selectedDate) {
      openModal(selectedDate);
    }
  }, [selectedDate]);

  const handleDateChange = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Normaliza la fecha de hoy

    // Solo permitir seleccionar fechas a partir de hoy
    if (date > today) {
      setSelectedDate(date);
    }
  };

  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliza la fecha de hoy

        // Si la fecha es anterior a hoy, no disponible
        if (date <= today) {
          return null; // No aplicar estilo a días pasados
        }

        // Obtener el día de la semana de la fecha actual
        const diaSemana = date.getDay();

        // Verificar si el día es un día laboral
        const isDiaLaboral = idDiasLaborales.includes(diaSemana);

        if (
          selectDoctor &&
          selectDoctor.turnosOcupados &&
          selectDoctor.turnosOcupados.length > 0
        ) {
          // Formatear la fecha del día actual para comparación
          const currentDate = date?.toISOString().split("T")[0]; // 'YYYY-MM-DD'

          // Verifica si hay un turno ocupado en la misma fecha
          const hasAppointment = selectDoctor.turnosOcupados.some((cita) => {
            const appointmentDate = new Date(cita.fecha_turno)
              .toISOString()
              .split("T")[0]; // 'YYYY-MM-DD'
            return appointmentDate === currentDate;
          });

          if (hasAppointment) {
            // Agregar el día con cita agendada al estado
            setAppointmentDays((prev) => {
              if (!prev.includes(currentDate)) {
                return [...prev, currentDate];
              }
              return prev;
            });

            // Mantener el estilo para días con turnos ocupados
            return styles.selectedDay;
          }
        }

        // Si el día es laboral y no tiene un turno ocupado, aplicar estilo adicional
        if (isDiaLaboral) {
          return styles.availableDay; // Estilo para días laborales sin turno ocupado
        }
      }

      return styles.day; // Estilo por defecto para otros días
    },
    [selectDoctor, idDiasLaborales] // Se recalcula cuando selectDoctor o idDiasLaborales cambia
  );

  // Función para definir el contenido dentro de las celdas
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        const diaSemana = date.getDay();
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normaliza la fecha de hoy

        // Verifica si la fecha es hoy o en el futuro
        if (date > today && idDiasLaborales.includes(diaSemana)) {
          const horario =
            selectDoctor.horario_inicio.split(":")[0] +
            ":" +
            selectDoctor.horario_inicio.split(":")[1] +
            " a " +
            selectDoctor.horario_fin.split(":")[0] +
            ":" +
            selectDoctor.horario_fin.split(":")[1];
          return <div className={styles.inscription}>{horario}</div>;
        }
      }

      // Devuelve null si no quieres mostrar nada especial
      return null;
    },
    [idDiasLaborales, selectDoctor] // Asegúrate de incluir selectDoctor para que se actualice si cambia
  );

  const cancelAppointment = async () => {
    try {
      if (selectedTurn?.id_cita) {
        const response = await fetch(
          `http://localhost:3000/cita-medica/${selectedTurn.id_cita}`,
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

        showMessage("Cita cancelada con éxito", "success");
        closeCancelModal();
        setSelectedHour("");
        getDoctores();
      }
    } catch (error) {
      throw new Error(error.message);
    }
  };

  const reserveAppointment = async () => {
    try {
      const horario = selectedHour.split(":");
      const hora = parseInt(horario[0], 10);
      const minuto = parseInt(horario[1], 10);
      const fecha = new Date(selectedDate);
      fecha.setHours(hora);
      fecha.setMinutes(minuto);

      const data = {
        id_usuario: selectDoctor.id_usuario,
        id_doctor: selectDoctor.id_doctor,
        id_especialidad: selectDoctor.id_especialidad,
        fecha_turno: fecha.toISOString(),
        costo: 5000,
      };

      const response = await fetch("http://localhost:3000/cita-medica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al reservar el horario");
      }

      showMessage("Horario reservado con éxito", "success"); // Mostrar mensaje de éxito
      getDoctores();
      setSelectedHour("");
    } catch (error) {
      showMessage(error.message, "error"); // Mostrar mensaje de error
    }
  };

  return (
    <main className={styles.container}>
      <Message message={message} type={type} visible={visible} />
      <h2>Mi Agenda</h2>
      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          tileContent={tileContent}
          className={styles.calendar}
        />
        <div className={styles.legend}>
          <span className={styles.available}>Dia laboral</span>
          <span className={styles.selected}>Con citas agendadas</span>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        headerColor={"#a0dbeb"}
        title={`Confirmar Cita Médica`}
      >
        <div className={styles.scheduleContainer}>
          <div className={styles.confirmItem}>
            <label>Fecha</label>
            <span>
              {selectedDate?.getDate().toString().padStart(2, "0")}/
              {(selectedDate?.getMonth() + 1).toString().padStart(2, "0")}/
              {selectedDate?.getFullYear()}
            </span>
          </div>
          <div className={styles.confirmItem}>
            <h3>Horarios</h3>
            <div className={styles.schedule}>
              {horasDisponibles.map((hour) => {
                // Filtra las citas ocupadas por fecha seleccionada
                const citasDelDia = selectDoctor.turnosOcupados.filter(
                  (cita) => {
                    const appointmentDate = new Date(cita.fecha_turno);
                    // Comparar solo la fecha, ignorando la hora
                    return (
                      appointmentDate?.toISOString().split("T")[0] ===
                      selectedDate?.toISOString().split("T")[0]
                    );
                  }
                );

                // Verifica si la hora está ocupada
                const citaOcupada = citasDelDia.find((cita) => {
                  const appointmentHour = new Date(cita.fecha_turno).getHours();
                  const appointmentMinutes = new Date(
                    cita.fecha_turno
                  ).getMinutes();

                  const [availableHour, availableMinutes] = hour
                    .split(":")
                    .map(Number);

                  // Compara tanto la hora como los minutos
                  return (
                    appointmentHour === availableHour &&
                    appointmentMinutes === availableMinutes
                  );
                });

                return (
                  <div className={`${styles.hourItem}`} key={hour}>
                    <span>{hour}</span>
                    <div
                      className={`${
                        citaOcupada
                          ? citaOcupada.apellido_paciente !== "Desconocido"
                            ? styles.occupiedHour
                            : styles.reservedHour
                          : styles.availableHour
                      } ${selectedHour === hour ? styles.selectedHour : ""}`} // Añade la clase cuando está seleccionada
                      onClick={() => {
                        setSelectedHour(hour);
                        setSelectedTurn(citaOcupada);
                      }} // Maneja el evento click
                    >
                      {citaOcupada
                        ? citaOcupada.apellido_paciente !== "Desconocido"
                          ? citaOcupada.apellido_paciente
                          : "Reservado"
                        : "Disponible"}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className={styles.legend}>
              <span className={styles.available}>Con Cita</span>
              <span className={styles.unavailable}>Reservado</span>
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button
              className={`button red`}
              disabled={
                !selectedHour ||
                !selectDoctor.turnosOcupados.some((cita) => {
                  const appointmentDate = new Date(cita.fecha_turno);
                  const appointmentHour = appointmentDate.getHours();
                  const appointmentMinutes = appointmentDate.getMinutes();

                  const [selectedHourValue, selectedMinutesValue] = selectedHour
                    .split(":")
                    .map(Number);

                  // Compara tanto la hora como los minutos
                  return (
                    appointmentHour === selectedHourValue &&
                    appointmentMinutes === selectedMinutesValue &&
                    appointmentDate?.toISOString().split("T")[0] ===
                      selectedDate?.toISOString().split("T")[0]
                  );
                })
              }
              onClick={() => openCancelModal()}
            >
              Cancelar Cita
            </button>
            <button
              className={`button orange`}
              onClick={() => reserveAppointment()}
              disabled={
                !selectedHour ||
                selectDoctor.turnosOcupados.some((cita) => {
                  const appointmentDate = new Date(cita.fecha_turno);
                  const appointmentHour = appointmentDate.getHours();
                  const appointmentMinutes = appointmentDate.getMinutes();

                  const [selectedHourValue, selectedMinutesValue] = selectedHour
                    .split(":")
                    .map(Number);

                  // Compara tanto la hora como los minutos
                  return (
                    appointmentHour === selectedHourValue &&
                    appointmentMinutes === selectedMinutesValue &&
                    appointmentDate?.toISOString().split("T")[0] ===
                      selectedDate?.toISOString().split("T")[0]
                  );
                })
              }
            >
              Reservar Horario
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={cancelModalOpen}
        onClose={closeCancelModal}
        headerColor={"#DD7777"}
        title={`Cancelar Cita Médica`}
      >
        <div className="deleteContainer">
          <p>
            {selectedTurn?.nombre_paciente === "Desconocido" ||
            selectedTurn?.apellido_paciente === "Desconocido" ? (
              "¿Seguro que deseas cancelar la cita?"
            ) : (
              <>
                ¿Estás seguro de que deseas cancelar la cita <br />
                de {selectedTurn?.nombre_paciente}{" "}
                {selectedTurn?.apellido_paciente} de las{" "}
                {
                  new Date(selectedTurn?.fecha_turno)
                    .toLocaleTimeString()
                    .split(":")[0]
                }
                :
                {
                  new Date(selectedTurn?.fecha_turno)
                    .toLocaleTimeString()
                    .split(":")[1]
                }
                ?
              </>
            )}
          </p>

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
    </main>
  );
};

export default Schedule;
