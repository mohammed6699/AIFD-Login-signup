'use client';

import { useEffect, useState } from 'react';
import { getPollResults } from '@/lib/poll-client';

export default function PollResults({ params }) {
  const [poll, setPoll] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPollResults = async () => {
      try {
        const pollData = await getPollResults(params.id);
        setPoll(pollData);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchPollResults();
  }, [params.id]);

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!poll) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{poll.title}</h1>
      <p className="mb-4">{poll.description}</p>
      <h2 className="text-xl font-semibold mb-2">{poll.question}</h2>
      <div className="space-y-4">
        {poll.options.map((option) => (
          <div key={option.id} className="border p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span>{option.option_text}</span>
              <span>{option.vote_count} votes</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${option.vote_percentage}%` }}
              ></div>
            </div>
            <span className="text-sm text-gray-500">{option.vote_percentage}%</span>
          </div>
        ))}
      </div>
      <div className="mt-4">
        <strong>Total Votes:</strong> {poll.total_votes}
      </div>
    </div>
  );
}
