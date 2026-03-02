import { Request, Response } from 'express';
import { LogRepository } from '../repositories/LogRepository.ts';

export class LogsController {
  static async list(req: Request, res: Response) {
    const logs = LogRepository.getAll();
    res.json(logs.map(l => ({
      ...l,
      parsed_json: JSON.parse(l.parsed_json)
    })));
  }

  static async getBySn(req: Request, res: Response) {
    const { sn } = req.params;
    const logs = LogRepository.getBySn(sn);
    res.json(logs.map(l => ({
      ...l,
      parsed_json: JSON.parse(l.parsed_json)
    })));
  }
}
