// Add to React component:
const fetchPolls = async () => {
    const response = await fetch('http://localhost:3001/api/polls');
    const data = await response.json();
    setPolls(data);
  };
  
  const submitVote = async (pollId, optionIndex) => {
    await fetch(`http://localhost:3001/api/polls/${pollId}/vote`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ optionIndex })
    });
    fetchPolls();
  };