import React, { useEffect, useRef } from 'react';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import PropTypes from 'prop-types';

// Configure marked for security and accessibility
marked.setOptions({
  breaks: true, // Convert \n to <br> for better readability
  gfm: true,    // GitHub Flavored Markdown
});

// Custom renderer for accessible links
const renderer = new marked.Renderer();
renderer.link = function ({ href, title, text }) {
  const titleAttr = title ? ` title="${title}"` : '';
  return `<a href="${href}" target="_blank" rel="noopener noreferrer"${titleAttr}>${text}</a>`;
};
marked.use({ renderer });

/**
 * Safely parses markdown to sanitized HTML.
 * Uses DOMPurify to prevent XSS attacks.
 * @param {string} text - The raw markdown text.
 * @returns {string} Sanitized HTML string.
 */
const formatMarkdown = (text) => {
  if (!text) return '';
  const html = marked.parse(text);
  
  // Securely sanitize the HTML, allowing only safe tags and attributes
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'a', 'ul', 'ol', 'li', 'code', 'pre', 'h1', 'h2', 'h3', 'h4', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'title'],
  });
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
