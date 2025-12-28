import { useState } from 'react'

const ChatButton = ({ onClick, isOpen }) => {
    const [pressed, setPressed] = useState(false)
    if (isOpen) return null;
    return (
        <button
            className={`chatbot-button ${pressed ? 'pressed' : ''}`}
            id="chatbot-btn"
            aria-label="Open chatbot"
            onClick={onClick}
            onTouchStart={() => setPressed(true)}
            onTouchEnd={() => setTimeout(() => { setPressed(false); onClick(); }, 900)}
        >
            <img src="/Logo.jpeg" alt="Samtal Academy Logo" className="chatbot-button-avatar" />
            <span className="ask">Ask Smatal</span>
        </button>
    )
}
export default ChatButton
