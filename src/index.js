import api from '@forge/api';
import axios from 'axios';

const OPENAI_API = 'key here'
async function summarizeTranscript(transcript) {
  const response = await axios.post(
    'https://api.openai.com/v1/chat/completions',
    {
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: transcript }]
    },
    {
      headers: {
        'Authorization': `Bearer ${OPENAI_API}`,
        'Content-Type': 'application/json'
      }
    }
  );

  return response.data.choices[0].message.content;
}

export async function handleTranscript(req) {
  const { transcript } = await req.json();
  const summary = await summarizeTranscript(transcript);

  const response = await api.asApp().requestJira('/rest/api/3/issue', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      fields: {
        project: { key: 'TM' },
        summary: `Summary: ${summary}`,
        issuetype: { name: 'Epic' }
      }
    })
  });

  return {
    statusCode: response.status === 201 ? 200 : 500,
    body: JSON.stringify({
      message: response.status === 201
        ? 'Epic created successfully!'
        : 'Failed to create Epic.'
    })
  };
}
