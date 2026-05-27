// Importa el enrutador de Express y el middleware proxy que reenvía peticiones.
import { Router } from 'express';
import proxyHandler from '../middleware/proxy';

const router = Router();

// Rutas que se van a proxear al servicio de autenticación.
// `router.all` captura todos los métodos HTTP (GET, POST, etc.).
router.all('/auth/*', proxyHandler('AUTH_URL', 'http://localhost:3001'));
router.all('/auth', proxyHandler('AUTH_URL', 'http://localhost:3001'));

// Rutas que se van a proxear al servicio de usuarios.
router.all('/users/*', proxyHandler('USERS_URL', 'http://localhost:3002'));
router.all('/users', proxyHandler('USERS_URL', 'http://localhost:3002'));

// Rutas que se van a proxear al servicio de reportes/mascotas.
router.all('/reportes/*', proxyHandler('REPORTS_URL', 'http://localhost:3003'));
router.all('/reportes', proxyHandler('REPORTS_URL', 'http://localhost:3003'));

// Exportar el router configurado para montarlo en la app principal.
export default router;
