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
            const response = await axios.post('https://appsail-50035450095.development.catalystappsail.in/refresh', { user_id: userId })
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
            const response = await axios.post('https://appsail-50035450095.development.catalystappsail.in/chat', {
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
        const COURSE_DETAILS = {
            "python": "Python is an easy-to-learn programming language used for websites, automation, data analysis, and AI. This course starts from basics and gradually moves to advanced concepts with practical examples.\n👉Would you like to use Python for web development, data science, or automation?",
            "cyber security": "Cybersecurity focuses on protecting computers, networks, and data from hackers and cyber threats. This course covers ethical hacking, network security, and how to prevent attacks.\n👉 Are you interested in becoming an ethical hacker or a security analyst?",
            "data science": "Data Science helps you find useful insights from data using statistics, Python, and machine learning. This course teaches data handling, visualization, and basic AI models.\n👉 Do you want to work with data analysis or build machine learning models?",
            "ms office": "MS Office teaches essential tools like Word, Excel, PowerPoint, and Outlook used in offices and businesses. This course improves productivity and professional skills.\n👉 Do you want to improve Excel skills or learn all Office tools together?",
            "video editing": "Video Editing is about creating and improving videos using tools like Premiere Pro and DaVinci Resolve. This course covers cutting, effects, transitions, and final output.\n👉 Are you interested in editing videos for YouTube, reels, or professional projects?",
            "tally": "Tally is an accounting software used to manage business finances. This course teaches accounting basics, GST, payroll, and report generation.\n👉 Are you aiming for an accounting job or managing business accounts?",
            "powerbi": "Power BI helps convert raw data into clear charts and dashboards for better decisions. This course teaches data visualization and reporting skills.\n👉 Do you want to create dashboards for business or data analysis roles?",
            "c/c++": "C and C++ are core programming languages used in system software and performance-critical applications. This course covers logic building, problem-solving, and OOP concepts.\n👉 Are you learning C/C++ for placements or to strengthen programming fundamentals?",
            "graphic design": "Graphic Design focuses on creating visuals like logos, posters, and social media designs using tools like Photoshop and Figma. This course builds creativity and design skills.\n👉 Do you want to design for social media, branding, or freelancing?",
            "data analytics": "Data Analytics is about analyzing data to support business decisions. This course teaches Excel, statistics, Python/R, and dashboard creation.\n👉 Are you more interested in business insights or technical data analysis?",
            "full stack": "Full Stack Development teaches both front-end and back-end web development. You’ll learn to build complete websites using modern technologies.\n👉 Do you want to focus more on front-end or back-end development?",
            "digital marketing": "Digital Marketing teaches online promotion through SEO, social media, ads, and content marketing. This course helps businesses grow online.\n👉 Are you interested in marketing, freelancing, or growing your own business online?",
            "java": "Java is a powerful programming language widely used in enterprise applications, Android apps, and backend systems. This course covers core Java, OOP concepts, and real-world applications.\n👉 Do you want to learn Java for backend development or Android apps?"
        }

        const details = COURSE_DETAILS[courseName.toLowerCase()] || "Course details coming soon."

        // Add user message
        const userMsg = { type: 'user', content: `${courseName} course details` }
        setMessages(prev => [...prev, userMsg])
        setShowQuickCourses(false)

        // Add bot response with course details
        setTimeout(() => {
            setMessages(prev => [...prev, {
                type: 'bot',
                content: `**${courseName}**\n${details}`,
                isCourseDetail: true
            }])
        }, 500)

        // Silent memory storage
        storeCourseContext(courseName, details)
    }

    const storeCourseContext = async (courseName, courseDetails) => {
        console.log("Storing context for:", courseName)
        try {
            const response = await axios.post('https://appsail-50035450095.development.catalystappsail.in/memory/context', {
                user_id: userId,
                course: courseName,
                content: courseDetails
            })
            console.log("Store context response:", response.data)
        } catch (error) {
            console.error("Error storing context:", error)
        }
    }

    const handleFormSubmit = async (formData) => {
        console.log("Submitting form data:", formData)
        try {
            const res = await axios.post('https://appsail-50035450095.development.catalystappsail.in/submit_details', {
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
                    <button className="icon-btn" title="Refresh" onClick={handleRefresh}>
                        <i className="fa-solid fa-rotate"></i>
                    </button>
                    <button className="icon-btn" title="Close" onClick={onClose} onTouchStart={onClose}>
                        <i className="fa-solid fa-xmark"></i>
                    </button>
                </div>
            </div>

            <div className="chat-body" id="chat-body" ref={chatBodyRef}>
                {showQuickCourses && <CourseGrid onCourseClick={handleCourseClick} />}

                <MessageList messages={messages} />

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
