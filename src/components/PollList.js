import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function PollList() {
  const [polls, useState] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const response = await axios.get('http://localhost:8000/polls/');
        setPolls(response.data);
        setLoading(false);
      } catch (error) {
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
    return <p>Error: {error.message}</p>;
  }

  return (
    <div>
      <h1>Poll List</h1>
      <Link to="/polls/create">Create Poll</Link>
      <ul>
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
