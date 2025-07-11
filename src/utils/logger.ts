import fs from 'fs';
import path from 'path';
import pino, { Logger } from 'pino';

const logDir = 'logs';
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

export function createLogger(moduleName: string): Logger {
    
    const logFilePath = path.join(logDir, `${moduleName.toLowerCase()}.log`);

    const transport = pino.transport({
        targets: [
        
            {
                target: 'pino-pretty',
                options: { colorize: true } 
            },
            {
                target: 'pino/file',
                options: { destination: logFilePath, mkdir: true }
            }
        ]
    });

    return pino({ name: moduleName, level: 'info' }, transport);
}