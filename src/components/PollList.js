import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';


/**
 * Dashboard component to display a list of polls.
 * Fetches poll data from backend and handles loading/error states.
 * Shows links to individual polls and poll creation.
 */
function PollList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch all polls from backend API
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:8000/polls/');
        setPolls(response.data);
        setLoading(false);
      } catch (error) {
        // Handle network or API errors
        setError(error);
        setLoading(false);
      }
    };
    fetchPolls();
  }, []);

  if (loading) {
    return <p>Loading polls...</p>;
  }

  if (error) {
    // Show error message if fetch fails
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Poll List</h1>
      <Link to="/polls/create">Create Poll</Link>
      <ul>
        {/* Render each poll as a link */}
        {polls.map(poll => (
          <li key={poll.id}>
            <Link to={`/polls/${poll.id}`}>{poll.title}</Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default PollList;
