Feature: Registro de un nuevo usuario

  Scenario: Registrar un nuevo usuario con datos válidos
    Given que estoy en la página de registro
    When completo el formulario con información válida
    And presiono "Crear Usuario"
    Then debería recibir un mensaje de éxito
    And el usuario debería estar registrado en el sistema
