import { NextRequest, NextResponse } from 'next/server';
import { getTechLogos } from '@/lib/utils';

export const dynamic = 'force-dynamic'; // Force dynamic rendering

export async function GET(request: NextRequest) {
  try {
    const stackParam = request.nextUrl.searchParams.get('stack');
    
    if (!stackParam) {
      return NextResponse.json({ error: 'Missing stack parameter' }, { status: 400 });
    }
    
    // Parse the tech stack from the URL parameters
    const techStack = JSON.parse(stackParam);
    
    if (!Array.isArray(techStack)) {
      return NextResponse.json({ error: 'Stack parameter must be an array' }, { status: 400 });
    }
    
    // Get the tech logos
    const logos = await getTechLogos(techStack);
    
    return NextResponse.json({ logos });
  } catch (error) {
    console.error('Error in tech-logos API route:', error);
    return NextResponse.json({ error: 'Failed to fetch tech logos' }, { status: 500 });
  }
} 