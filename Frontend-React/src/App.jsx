import { useState, useEffect, useRef } from 'react'
import axios from 'axios'
import './index.css'

// Components
import ChatButton from './components/ChatButton'
import ChatWindow from './components/ChatWindow'

function App() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`app-container ${isOpen ? 'chat-open' : ''}`}>
      {!isOpen && <ChatButton onClick={() => setIsOpen(true)} isOpen={isOpen} />}
      <ChatWindow isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </div>
  )
}

export default App
