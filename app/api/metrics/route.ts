import { NextResponse } from 'next/server';

// 前端简单的指标端点，避免404错误
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const metric = searchParams.get('metric');
    
    // TODO: 从监控系统获取实际指标
    const mockData: Record<string, unknown> = {
      timestamp: new Date().toISOString(),
      metric: metric,
      value: Math.random() * 100
    };
    
    return NextResponse.json(mockData);
  } catch (error) {
    console.error('获取前端指标失败:', error);
    return NextResponse.json(
      { error: '获取指标失败' },
      { status: 500 }
    );
  }
} 