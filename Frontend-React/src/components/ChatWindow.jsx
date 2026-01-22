import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import MessageList from './MessageList'
import DetailsForm from './DetailsForm'
import CourseGrid from './CourseGrid'

const ChatWindow = ({ isOpen, onClose }) => {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState('')
    const [isBotResponding, setIsBotResponding] = useState(false)
    const [userId, setUserId] = useState('')
    const [showQuickCourses, setShowQuickCourses] = useState(true)
    const [detailsForm, setDetailsForm] = useState(null) // { course: '...' }
    const [touchedButton, setTouchedButton] = useState(null) // 'refresh' or 'close'
    const chatBodyRef = useRef(null)

    useEffect(() => {
        let storedUserId = localStorage.getItem("userId")
        if (!storedUserId) {
            storedUserId = 'uid-' + Date.now() + '-' + Math.floor(Math.random() * 100000);
            localStorage.setItem("userId", storedUserId)
        }
        setUserId(storedUserId)

        // Initial greeting
        setMessages([{ type: 'bot', content: 'Hi, how can I help you today?' }])
    }, [])

    useEffect(() => {
        if (chatBodyRef.current) {
            chatBodyRef.current.scrollTop = chatBodyRef.current.scrollHeight
        }
    }, [messages, isBotResponding, detailsForm])

    const handleRefresh = async () => {
        console.log("Refreshing chat...")
        setMessages([{ type: 'bot', content: 'Hi, how can I help you today?' }])
        setShowQuickCourses(true)
        setDetailsForm(null)
        setIsBotResponding(false)

        try {
            const response = await axios.post(' http://localhost:8080/refresh', { user_id: userId })
            console.log("Refresh response:", response.data)
        } catch (error) {
            console.error("Error refreshing memory:", error)
        }
    }

    const sendMessage = async (text) => {
        if (!text.trim() || isBotResponding) return

        console.log("Sending message:", text)
        const userMsg = { type: 'user', content: text }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setShowQuickCourses(false)
        setIsBotResponding(true)

        try {
            const response = await axios.post(' http://localhost:8080/chat', {
                message: text,
                user_id: userId
            })

            console.log("Chat response:", response.data)
            const data = response.data
            if (data && data.response) {
                setMessages(prev => [...prev, { type: 'bot', content: data.response }])
                if (data.need_details) {
                    setDetailsForm({ course: data.course })
                }
            } else {
                setMessages(prev => [...prev, { type: 'bot', content: "Sorry, something went wrong with the response format." }])
            }
        } catch (error) {
            console.error("Error:", error)
            setMessages(prev => [...prev, { type: 'bot', content: "Sorry, I couldn't process your request." }])
        } finally {
            setIsBotResponding(false)
        }
    }

    const handleCourseClick = (courseName) => {
        console.log("Course clicked:", courseName)
        const normalizedCourse = courseName.toLowerCase()
        const COURSE_DETAILS = {
            "python": "Python is an easy-to-learn programming language used for websites, automation, data analysis, and AI. This course starts from basics and gradually moves to advanced concepts with practical examples.",
            "cyber security": "Cybersecurity focuses on protecting computers, networks, and data from hackers and cyber threats. This course covers ethical hacking, network security, and how to prevent attacks.",
            "data science": "Data Science helps you find useful insights from data using statistics, Python, and machine learning. This course teaches data handling, visualization, and basic AI models.",
            "ms office": "MS Office teaches essential tools like Word, Excel, PowerPoint, and Outlook used in offices and businesses. This course improves productivity and professional skills.",
            "video editing": "Video Editing is about creating and improving videos using tools like Premiere Pro and DaVinci Resolve. This course covers cutting, effects, transitions, and final output.",
            "tally": "Tally is an accounting software used to manage business finances. This course teaches accounting basics, GST, payroll, and report generation.",
            "powerbi": "Power BI helps convert raw data into clear charts and dashboards for better decisions. This course teaches data visualization and reporting skills.",
            "c/c++": "C and C++ are core programming languages used in system software and performance-critical applications. This course covers logic building, problem-solving, and OOP concepts.",
            "graphic design": "Graphic Design focuses on creating visuals like logos, posters, and social media designs using tools like Photoshop and Figma. This course builds creativity and design skills.",
            "data analytics": "Data Analytics is about analyzing data to support business decisions. This course teaches Excel, statistics, Python/R, and dashboard creation.",
            "full stack": "Full Stack Development teaches both front-end and back-end web development. You’ll learn to build complete websites using modern technologies.",
            "digital marketing": "Digital Marketing teaches online promotion through SEO, social media, ads, and content marketing. This course helps businesses grow online.",
            "java": "Java is a powerful programming language widely used in enterprise applications, Android apps, and backend systems. This course covers core Java, OOP concepts, and real-world applications."
        }

        const details = COURSE_DETAILS[normalizedCourse] || "Course details coming soon."

        // Add user message
        const userMsg = { type: 'user', content: `${courseName} course details` }
        setMessages(prev => [...prev, userMsg])
        setShowQuickCourses(false)

        // Add bot response with course details
        setTimeout(() => {
            setMessages(prev => [...prev, {
                type: 'bot',
                content: `**${courseName}**\n${details}`,
                isCourseDetail: true,
                courseName: normalizedCourse,
                followUpOptions: ["Content", "Duration", "Fees", "Career Opportunities"]
            }])
        }, 500)

        // Silent memory storage
        storeCourseContext(normalizedCourse, details)
    }

    const storeCourseContext = async (courseName, courseDetails) => {
        console.log("Storing context for:", courseName)
        try {
            const response = await axios.post(' http://localhost:8080/memory/context', {
                user_id: userId,
                course: courseName,
                content: courseDetails
            })
            console.log("Store context response:", response.data)
        } catch (error) {
            console.error("Error storing context:", error)
        }
    }

    const handleOptionClick = (courseName, option) => {
        setDetailsForm({ course: courseName })
    }



    const handleFormSubmit = async (formData) => {
        console.log("Submitting form data:", formData)
        try {
            const res = await axios.post(' http://localhost:8080/submit_details', {
                ...formData,
                course: detailsForm.course,
                user_id: userId
            })
            console.log("Submit details response:", res.data)

            if (res.data.status === 'success') {
                setDetailsForm(null)
                setMessages(prev => [...prev, { type: 'bot', content: res.data.response }])
            } else {
                setMessages(prev => [...prev, { type: 'bot', content: res.data.response }])
            }
        } catch (error) {
            console.error("Submit details error:", error)
            setMessages(prev => [...prev, { type: 'bot', content: "❌ Error submitting details. Please try again." }])
        }
    }

    return (
        <div className={`chat-popup ${isOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
            <div className="chat-header">
                <div className="header-left">
                    <img className="header-avatar" src="/Logo.jpeg" alt="Smatal Academy Logo" />
                    <div className="header-titles">
                        <h3 className="title-org">Smatal Academy</h3>
                        <p className="subtitle">Your Learning Assistant</p>
                    </div>
                </div>
                <div className="chat-controls">
                    <button
                        className={`icon-btn ${touchedButton === 'refresh' ? 'touched' : ''}`}
                        title="Refresh"
                        onClick={() => setTimeout(() => handleRefresh(), 200)}
                        onTouchStart={() => setTouchedButton('refresh')}
                        onTouchEnd={() => setTouchedButton(null)}
                    >
                        <i className="fa-solid fa-rotate"></i>
                    </button>
                    <button
                        className={`icon-btn ${touchedButton === 'close' ? 'touched' : ''}`}
                        title="Close"
                        onClick={() => setTimeout(() => onClose(), 200)}
                        onTouchStart={() => setTouchedButton('close')}
                        onTouchEnd={() => setTouchedButton(null)}
                    >
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div className="chat-body" id="chat-body" ref={chatBodyRef}>
                {showQuickCourses && <CourseGrid onCourseClick={handleCourseClick} />}

                <MessageList messages={messages} onOptionClick={handleOptionClick} />

                {isBotResponding && (
                    <div className="bot-message-wrapper">
                        <div className="bot-avatar"></div>
                        <div className="bot-message" id="typing-indicator">
                            <em>Typing<span className="dots"></span></em>
                        </div>
                    </div>
                )}

                {detailsForm && (
                    <DetailsForm courseName={detailsForm.course} onSubmit={handleFormSubmit} />
                )}
            </div>

            <div className="chat-footer">
                <input
                    type="text"
                    id="chat-input"
                    placeholder="Write your question..."
                    autoComplete="off"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage(input)}
                    disabled={isBotResponding || detailsForm}
                />
                <button
                    id="send-btn"
                    aria-label="Send"
                    onClick={() => sendMessage(input)}
                    disabled={isBotResponding || detailsForm}
                >
                    <span>Send</span>
                    <i className="fa-solid fa-paper-plane"></i>
                </button>
            </div>
            <div className="chat-footer-bottom">
                &copy; <a target="_blank" href="https://blixittechnologies.com/" className="copy-right">Blixit Technologies</a> 2025
            </div>
        </div>
    )
}

export default ChatWindow
