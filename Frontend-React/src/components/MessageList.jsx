import React from 'react'

const getOptionColor = (option) => {
    const text = option.toLowerCase();
    if (text.includes("content")) return "blue";
    if (text.includes("duration")) return "violet";
    if (text.includes("fees")) return "emerald";
    if (text.includes("career")) return "orange";
    return "slate";
}

const MessageList = ({ messages, onOptionClick }) => {
    return (
        <>
            {messages.map((msg, index) => (
                <React.Fragment key={index}>
                    {msg.type === 'user' ? (
                        <div className="user-message">{msg.content}</div>
                    ) : (
                        <div className="bot-message-wrapper">
                            <div className="bot-avatar"></div>
                            <div className="bot-message">
                                {msg.isCourseDetail ? (
                                    <>
                                        <div dangerouslySetInnerHTML={{
                                            __html: msg.content.replace(/\*\*(.*?)\*\*/g, '<div class="course-detail-title">$1</div>').replace(/\n/g, '<div class="course-detail-text">') + '</div>'
                                        }} />
                                        {msg.followUpOptions && (
                                            <div className="follow-up-options">
                                                {msg.followUpOptions.map((option, idx) => (
                                                    <button
                                                        key={idx}
                                                        className={`follow-up-btn ${getOptionColor(option)}`}
                                                        onClick={() => onOptionClick(msg.courseName, option)}
                                                    >
                                                        {option}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    msg.content.split('\n').map((line, i) => (
                                        line.trim() !== "" && (
                                            <div key={i} dangerouslySetInnerHTML={{
                                                __html: '<span class="point"></span>' + line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
                                            }} />
                                        )
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </React.Fragment>
            ))}
        </>
    )
}

export default MessageList
