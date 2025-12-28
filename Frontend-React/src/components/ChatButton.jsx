const ChatButton = ({ onClick, isOpen }) => {
    if (isOpen) return null;
    return (
        <button
            className="chatbot-button"
            id="chatbot-btn"
            aria-label="Open chatbot"
            onClick={onClick}
            onTouchStart={onClick}
        >
            <img src="/Logo.jpeg" alt="Samtal Academy Logo" className="chatbot-button-avatar" />
            <span className="ask">Ask Smatal</span>
        </button>
    )
}
export default ChatButton
