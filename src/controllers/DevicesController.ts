import { Request, Response } from 'express';
import { DeviceRepository } from '../repositories/DeviceRepository.ts';
import { isOnline } from '../utils/time.ts';
import dotenv from 'dotenv';

dotenv.config();
const ONLINE_SEC = parseInt(process.env.DEVICE_ONLINE_SECONDS || '60');

export class DevicesController {
  static async list(req: Request, res: Response) {
    const devices = DeviceRepository.getAll();
    res.json(devices.map(d => ({
      ...d,
      is_online: d.last_seen ? isOnline(d.last_seen, ONLINE_SEC) : false
    })));
  }

  static async get(req: Request, res: Response) {
    const { sn } = req.params;
    const device = DeviceRepository.findBySn(sn);
    if (!device) return res.status(404).json({ error: 'Device not found' });
    res.json({
      ...device,
      is_online: device.last_seen ? isOnline(device.last_seen, ONLINE_SEC) : false
    });
  }
}
