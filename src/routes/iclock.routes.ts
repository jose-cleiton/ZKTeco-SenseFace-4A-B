import { Router } from 'express';
import { IclockController } from '../controllers/IclockController.ts';
import bodyParser from 'body-parser';

const router = Router();

// ZKTeco protocol uses text/plain mostly
const textParser = bodyParser.text({ type: '*/*', limit: '10mb' });

router.get('/cdata', IclockController.cdataGet);
router.post('/cdata', textParser, IclockController.cdataPost);
router.get('/getrequest', IclockController.getRequest);
router.post('/devicecmd', textParser, IclockController.deviceCmd);
router.get('/registry', IclockController.registry);
router.get('/push', IclockController.push);

export default router;
