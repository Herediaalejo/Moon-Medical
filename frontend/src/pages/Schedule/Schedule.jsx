import { useCallback, useContext, useEffect, useState } from "react";
import Calendar from "react-calendar";
import "./Calendar.css";
import styles from "./Schedule.module.css"; // Aquí puedes añadir tus estilos personalizados
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal/Modal";
import useItems from "../../hooks/useItems";
import { AuthContext } from "../../components/Main/Main";
import { useNavigate } from "react-router-dom";

const Schedule = () => {
  const { token, username } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectDoctor, setSelectDoctor] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectedHour, setSelectedHour] = useState(null);
  const [appointmentDays, setAppointmentDays] = useState([]);
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [idDiasLaborales, setIdDiasLaborales] = useState([]);
  const { openModal, closeModal, modalOpen } = useModal();
  const { filteredItems: doctores, getItems: getDoctores } = useItems({
    url: "http://localhost:3000/doctores",
  });
  const navigate = useNavigate();
  const {
    items: especialidades,
    getItems: getEspecialidades,
    showMessage,
  } = useItems({ url: "http://localhost:3000/doctores/especialidades" });

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
    const selectedDateString = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

    if (appointmentDays.includes(selectedDateString)) {
      setSelectedDate(date);
    }
  };

  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        if (
          selectDoctor &&
          selectDoctor.turnosOcupados &&
          selectDoctor.turnosOcupados.length > 0
        ) {
          // Formatear la fecha del día actual para comparación
          const currentDate = date.toISOString().split("T")[0]; // 'YYYY-MM-DD'

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

            return styles.selectedDay; // Estilo para días con turnos ocupados
          }
        }
      }

      return styles.day; // Estilo por defecto
    },
    [selectDoctor] // Solo se recalcula si selectDoctor cambia
  );

  // Función para definir el contenido dentro de las celdas
  const tileContent = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        const diaSemana = date.getDay();

        // Aquí decides qué mostrar como inscripción
        if (idDiasLaborales.includes(diaSemana)) {
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
    [idDiasLaborales]
  );

  const confirmAppointment = async () => {
    try {
      const horario = selectedHour.split(":");
      const hora = parseInt(horario[0], 10);
      const minuto = parseInt(horario[1], 10);
      const fecha = new Date(selectedDate);
      fecha.setHours(hora);
      fecha.setMinutes(minuto);

      const data = {
        id_usuario: userId,
        id_doctor: selectDoctor.id_doctor,
        id_especialidad: selectDoctor.id_especialidad,
        fecha_turno: fecha.toISOString(),
        costo: 5000,
      };
      console.log(data);

      const response = await fetch("http://localhost:3000/cita-medica", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Error al agendar la cita");
      }

      navigate("/moon-medical/app/home", {
        state: {
          message: "Cita agendada con éxito",
          messageType: "success",
        },
      });
    } catch (error) {
      throw new Error(error.message);
    }
  };

  return (
    <main className={styles.container}>
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
              {selectedDate?.getMonth().toString().padStart(2, "0")}/
              {selectedDate?.getFullYear()}
            </span>
          </div>
          <div className={styles.confirmItem}>
            <h3>Horarios</h3>
            <div className={styles.schedule}>
              {horasDisponibles.map((hour) => {
                // Verifica si la hora está ocupada
                const citaOcupada = selectDoctor.turnosOcupados.find((cita) => {
                  const appointmentHour = new Date(cita.fecha_turno).getHours();
                  return appointmentHour === parseInt(hour.split(":")[0], 10); // Compara la hora
                });

                return (
                  <div className={`${styles.hourItem} `} key={hour}>
                    <span>{hour}</span>
                    <div
                      className={`${
                        citaOcupada ? styles.occupiedHour : styles.availableHour
                      } ${selectedHour === hour ? styles.selectedHour : ""}`} // Añade la clase cuando está seleccionada
                      onClick={() => setSelectedHour(hour)} // Maneja el evento click
                    >
                      {citaOcupada
                        ? citaOcupada.apellido_paciente
                        : "Disponible"}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className={styles.buttonContainer}>
            <button className={`${styles.confirmButton} button red`}>
              Cancelar Cita
            </button>
            <button className={`${styles.confirmButton} button orange`}>
              Reservar Horario
            </button>
          </div>
        </div>
      </Modal>
    </main>
  );
};

export default Schedule;
