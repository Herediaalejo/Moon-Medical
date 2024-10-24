Feature: Inicio de Sesión

  Scenario: Usuario inicia sesión con credenciales válidas
    Given que el usuario está registrado
    When ingreso el nombre de usuario y contraseña válidos
    Then el usuario puede acceder al sistema correctamente
