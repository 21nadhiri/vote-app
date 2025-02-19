import React, { useState, useEffect } from 'react';

const VoteApp = () => {
  const [polls, setPolls] = useState([]);

  const fetchPolls = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/polls');
      const data = await response.json();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
    }
  };

  const submitVote = async (pollId, optionIndex) => {
    try {
      await fetch(`http://localhost:3001/api/polls/${pollId}/vote`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ optionIndex })
      });
      // After voting, refresh the polls
      fetchPolls();
    } catch (error) {
      console.error('Error submitting vote:', error);
    }
  };

  // Fetch polls when the component mounts
  useEffect(() => {
    fetchPolls();
  }, []);

  return (
    <div>
      <h2>Polls</h2>
      {polls.length === 0 ? (
        <p>Loading polls...</p>
      ) : (
        polls.map((poll) => (
          <div key={poll.id}>
            <h3>{poll.question}</h3>
            {poll.options.map((option, idx) => (
              <button key={idx} onClick={() => submitVote(poll.id, idx)}>
                {option}
              </button>
            ))}
          </div>
        ))
      )}
    </div>
  );
};

export default VoteApp;
