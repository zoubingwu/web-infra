import chalk from 'chalk'
import readline from 'readline'

export type LogType = 'error' | 'warn' | 'info' | 'debug'
export type LogLevel = LogType | 'silent'
export interface Logger {
  debug(msg: string, options?: LogOptions): void
  info(msg: string, options?: LogOptions): void
  warn(msg: string, options?: LogOptions): void
  warnOnce(msg: string, options?: LogOptions): void
  error(msg: string, options?: LogOptions): void
  clearScreen(type: LogType): void
  hasWarned: boolean
}

export interface LogOptions {
  clear?: boolean
  timestamp?: boolean
}

export const LogLevels: Record<LogLevel, number> = {
  silent: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
}

function clearScreen() {
  const repeatCount = process.stdout.rows - 2
  const blank = repeatCount > 0 ? '\n'.repeat(repeatCount) : ''
  console.log(blank)
  readline.cursorTo(process.stdout, 0, 0)
  readline.clearScreenDown(process.stdout)
}

export interface LoggerOptions {
  prefix?: string
  allowClearScreen?: boolean
}

export function createLogger(
  level: LogLevel = 'info',
  options: LoggerOptions = {}
): Logger {
  const { prefix = '[web-infra]', allowClearScreen = true } = options

  const thresh = LogLevels[level]
  const clear =
    allowClearScreen && process.stdout.isTTY && !process.env.CI
      ? clearScreen
      : () => {}

  function output(type: LogType, msg: string, options: LogOptions = {}) {
    if (thresh >= LogLevels[type]) {
      const method = type === 'info' ? 'log' : type
      const format = () => {
        if (options.timestamp) {
          const tag =
            type === 'info'
              ? chalk.cyan.bold(prefix)
              : type === 'warn'
              ? chalk.yellow.bold(prefix)
              : chalk.red.bold(prefix)
          return `${chalk.dim(new Date().toLocaleTimeString())} ${tag} ${msg}`
        } else {
          return msg
        }
      }

      console[method](format())
    }
  }

  const warnedMessages = new Set<string>()

  const logger: Logger = {
    hasWarned: false,
    debug(msg, opts) {
      output('debug', msg, opts)
    },
    info(msg, opts) {
      output('info', msg, opts)
    },
    warn(msg, opts) {
      logger.hasWarned = true
      output('warn', msg, opts)
    },
    warnOnce(msg, opts) {
      if (warnedMessages.has(msg)) return
      logger.hasWarned = true
      output('warn', msg, opts)
      warnedMessages.add(msg)
    },
    error(msg, opts) {
      logger.hasWarned = true
      output('error', msg, opts)
    },
    clearScreen(type) {
      if (thresh >= LogLevels[type]) {
        clear()
      }
    },
  }

  return logger
}
