import React, { useState } from 'react';
import axios from 'axios';

const TaskTracker = () => {
  const [summary, setSummary] = useState('');

  const generateSummary = async () => {
    const apiUrl = process.env.REACT_APP_API_BASE_URL; // Base URL from env
    const apiKey = process.env.REACT_APP_OPENAI_API_KEY; // OpenAI Key from env

    try {
      const response = await axios.post(
        `${apiUrl}/v1/chat/completions`,
        {
          model: process.env.REACT_APP_OPENAI_MODEL,
          messages: [
            { role: 'user', content: 'Summarize these actions: Added item 1, item 2' },
          ],
          max_tokens: 50,
          temperature: 0.7,
        },
        {
          headers: {
            Authorization: `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setSummary(response.data.choices[0].message.content.trim());
    } catch (error) {
      console.error('Error generating summary:', error.message);
      setSummary('Error generating summary. Please try again.');
    }
  };

  return (
    <div>
      <h1>Task Tracker</h1>
      <button onClick={generateSummary}>Generate Summary</button>
      {summary && <p>{summary}</p>}
    </div>
  );
};

export default TaskTracker;
