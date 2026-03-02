// File: src/utils/parsers.ts

export interface ParsedRtLog {
  time?: string;
  pin?: string;
  event?: string;
  event_desc?: string;
  verifytype?: string;
  verifytype_desc?: string;
  [key: string]: any;
}

const EVENT_CODES: Record<string, string> = {
  '0': 'Normal Verify',
  '1': 'Verify Success',
  '2': 'Verify Failed',
  '3': 'Door Opened',
  '4': 'Door Closed',
  '5': 'Alarm',
  '14': 'Door Button Pressed',
  '255': 'Unknown'
};

const VERIFY_TYPES: Record<string, string> = {
  '0': 'Password',
  '1': 'Fingerprint',
  '2': 'Card',
  '3': 'Face',
  '4': 'Finger Vein',
  '15': 'Face + Fingerprint',
  '20': 'Other'
};

export function parseZkLine(line: string): Record<string, string> {
  const parts = line.split('\t');
  const result: Record<string, string> = {};
  for (const part of parts) {
    const [key, value] = part.split('=');
    if (key && value !== undefined) {
      result[key.trim()] = value.trim();
    }
  }
  return result;
}

export function parseRtLog(line: string): ParsedRtLog {
  const data = parseZkLine(line);
  
  if (data.Verify) {
    data.verifytype = data.Verify;
    data.verifytype_desc = VERIFY_TYPES[data.Verify] || 'Unknown';
  }
  
  // Some firmwares use 'Event' or just the first field
  const eventCode = data.Event || '0';
  data.event_desc = EVENT_CODES[eventCode] || 'Log Event';

  return data;
}

/**
 * Parses DATA QUERY user response
 * Format: PIN=1\tName=User1\tPrivilege=0...
 */
export function parseQueryResponse(text: string): any[] {
  const lines = text.split('\n').filter(l => l.trim().length > 0);
  return lines.map(line => parseZkLine(line));
}
