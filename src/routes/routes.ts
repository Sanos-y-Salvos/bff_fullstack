import { Router } from 'express';
import proxyHandler from '../middleware/proxy';

const router = Router();

// Proxy all auth endpoints
router.all('/auth/*', proxyHandler('AUTH_URL', 'http://localhost:3001'));
router.all('/auth', proxyHandler('AUTH_URL', 'http://localhost:3001'));

// Proxy all users endpoints
router.all('/users/*', proxyHandler('USERS_URL', 'http://localhost:3002'));
router.all('/users', proxyHandler('USERS_URL', 'http://localhost:3002'));

// Proxy all reportes endpoints
router.all('/reportes/*', proxyHandler('REPORTS_URL', 'http://localhost:3003'));
router.all('/reportes', proxyHandler('REPORTS_URL', 'http://localhost:3003'));

export default router;
