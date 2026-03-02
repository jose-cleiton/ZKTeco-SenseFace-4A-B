import { Response } from 'express';

export function sendPlainText(res: Response, text: string) {
  res.setHeader('Content-Type', 'text/plain; charset=utf-8');
  res.send(text);
}
