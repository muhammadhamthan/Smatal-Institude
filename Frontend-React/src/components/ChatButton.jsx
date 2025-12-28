import { useState } from 'react'

const ChatButton = ({ onClick, isOpen }) => {
    const [touched, setTouched] = useState(false)
    if (isOpen) return null;
    return (
        <button
            className={`chatbot-button ${touched ? 'touched' : ''}`}
            id="chatbot-btn"
            aria-label="Open chatbot"
            onClick={() => setTimeout(() => onClick(), 200)}
            onTouchStart={() => setTouched(true)}
            onTouchEnd={() => setTouched(false)}
        >
            <img src="/Logo.jpeg" alt="Samtal Academy Logo" className="chatbot-button-avatar" />
            <span className="ask">Ask Smatal</span>
        </button>
    )
}
export default ChatButton
