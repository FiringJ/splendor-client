import { NextResponse } from 'next/server';

// 前端简单的指标端点，避免404错误
export async function GET() {
  try {
    const metrics = {
      timestamp: new Date().toISOString(),
      service: 'splendor-client',
      version: '1.0.0',
      status: 'ok',
      // 简单的前端指标
      performance: {
        memory: typeof window !== 'undefined' ? (performance as any).memory : undefined,
        navigation: typeof window !== 'undefined' ? performance.navigation : undefined,
      },
      userAgent: typeof window !== 'undefined' ? navigator.userAgent : 'server-side'
    };

    return NextResponse.json(metrics, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });
  } catch (error) {
    console.error('获取前端指标失败:', error);
    return NextResponse.json(
      { error: '获取指标失败' },
      { status: 500 }
    );
  }
} 