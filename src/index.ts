// Importa Express para crear el servidor HTTP.
import express from 'express';
// Importa dotenv para cargar variables de entorno desde un archivo .env.
import dotenv from 'dotenv';
// Importa las rutas definidas en el proyecto.
import routes from './routes/routes';

// Cargar variables de entorno (si existe un .env en la raíz).
dotenv.config();

// Crear la aplicación Express.
const app = express();
// Middleware para parsear bodies JSON en solicitudes entrantes.
app.use(express.json());

// Montar las rutas en el prefijo '/api'. Todas las rutas internas usarán ese prefijo.
app.use('/api', routes);

// Puerto configurable desde la variable de entorno `PORT`, por defecto 3000.
const port = process.env.PORT || 3000;
// Iniciar el servidor y escuchar peticiones en el puerto configurado.
app.listen(Number(port), () => {
  console.log(`BackForFrontend listening on port ${port}`);
});
