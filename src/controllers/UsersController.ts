import { Request, Response } from 'express';
import { UsersOnDeviceService } from '../services/UsersOnDeviceService.ts';

export class UsersController {
  static async list(req: Request, res: Response) {
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.listUsers(sn);
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') {
      return res.json(JSON.parse(job.result_json || '[]'));
    }
    return res.status(202).json({ jobId: job.id, status: job.status });
  }

  static async get(req: Request, res: Response) {
    const { pin } = req.params;
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.getUser(sn, pin);
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') {
      const users = JSON.parse(job.result_json || '[]');
      return res.json(users[0] || null);
    }
    return res.status(202).json({ jobId: job.id, status: job.status });
  }

  static async create(req: Request, res: Response) {
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.upsertUser(sn, req.body);
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') return res.json({ message: 'User created/updated' });
    return res.status(202).json({ jobId: job.id, status: job.status });
  }

  static async update(req: Request, res: Response) {
    const { pin } = req.params;
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.upsertUser(sn, { ...req.body, pin });
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') return res.json({ message: 'User updated' });
    return res.status(202).json({ jobId: job.id, status: job.status });
  }

  static async delete(req: Request, res: Response) {
    const { pin } = req.params;
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.deleteUser(sn, pin);
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') return res.json({ message: 'User deleted' });
    return res.status(202).json({ jobId: job.id, status: job.status });
  }

  static async createWithFace(req: Request, res: Response) {
    const sn = req.query.sn as string;
    if (!sn) return res.status(400).json({ error: 'SN required' });

    const job = await UsersOnDeviceService.upsertUserWithFace(sn, req.body);
    if (!job) return res.status(500).json({ error: 'Failed to create job' });

    if (job.status === 'done') return res.json({ message: 'User and face created' });
    return res.status(202).json({ jobId: job.id, status: job.status });
  }
}
