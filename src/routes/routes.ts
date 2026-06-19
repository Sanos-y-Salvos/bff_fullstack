import { Router } from 'express';
import proxyHandler from '../middleware/proxy';

const router = Router();

// Proxy all auth endpoints
router.all('/auth/*', proxyHandler('AUTH_URL', 'http://localhost:3001'));
router.all('/auth', proxyHandler('AUTH_URL', 'http://localhost:3001'));

// Proxy all users endpoints
router.all('/users/*', proxyHandler('USERS_URL', 'http://localhost:3002'));
router.all('/users', proxyHandler('USERS_URL', 'http://localhost:3002'));

// Proxy mascotas — strip /mascotas prefix so ms_mascotas receives /reportes/...
router.all('/mascotas/*', proxyHandler('MASCOTAS_URL', 'http://localhost:3003', '/mascotas'));
router.all('/mascotas', proxyHandler('MASCOTAS_URL', 'http://localhost:3003', '/mascotas'));

// Proxy localizacion — strip /localizacion prefix so ms-localizacion receives /mapa/...
router.all('/localizacion/*', proxyHandler('LOCALIZACION_URL', 'http://localhost:3004', '/localizacion'));
router.all('/localizacion', proxyHandler('LOCALIZACION_URL', 'http://localhost:3004', '/localizacion'));

// Proxy all reportes endpoints (legacy BFF path kept for backward compatibility)
router.all('/reportes/*', proxyHandler('MASCOTAS_URL', 'http://localhost:3003'));
router.all('/reportes', proxyHandler('MASCOTAS_URL', 'http://localhost:3003'));

// Proxy all soporte (tickets + chatbot) endpoints
router.all('/tickets/*', proxyHandler('SOPORTE_URL', 'http://localhost:3005'));
router.all('/tickets', proxyHandler('SOPORTE_URL', 'http://localhost:3005'));
router.all('/chatbot/*', proxyHandler('SOPORTE_URL', 'http://localhost:3005'));
router.all('/chatbot', proxyHandler('SOPORTE_URL', 'http://localhost:3005'));

export default router;
