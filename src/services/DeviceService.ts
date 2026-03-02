import { DeviceRepository, Device } from '../repositories/DeviceRepository.ts';
import dotenv from 'dotenv';

dotenv.config();

export class DeviceService {
  static async heartbeat(sn: string, ip: string) {
    return DeviceRepository.upsert({ sn, ip });
  }

  static getHandshakeResponse(sn: string) {
    const realtime = process.env.REALTIME_DEFAULT === 'true' ? '1' : '0';
    const pushOpt = process.env.PUSH_OPT || 'Realtime=1';
    
    let response = `OK\n`;
    if (realtime === '1') {
      response += `SET OPTIONS Realtime=1\n`;
      response += `SET OPTIONS ${pushOpt}\n`;
    }
    return response;
  }

  static getAll() {
    return DeviceRepository.getAll();
  }
}
