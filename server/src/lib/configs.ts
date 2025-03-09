import winston, {format, transports} from "winston";
const { combine, timestamp, label, printf, colorize } = format;

const myFormat = printf(({ level, message, label, timestamp }) => {
    return `${timestamp} [${label}] ${level}: ${message}`;
  });

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new transports.File({ filename: `combined.log`})
    ],
    format: combine(
        label({label: 'LOG'}),
        timestamp(),
        myFormat
    )
})

if (process.env.NODE_ENV !== 'production') {
    logger.add(new winston.transports.Console({
      format: combine(
        colorize(),
        label({label: 'LOG'}),
        timestamp(),
        myFormat
    ),
    }));
  }

export {
    logger
}