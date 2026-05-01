import React from 'react';
import PropTypes from 'prop-types';

const BotIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <title>AI Assistant Bot Icon</title>
    <rect x="3" y="11" width="18" height="10" rx="2"></rect>
    <circle cx="12" cy="5" r="2"></circle>
    <path d="M12 7v4"></path>
    <line x1="8" y1="16" x2="8" y2="16"></line>
    <line x1="16" y1="16" x2="16" y2="16"></line>
  </svg>
);

/**
 * ChatHeader component that displays the title and voter profile selector.
 * @param {Object} props - The component props.
 * @param {string} props.userContext - The currently selected voter profile.
 * @param {function} props.setUserContext - Function to update the voter profile.
 */

const ChatHeader = React.memo(({ userContext, setUserContext }) => {
  return (
    <header className="app-header">
      <BotIcon />
      <div className="header-info">
        <h1 id="chat-title">Voting Assistant</h1>
        <p>Official Information sourced from voters.eci.gov.in</p>
      </div>
      <div className="context-selector">
        <label htmlFor="context-select" className="sr-only">Select Voter Profile</label>
        <select 
          id="context-select" 
          value={userContext} 
          onChange={(e) => setUserContext(e.target.value)}
          aria-label="Voter Profile"
        >
          <option value="General Voter">General Voter</option>
          <option value="First-Time Voter (18+)">First-Time Voter (18+)</option>
          <option value="NRI (Overseas) Voter">NRI (Overseas) Voter</option>
          <option value="Senior Citizen or PwD">Senior Citizen or PwD</option>
        </select>
      </div>
    </header>
  );
});

ChatHeader.displayName = 'ChatHeader';

ChatHeader.propTypes = {
  userContext: PropTypes.string.isRequired,
  setUserContext: PropTypes.func.isRequired,
};

export default ChatHeader;
