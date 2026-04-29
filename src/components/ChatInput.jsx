import React, { useCallback } from 'react';

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const ChatInput = React.memo(({ input, setInput, onSubmit, isLoading }) => {
  const handleChange = useCallback((e) => {
    setInput(e.target.value);
  }, [setInput]);

  return (
    <form className="input-area" onSubmit={onSubmit} aria-label="Chat input form">
      <div className="input-wrapper">
        <input
          type="text"
          value={input}
          onChange={handleChange}
          placeholder="Ask about voter registration, forms, etc..."
          disabled={isLoading}
          aria-label="Type your message here"
        />
        <button 
          type="submit" 
          disabled={!input.trim() || isLoading} 
          aria-label="Send message"
        >
          <SendIcon />
        </button>
      </div>
    </form>
  );
});

ChatInput.displayName = 'ChatInput';
export default ChatInput;
