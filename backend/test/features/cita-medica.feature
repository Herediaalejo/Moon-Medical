Feature: Agendar Cita Médica

  Scenario: Agendar cita con médico disponible
    Given que el paciente está autenticado en el sistema
    And el médico tiene disponibilidad en su agenda
    When selecciono un médico disponible y agendo una cita
    Then la cita se agenda correctamente


Feature: Cancelar Cita Médica

  Scenario: Cancelar cita programada
    Given que el paciente tiene agendada una cita
    When selecciono "Cancelar Cita" y confirmo la cancelación
    Then la cita se cancela correctamente