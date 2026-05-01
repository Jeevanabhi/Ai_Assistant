import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import PropTypes from 'prop-types';

/**
 * Safely parses markdown to sanitized HTML.
 * @param {string} text - The raw markdown text.
 * @returns {string} Sanitized HTML string.
 */
const formatMarkdown = (text) => {
  if (!text) return '';
  const html = marked.parse(text);
  
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

MessageList.propTypes = {
  messages: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.number.isRequired,
      role: PropTypes.string.isRequired,
      content: PropTypes.string.isRequired,
    })
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
};

export default MessageList;
