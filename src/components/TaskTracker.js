import React, { useState, useEffect } from 'react';
import axios from 'axios';

const TaskTracker = () => {
  const [items, setItems] = useState([]); // Tracks list items
  const [inputValue, setInputValue] = useState(''); // Tracks current input value
  const [summary, setSummary] = useState(''); // Stores the summary generated by OpenAI
  const [log, setLog] = useState([]); // Logs user actions

  // Add a new item to the list and log the action
  const handleAddItem = () => {
    if (inputValue.trim()) {
      const newItems = [...items, inputValue.trim()];
      setItems(newItems);
      setLog([...log, `Added item: ${inputValue.trim()}`]);
      setInputValue('');
    }
  };

  // Generate a summary of recent actions using OpenAI API
  const generateSummary = async () => {
    const recentLog = log.slice(-5).join(', '); // Use the last 5 actions from the log
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-3.5-turbo', // Use GPT-3.5-turbo model
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that summarizes tasks.',
            },
            {
              role: 'user',
              content: `Summarize the following actions: ${recentLog}`,
            },
          ],
          max_tokens: 50,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.REACT_APP_OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSummary(response.data.choices[0].message.content.trim()); // Update summary state
    } catch (error) {
      console.error('Error generating summary:', error.response?.data || error.message);
      setSummary('Error generating summary. Please try again.');
    }
  };

  // Auto-generate summaries every 30 seconds if the log has entries
  useEffect(() => {
    if (log.length === 0) return;

    const interval = setInterval(() => {
      generateSummary();
    }, 30000); // 30-second interval

    return () => clearInterval(interval); // Cleanup interval on dependency change
  }, [log]);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Task Tracker</h1>
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder="Add a new item"
        style={{
          padding: '10px',
          width: '300px',
          marginRight: '10px',
          fontSize: '16px',
        }}
      />
      <button
        onClick={handleAddItem}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          marginRight: '10px',
        }}
      >
        Add Item
      </button>
      <button
        onClick={generateSummary}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
        }}
      >
        Generate Summary
      </button>
      <ul style={{ marginTop: '20px', fontSize: '18px' }}>
        {items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
      {summary && (
        <div
          style={{
            marginTop: '20px',
            padding: '10px',
            border: '1px solid #ccc',
            borderRadius: '5px',
            backgroundColor: '#f9f9f9',
          }}
        >
          <h3>Summary:</h3>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

export default TaskTracker;
