import { useState, useEffect } from 'react';

function PollsList() {
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPolls();
  }, []);

  const fetchPolls = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3001/api/polls', {
        credentials: 'include', // Add this line for CORS
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setPolls(data);
    } catch (error) {
      console.error('Error fetching polls:', error);
      setError('Failed to load polls. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Function to handle voting
  const handleVote = async (pollId, optionIndex) => {
    try {
      const response = await fetch(`http://localhost:3001/api/polls/${pollId}/vote`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ optionIndex }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Refresh polls after voting
      fetchPolls();
    } catch (error) {
      console.error('Error voting:', error);
      setError('Failed to submit vote. Please try again.');
    }
  };

  if (loading) return <div>Loading polls...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Polls</h1>
      {polls.length === 0 ? (
        <p>No polls available</p>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <div key={poll._id} className="border p-4 rounded-lg">
              <h2 className="text-xl font-semibold mb-2">{poll.question}</h2>
              <div className="space-y-2">
                {poll.options.map((option, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <button
                      onClick={() => handleVote(poll._id, index)}
                      className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                    >
                      {option.text} ({option.votes} votes)
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PollsList;