// Simple logger implementation for production
interface LogContext {
  [key: string]: any
}

class Logger {
  info(message: string, context?: LogContext) {
    console.log(`[INFO] ${message}`, context ? JSON.stringify(context) : '')
  }

  error(message: string, error?: Error, context?: LogContext) {
    console.error(`[ERROR] ${message}`, error, context ? JSON.stringify(context) : '')
  }

  warn(message: string, context?: LogContext) {
    console.warn(`[WARN] ${message}`, context ? JSON.stringify(context) : '')
  }

  debug(message: string, context?: LogContext) {
    if (process.env.NODE_ENV === 'development') {
      console.debug(`[DEBUG] ${message}`, context ? JSON.stringify(context) : '')
    }
  }

  leadEvent(event: string, context?: LogContext) {
    this.info(`Lead Event: ${event}`, context)
  }

  performance(metric: string, value: number, context?: LogContext) {
    this.info(`Performance: ${metric} = ${value}ms`, context)
  }
}

export const logger = new Logger()