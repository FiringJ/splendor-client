import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const logEntry = await request.json();
    
    // 验证日志格式
    if (!logEntry.level || !logEntry.message || !logEntry.timestamp) {
      return NextResponse.json(
        { error: '日志格式不正确' },
        { status: 400 }
      );
    }

    // 添加服务器端信息
    const enrichedLog = {
      ...logEntry,
      serverTimestamp: new Date().toISOString(),
      userAgent: request.headers.get('user-agent'),
      ip: request.headers.get('x-forwarded-for') || 
          request.headers.get('x-real-ip') || 
          'unknown',
      service: 'splendor-client'
    };

    // 这里可以发送到外部日志服务，比如后端API
    if (process.env.BACKEND_URL) {
      try {
        await fetch(`${process.env.BACKEND_URL}/api/client-logs`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(enrichedLog),
        });
      } catch (error) {
        console.error('发送日志到后端失败:', error);
      }
    }

    // 在开发环境下打印到控制台
    if (process.env.NODE_ENV === 'development') {
      console.log('[CLIENT LOG]', enrichedLog);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('处理日志请求失败:', error);
    return NextResponse.json(
      { error: '处理日志失败' },
      { status: 500 }
    );
  }
} 