import { NextResponse } from 'next/server';
import { getPollWithResults } from '@/lib/db-utils';

export async function GET(request, { params }) {
  try {
    const pollId = params.id;
    const pollWithResults = getPollWithResults(pollId);

    if (!pollWithResults) {
      return NextResponse.json({ error: 'Poll not found' }, { status: 404 });
    }

    return NextResponse.json(pollWithResults);
  } catch (error) {
    console.error('Error fetching poll results:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
