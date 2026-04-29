import React, { useState, useCallback } from 'react';
import ChatHeader from './components/ChatHeader';
import MessageList from './components/MessageList';
import ChatInput from './components/ChatInput';
import { generateAIResponse } from './services/geminiService';
import './index.css';

function App() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'ai',
      content: 'Hello! I am your official Voting Information Assistant for India. I can help you with registration, finding polling booths, and other details from the Election Commission of India (voters.eci.gov.in). How can I help you today?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg = { id: Date.now(), role: 'user', content: input.trim() };
    const currentMessages = [...messages, userMsg];
    
    setMessages(currentMessages);
    setInput('');
    setIsLoading(true);

    const aiResponse = await generateAIResponse(userMsg.content, currentMessages);
    
    const aiMsg = { id: Date.now() + 1, role: 'ai', content: aiResponse.text };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  }, [input, isLoading, messages]);

  return (
    <div className="app-container">
      <ChatHeader />
      <MessageList messages={messages} isLoading={isLoading} />
      <ChatInput 
        input={input} 
        setInput={setInput} 
        onSubmit={handleSubmit} 
        isLoading={isLoading} 
      />
    </div>
  );
}

export default App;
