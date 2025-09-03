import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    const { db } = await import('@/lib/database.js');
    
    // Test a simple query
    const result = db.prepare('SELECT 1 as test').get();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Database connection successful',
      test: result
    });
  } catch (error) {
    console.error('Database test error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
