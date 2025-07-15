import express, { Router } from 'express';

import { UserRegistration } from '../controllers/auth.controller';

const router: Router = express.Router();

router.post('/user-registration', UserRegistration);

export default router;
