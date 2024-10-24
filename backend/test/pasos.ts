// pasos.ts
import { Given, When, Then } from '@cucumber/cucumber';
import request from 'supertest';
import app from '../app'; // Tu aplicación Express

let response: any;

Given('que existe la interfaz de registro', async () => {
  // Aquí podrías inicializar cualquier cosa necesaria
});

When('completo el formulario con información personal válida', async () => {
  response = await request(app)
    .post('/api/usuarios/register') // Asegúrate de que esta ruta es la correcta
    .send({
      nombre: 'Juan',
      apellido: 'Pérez',
      email: 'juan@example.com',
      password: 'password123',
    });
});

Then('el sistema crea el usuario y muestra un mensaje de éxito', () => {
  expect(response.status).toBe(201); // Verifica que el estado sea 201 (Creado)
  expect(response.body.msg).toBe('Usuario creado con éxito'); // Ajusta el mensaje esperado según tu lógica
});
