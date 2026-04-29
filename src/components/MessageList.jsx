import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';

const formatMarkdown = (text) => {
  if (!text) return '';
  let html = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
    .replace(/\n/g, '<br />');
  
  // Securely sanitize the HTML
  return DOMPurify.sanitize(html);
};

const MessageList = React.memo(({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  return (
    <main 
      className="chat-area" 
      aria-live="polite" 
      aria-atomic="false"
      role="log"
    >
      {messages.map((msg) => (
        <div key={msg.id} className={`message ${msg.role}`}>
          <div dangerouslySetInnerHTML={{
            __html: formatMarkdown(msg.content)
          }} />
        </div>
      ))}
      {isLoading && (
        <div className="message ai" aria-label="Assistant is typing">
          <div className="typing-indicator" aria-hidden="true">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        </div>
      )}
      <div ref={messagesEndRef} />
    </main>
  );
});

MessageList.displayName = 'MessageList';
export default MessageList;
