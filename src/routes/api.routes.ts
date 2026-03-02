import { Router } from 'express';
import { UsersController } from '../controllers/UsersController.ts';
import { LogsController } from '../controllers/LogsController.ts';
import { DevicesController } from '../controllers/DevicesController.ts';
import { JobsController } from '../controllers/JobsController.ts';
import { CommandService } from '../services/CommandService.ts';

const router = Router();

// Users
router.get('/usuarios', UsersController.list);
router.get('/usuarios/:pin', UsersController.get);
router.post('/usuarios', UsersController.create);
router.put('/usuarios/:pin', UsersController.update);
router.delete('/usuarios/:pin', UsersController.delete);
router.post('/usuarios_com_face', UsersController.createWithFace);

// Logs
router.get('/logs', LogsController.list);
router.get('/logs/:sn', LogsController.getBySn);

// Devices
router.get('/devices', DevicesController.list);
router.get('/devices/:sn', DevicesController.get);

// Jobs
router.get('/jobs/:jobId', JobsController.get);

// Manual commands
router.post('/commands/manual', async (req, res) => {
  const { sn, command } = req.body;
  if (!sn || !command) return res.status(400).json({ error: 'sn and command required' });
  await CommandService.enqueue(sn, command);
  res.json({ message: 'Command enqueued' });
});

export default router;
