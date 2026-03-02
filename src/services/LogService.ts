import { LogRepository } from '../repositories/LogRepository.ts';
import { parseRtLog } from '../utils/parsers.ts';
import pino from 'pino';

const logger = pino();

export class LogService {
  static async processRtLog(sn: string, rawLines: string) {
    const lines = rawLines.split('\n').filter(l => l.trim().length > 0);
    for (const line of lines) {
      try {
        const parsed = parseRtLog(line);
        LogRepository.create({
          sn,
          raw_line: line,
          parsed_json: JSON.stringify(parsed)
        });
      } catch (err) {
        logger.error({ err, sn, line }, 'Error parsing rtlog line');
      }
    }
  }
}
