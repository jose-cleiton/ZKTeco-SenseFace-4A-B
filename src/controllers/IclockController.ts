import { Request, Response } from 'express';
import { DeviceService } from '../services/DeviceService.ts';
import { ZktecoProtocolService } from '../services/ZktecoProtocolService.ts';
import { CommandService } from '../services/CommandService.ts';
import { sendPlainText } from '../utils/plainTextResponder.ts';
import pino from 'pino';

const logger = pino();

export class IclockController {
  static async cdataGet(req: Request, res: Response) {
    const sn = req.query.SN as string;
    const ip = req.ip || '';
    
    if (!sn) return sendPlainText(res, 'ERROR: No SN');

    logger.info({ sn, ip }, 'Device Handshake (cdata GET)');
    await DeviceService.heartbeat(sn, ip);
    
    const response = DeviceService.getHandshakeResponse(sn);
    sendPlainText(res, response);
  }

  static async cdataPost(req: Request, res: Response) {
    const sn = req.query.SN as string;
    const table = req.query.table as string;
    const body = req.body as string;

    if (!sn) return sendPlainText(res, 'ERROR: No SN');

    const result = await ZktecoProtocolService.handleCdataPost(sn, table, body);
    sendPlainText(res, result);
  }

  static async getRequest(req: Request, res: Response) {
    const sn = req.query.SN as string;
    if (!sn) return sendPlainText(res, 'ERROR: No SN');

    const cmd = await CommandService.getNext(sn);
    if (cmd) {
      logger.info({ sn, cmdId: cmd.id }, 'Sending command to device');
      sendPlainText(res, `C:${cmd.id}:${cmd.command_text}`);
    } else {
      sendPlainText(res, 'OK');
    }
  }

  static async deviceCmd(req: Request, res: Response) {
    const sn = req.query.SN as string;
    const body = req.body as string;

    if (!sn) return sendPlainText(res, 'ERROR: No SN');

    const result = await ZktecoProtocolService.handleDeviceCmd(sn, body);
    sendPlainText(res, result);
  }

  static async registry(req: Request, res: Response) {
    sendPlainText(res, 'OK');
  }

  static async push(req: Request, res: Response) {
    sendPlainText(res, 'OK');
  }
}
