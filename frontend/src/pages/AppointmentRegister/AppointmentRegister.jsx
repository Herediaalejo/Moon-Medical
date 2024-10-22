import { useCallback, useContext, useEffect, useState } from "react";
import { IoSearchOutline } from "react-icons/io5";
import { FaCircleCheck } from "react-icons/fa6";

import Calendar from "react-calendar";
import "./Calendar.css";
import styles from "./AppointmentRegister.module.css"; // Aquí puedes añadir tus estilos personalizados
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal/Modal";
import { useForm } from "react-hook-form";
import useItems from "../../hooks/useItems";
import { AuthContext } from "../../components/Main/Main";
import { useNavigate } from "react-router-dom";

const AppointmentRegister = () => {
  const { token, username } = useContext(AuthContext);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectDoctor, setSelectDoctor] = useState([]);
  const [userId, setUserId] = useState(null);
  const [selectEspecialidad, setSelectEspecialidad] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [horasDisponibles, setHorasDisponibles] = useState([]);
  const [selectedHour, setSelectedHour] = useState(null);
  const [idDiasLaborales, setIdDiasLaborales] = useState([]);
  const { openModal, closeModal, modalOpen } = useModal();
  const {
    openModal: openModal2,
    closeModal: closeModal2,
    modalOpen: modalOpen2,
  } = useModal();
  const { filteredItems: doctores, getItems: getDoctores } = useItems({
    url: "http://localhost:3000/doctores",
  });
  const [filteredDoctors, setFilteredDoctors] = useState([]);
  const navigate = useNavigate();
  const {
    items: especialidades,
    getItems: getEspecialidades,
    showMessage,
  } = useItems({ url: "http://localhost:3000/doctores/especialidades" });
  const { register, watch } = useForm({
    defaultValues: {
      specialty: "Todas",
      searchTerm: "",
    },
  });
  const dias = {
    Lunes: "Lun",
    Martes: "Mar",
    Miércoles: "Mie",
    Jueves: "Jue",
    Viernes: "Vie",
    Sábado: "Sab",
    Domingo: "Dom",
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
        console.log(user);
        setUserId(user.id_usuario);
      } catch (error) {
        throw new Error(error.message);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    if (selectDoctor && Object.keys(selectDoctor).length > 0) {
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
    const filtered = doctores.filter(
      (doctor) =>
        (selectEspecialidad === "Todas" &&
          doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (doctor.id_especialidad == selectEspecialidad &&
          doctor.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    setFilteredDoctors(filtered);
  }, [selectEspecialidad, searchTerm, doctores]);

  const handleDateChange = (date) => {
    // Verifica que el valor de la fecha es diferente antes de actualizar
    if (
      (idDiasLaborales.includes(date.getDay()) &&
        date.getDate() !== selectedDate.getDate()) ||
      date.getMonth() !== selectedDate.getMonth() ||
      date.getFullYear() !== selectedDate.getFullYear()
    ) {
      setSelectedDate(date);
    }
  };

  // Función que asigna una clase CSS según la fecha seleccionada
  const tileClassName = useCallback(
    ({ date, view }) => {
      if (view === "month") {
        const diaSemana = date.getDay();
        if (
          selectedDate &&
          date.getDate() === selectedDate.getDate() &&
          date.getMonth() === selectedDate.getMonth() &&
          date.getFullYear() === selectedDate.getFullYear() &&
          idDiasLaborales.includes(diaSemana)
        ) {
          return styles.selectedDay;
        }

        if (idDiasLaborales.includes(diaSemana)) {
          return styles.availableDay;
        } else {
          return styles.unavailableDay;
        }
      }

      return styles.day;
    },
    [selectedDate, idDiasLaborales] // Solo se recalcula si cambian estos valores
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
      <div className={styles.buttonContainer}>
        <div className={styles.item}>
          <button
            className={`${styles.selectButton} button lightblue`}
            onClick={() => openModal()}
          >
            Seleccionar Médico
          </button>

          <span>
            {Object.keys(selectDoctor).length > 0
              ? selectDoctor.nombre + " " + selectDoctor.apellido
              : "Sin seleccionar"}
          </span>
        </div>
        <button
          className={`button lightblue ${styles.agendarButton}`}
          onClick={() => openModal2()}
          disabled={!selectedHour ? true : false}
        >
          Agendar
        </button>
        <div className={styles.timeItem}>
          <div className={styles.item}>
            <label>Fecha</label>
            <span className={styles.selectedDate}>
              {selectedDate.toLocaleDateString()}
            </span>
          </div>

          <div className={styles.item}>
            <label>Hora</label>
            <select onChange={(e) => setSelectedHour(e.target.value)}>
              <option value="">Seleccionar</option>
              {horasDisponibles.map((hora) => (
                <option key={hora} value={hora}>
                  {hora}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
      <div className={styles.calendarContainer}>
        <Calendar
          onChange={handleDateChange}
          value={selectedDate}
          tileClassName={tileClassName}
          className={styles.calendar}
        />
        <div className={styles.legend}>
          <span className={styles.available}>Disponible</span>
          <span className={styles.unavailable}>No Disponible</span>
          <span className={styles.selected}>Seleccionado</span>
        </div>
      </div>
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        headerColor={"#a0dbeb"}
        title={`Seleccionar Médico`}
      >
        <div className={styles.doctorContainer}>
          <div className={styles.filters}>
            <select onChange={(e) => setSelectEspecialidad(e.target.value)}>
              <option value="Todas">Todos</option>
              {especialidades.map((especialidad) => (
                <option
                  key={especialidad.id_especialidad}
                  value={especialidad.id_especialidad}
                >
                  {especialidad.nombre_especialidad}
                </option>
              ))}
            </select>
            <h2>Médicos Disponibles</h2>
            <div className={styles.search}>
              <input
                type="text"
                placeholder="Buscar por nombre..."
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button>
                <IoSearchOutline />
              </button>
            </div>
          </div>
          <div className={styles.tableContainer}>
            <table className={styles.doctorsTable}>
              <thead>
                <tr>
                  <th>Especialidad</th>
                  <th>Nombre</th>
                  <th>Disponibilidad</th>
                  <th style={{ textAlign: "center" }}>Seleccionar</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.length > 0 ? (
                  filteredDoctors.map((doctor) => (
                    <tr key={doctor.id_doctor}>
                      <td>{doctor.especialidad}</td>
                      <td>
                        {doctor.nombre} {doctor.apellido}
                      </td>
                      <td>
                        {doctor.dias_laborales.map((dia) => `${dias[dia]} `)}
                        {` ${doctor.horario_inicio.slice(
                          0,
                          5
                        )} a ${doctor.horario_fin.slice(0, 5)}`}
                      </td>
                      <td className="center">
                        <button
                          className={`${styles.checkButton}`}
                          onClick={() => {
                            setSelectDoctor(doctor);
                            closeModal();
                          }}
                        >
                          <FaCircleCheck />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="center">
                      No hay médicos disponibles
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
      <Modal
        isOpen={modalOpen2}
        onClose={closeModal2}
        headerColor={"#a0dbeb"}
        title={`Confirmar Cita Médica`}
      >
        <div className={styles.confirmContainer}>
          <div className={styles.confirmItem}>
            <label>Fecha</label>
            <span>{selectedDate.toLocaleDateString()}</span>
          </div>
          <div className={styles.confirmItem}>
            <label>Hora</label>
            <span>{selectedHour}</span>
          </div>
          <div className={styles.confirmItem}>
            <label>Dóctor/a</label>
            <span>
              {selectDoctor?.nombre} {selectDoctor?.apellido}
            </span>
          </div>
          <div className={styles.confirmItem}>
            <label>Especialidad</label>
            <span>{selectDoctor?.especialidad}</span>
          </div>
          <div className={`${styles.confirmItem} ${styles.costItem}`}>
            <label>Costo aproximado</label>
            <span>$5000</span>
          </div>
          <button
            className={`${styles.confirmButton} button green`}
            onClick={confirmAppointment}
          >
            Confirmar Cita
          </button>
        </div>
      </Modal>
    </main>
  );
};

export default AppointmentRegister;
