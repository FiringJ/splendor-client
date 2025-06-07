interface LogEntry {
  level: 'debug' | 'info' | 'warn' | 'error';
  message: string;
  timestamp: string;
  context?: string;
  meta?: Record<string, unknown>;
  userId?: string;
  sessionId?: string;
}

class Logger {
  private sessionId: string;
  private userId?: string;
  private isDevelopment: boolean;

  constructor() {
    this.sessionId = this.generateSessionId();
    this.isDevelopment = process.env.NODE_ENV === 'development';
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  private createLogEntry(
    level: LogEntry['level'],
    message: string,
    context?: string,
    meta?: Record<string, unknown>
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      meta,
      userId: this.userId,
      sessionId: this.sessionId,
    };
  }

  private log(entry: LogEntry) {
    // 在开发环境下输出到控制台
    if (this.isDevelopment) {
      const consoleMethod = entry.level === 'error' ? 'error' : 
                           entry.level === 'warn' ? 'warn' : 'log';
      console[consoleMethod](`[${entry.level.toUpperCase()}] ${entry.message}`, entry);
    }

    // 发送到后端（如果是严重错误）
    if (entry.level === 'error') {
      this.sendToBackend(entry);
    }

    // 存储到本地存储（用于调试）
    this.storeLocal(entry);
  }

  private async sendToBackend(entry: LogEntry) {
    try {
      await fetch('/api/logs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(entry),
      });
    } catch (sendError) {
      console.error('发送日志到后端失败:', sendError);
    }
  }

  private storeLocal(entry: LogEntry) {
    try {
      const logs = JSON.parse(localStorage.getItem('app_logs') || '[]');
      logs.push(entry);
      
      // 只保留最近的100条日志
      if (logs.length > 100) {
        logs.splice(0, logs.length - 100);
      }
      
      localStorage.setItem('app_logs', JSON.stringify(logs));
    } catch (storageError) {
      // 忽略本地存储错误
      console.warn('本地存储失败:', storageError);
    }
  }

  debug(message: string, context?: string, meta?: Record<string, unknown>) {
    this.log(this.createLogEntry('debug', message, context, meta));
  }

  info(message: string, context?: string, meta?: Record<string, unknown>) {
    this.log(this.createLogEntry('info', message, context, meta));
  }

  warn(message: string, context?: string, meta?: Record<string, unknown>) {
    this.log(this.createLogEntry('warn', message, context, meta));
  }

  error(message: string, error?: Error, context?: string, meta?: Record<string, unknown>) {
    const errorMeta = error ? {
      name: error.name,
      message: error.message,
      stack: error.stack,
      ...meta
    } : meta;

    this.log(this.createLogEntry('error', message, context, errorMeta));
  }

  // 业务日志方法
  logUserAction(action: string, meta?: Record<string, unknown>) {
    this.info(`用户操作: ${action}`, 'UserAction', meta);
  }

  logGameEvent(event: string, gameId?: string, meta?: Record<string, unknown>) {
    this.info(`游戏事件: ${event}`, 'GameEvent', { gameId, ...meta });
  }

  logPerformance(operation: string, duration: number, meta?: Record<string, unknown>) {
    this.info(`性能监控: ${operation}`, 'Performance', { operation, duration, ...meta });
  }

  logPageView(page: string, meta?: Record<string, unknown>) {
    this.info(`页面访问: ${page}`, 'PageView', { page, ...meta });
  }

  // 获取本地存储的日志
  getLocalLogs(): LogEntry[] {
    try {
      return JSON.parse(localStorage.getItem('app_logs') || '[]');
    } catch {
      return [];
    }
  }

  // 清除本地日志
  clearLocalLogs() {
    localStorage.removeItem('app_logs');
  }
}

export const logger = new Logger();
export type { LogEntry }; 