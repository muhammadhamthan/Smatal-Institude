const chatbotBtn = document.getElementById("chatbot-btn")
const chatPopup = document.getElementById("chat-popup")
const closeBtn = document.getElementById("close-btn")
const sendBtn = document.getElementById("send-btn")
const chatInput = document.getElementById("chat-input")
const chatBody = document.getElementById("chat-body")
const refreshBtn = document.getElementById("refresh-btn")
const clearBtn = document.getElementById("clear-btn")

let isBotResponding = false
let isFormOpen = false

function disableUserInput() {
  sendBtn.disabled = true
}

function enableUserInput() {
  if (!isFormOpen) {
    sendBtn.disabled = false
  }
}

// Initialize popup hidden; open button visible
chatPopup.style.display = "none"
chatbotBtn.style.display = "flex"

// Prevent scroll to top on button click
// Open chatbot and hide open button
chatbotBtn.addEventListener("click", (e) => {
  e.preventDefault()
  chatPopup.style.display = "flex"
  chatbotBtn.style.display = "none"
})

// Close chatbot and show open button
closeBtn.addEventListener("click", () => {
  chatPopup.style.display = "none"
  chatbotBtn.style.display = "flex"
})

// Refresh chat
refreshBtn.addEventListener("click", () => {
  isFormOpen = false
  isBotResponding = false
  enableUserInput()

  const courses = [
    { label: "Python", color: "green", icon: "fa-solid fa-code", sub: "Master Python programming" },
    { label: "Data Science", color: "blue", icon: "fa-solid fa-chart-line", sub: "Learn data analysis & ML" },
    { label: "Java", color: "orange", icon: "fa-brands fa-java", sub: "OOP, APIs, Spring basics" },
    { label: "MS Office", color: "slate", icon: "fa-regular fa-file-lines", sub: "Excel, Word, PowerPoint" },
    { label: "Tally", color: "emerald", icon: "fa-solid fa-calculator", sub: "Accounting fundamentals" },
    { label: "C/C++", color: "red", icon: "fa-solid fa-cubes-stacked", sub: "Systems programming" },
    { label: "PowerBI", color: "violet", icon: "fa-solid fa-chart-pie", sub: "Interactive dashboards" },
    { label: "Graphic Design", color: "pink", icon: "fa-solid fa-pen-nib", sub: "Adobe tools & layout" },
    { label: "Video Editing", color: "indigo", icon: "fa-solid fa-film", sub: "Professional workflows" },
    { label: "Data Analytics", color: "cyan", icon: "fa-solid fa-magnifying-glass-chart", sub: "Advanced analytics" },
    { label: "Full Stack", color: "purple", icon: "fa-solid fa-layer-group", sub: "Modern web development" },
    { label: "Cyber Security", color: "gray", icon: "fa-solid fa-shield-halved", sub: "Network & app security" },
    { label: "Digital Marketing", color: "amber", icon: "fa-solid fa-bullhorn", sub: "SEO & social media" },
  ]

  const grid = `
    <div id="quick-courses" class="courses-grid" aria-label="Quick course categories">
      ${courses
        .map(
          (c) => `
        <button class="course-card ${c.color}" data-prompt="${c.label} course details">
          <i class="${c.icon} card-icon"></i>
          <div class="card-text">
            <span class="course-title">${c.label}</span>
            <span class="course-sub">${c.sub}</span>
          </div>
        </button>
      `,
        )
        .join("")}
    </div>
  `

  chatBody.innerHTML =
    grid +
    '<div class="bot-message-wrapper">' +
    '<div class="bot-avatar"></div>' +
    '<div class="bot-message">Hi, how can I help you today?</div>' +
    "</div>"

  const formContainer = document.getElementById("details-form-container")
  if (formContainer) formContainer.innerHTML = ""

  // Clear input fields
  const userNameInput = document.getElementById("user-name")
  const userEmailInput = document.getElementById("user-email")
  const userPhoneInput = document.getElementById("user-phone")

  if (userNameInput) userNameInput.value = ""
  if (userEmailInput) userEmailInput.value = ""
  if (userPhoneInput) userPhoneInput.value = ""

  let userId = localStorage.getItem("userId")
  if (!userId) {
    userId = crypto.randomUUID()
    localStorage.setItem("userId", userId)
  }

  fetch("https://smatal-institude.onrender.com/refresh", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId }),
  })
    .then((response) => response.json())
    .catch((error) => console.error("[v0] Error refreshing memory:", error))
})

clearBtn?.addEventListener("click", () => {
  refreshBtn?.click()
})

// Send message
sendBtn.addEventListener("click", sendMessage)
chatInput.addEventListener("keypress", (e) => {
  if (e.key === "Enter") {
    e.preventDefault()
    sendMessage()
  }
})

async function sendMessage() {
  if (isBotResponding || isFormOpen) return;// Block input
  const userMessage = chatInput.value.trim()
  if (userMessage !== "") {
    disableUserInput();
    isBotResponding = true;
    document.getElementById("quick-courses")?.classList.add("hidden")
    displayMessage(userMessage, "user-message")
    chatInput.value = ""

    const typingBubble = document.createElement("div")
    typingBubble.classList.add("bot-message")
    typingBubble.id = "typing-indicator"
    typingBubble.innerHTML = '<em>Typing<span class="dots"></span></em>'
    chatBody.appendChild(typingBubble)
    chatBody.scrollTop = chatBody.scrollHeight

    let userId = localStorage.getItem("userId");
    if (!userId) {
        //userId = crypto.randomUUID();
        userId = 'uid-' + Date.now() + '-' + Math.floor(Math.random() * 100000);

        localStorage.setItem("userId", userId);
    }



    await fetch("https://smatal-institude.onrender.com/chat", {
      method: "POST",
      // credentials:"include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage , user_id: userId}),
    })
      .then((response) => response.json())
      .then((data) => {
        document.getElementById("typing-indicator")?.remove()
        if (data && data.response) {
          displayBotResponse(data.response)
          if (data.need_details) openDetailsForm(data.course);
        } else {
          displayMessage("Sorry, something went wrong with the response format.", "bot-message", true)
          traceback.print_exc()
        }
      })
      .catch((error) => {
        document.getElementById("typing-indicator")?.remove()
        console.error("[v0] Error:", error)
        displayMessage("Sorry, I couldn't process your request123.", "bot-message", true)
      })

    isBotResponding = false;
    enableUserInput();  
    
    chatBody.scrollTop = chatBody.scrollHeight
  }
}
function openDetailsForm(course) {
  isFormOpen = true
  disableUserInput()

  const template = document.getElementById("details-form-template")
  const formClone = template.content.cloneNode(true)

  const courseNameSpan = formClone.querySelector(".form-course-name")
  courseNameSpan.textContent = course
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ")

  const formContainer = document.createElement("div")
  formContainer.dataset.courseName = course.toLowerCase()
  formContainer.appendChild(formClone)
  chatBody.appendChild(formContainer)

  // smartScrollToNewMessage(formContainer)

  const submitBtn = formContainer.querySelector("#submit-details-btn")
  submitBtn.onclick = async () => {
  const name = document.getElementById("user-name").value.trim();
  const email = document.getElementById("user-email").value.trim();
  const phone = document.getElementById("user-phone").value.trim();
  const user_id = localStorage.getItem("userId")
  const courseName = formContainer.dataset.courseName

    try {
      console.log("[v0] Submitting form with:", { name, email, phone, course: courseName, user_id })

      const res = await fetch("https://smatal-institude.onrender.com/submit_details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, course: courseName, user_id }),
      })

      const data = await res.json()
      console.log("[v0] Response from backend:", data)

      if (data.status === "success") {
        formContainer.remove()
        displayBotResponse(data.response)
        isFormOpen = false
        enableUserInput()
        isBotResponding = false
      } else {
        displayMessage(data.response, "bot-message", true)
      }
    } catch (err) {
      console.error("[v0] Submit details error:", err)
      displayMessage("❌ Error submitting details. Please try again.", "bot-message", true)
    }
  }
}

// function validateName() {
//   const nameInput = document.getElementById("user-name")
//   const name = nameInput.value.trim()

//   if (!name || name.length < 2) {
//     return false
//   }

//   return true
// }

// function validateEmail() {
//   const emailInput = document.getElementById("user-email")
//   const email = emailInput.value.trim()

//   const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

//   if (!emailPattern.test(email)) {
//     return false
//   }

//   return true
// }

// function validatePhone() {
//   const phoneInput = document.getElementById("user-phone")
//   const phone = phoneInput.value.trim()

//   const cleanPhone = phone.replace(/\D/g, "")

//   if (cleanPhone.length !== 10 || !/^[6-9]/.test(cleanPhone)) {
//     return false
//   }

//   return true
// }

function displayMessage(message, type, isBot = false) {
  const messageElement = document.createElement("div")
  messageElement.classList.add(type)
  messageElement.innerHTML = isBot ? message : escapeHtml(message)
  chatBody.appendChild(messageElement)
  chatBody.scrollTop = chatBody.scrollHeight
}

function displayBotResponse(response) {
  if (response) {
    const points = response.split("\n")

    const wrapper = document.createElement("div")
    wrapper.classList.add("bot-message-wrapper")

    const avatar = document.createElement("div")
    avatar.classList.add("bot-avatar")

    const botResponseContainer = document.createElement("div")
    botResponseContainer.classList.add("bot-message")

    points.forEach((point) => {
      if (point.trim() !== "") {
        const pointElement = document.createElement("div")
        const formattedText = point.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        pointElement.innerHTML = '<span class="point"></span>' + formattedText
        botResponseContainer.appendChild(pointElement)
      }
    })
    
    wrapper.appendChild(avatar)
    wrapper.appendChild(botResponseContainer)
    chatBody.appendChild(wrapper)
  } else {
    displayMessage("Sorry, I couldn't get a valid response.", "bot-message", true)
  }
}

function escapeHtml(text) {
  const div = document.createElement("div")
  div.innerText = text
  return div.innerHTML
}

const COURSE_DETAILS = {
  python:
    "Python is a versatile programming language used for web development, data science, automation, and AI. This course covers basics to advanced topics in Python.",
  "cyber security":
    "Cybersecurity involves protecting networks and systems from attacks. This course includes ethical hacking, network security, and threat management.",
  "data science":
    "Data Science combines statistics, programming, and domain knowledge to extract insights from data. Learn Python, machine learning, and visualization.",
  "ms office":
    "Learn Microsoft Office tools like Word, Excel, PowerPoint, and Outlook for productivity and professional use.",
  "video editing":
    "Learn to edit videos using popular tools like Adobe Premiere, Final Cut Pro, and DaVinci Resolve. Covers basic to advanced techniques.",
  "tally":
    "Tally is a popular accounting software used to manage business finances. Learn to handle accounting entries, GST, payroll, and generate reports efficiently for small to medium enterprises.",
  "powerbi":
    "Power BI is a business intelligence tool for data visualization and reporting. Learn to create interactive dashboards, charts, and data-driven insights to make informed business decisions.",
  "c/c++":
    "C and C++ are fundamental programming languages used for system programming, game development, and software development. Learn variables, loops, functions, object-oriented programming, and problem-solving techniques.",
  "graphic design":
    "Graphic Design focuses on visual communication using tools like Photoshop, Illustrator, and Figma. Learn to create logos, posters, social media content, and professional visual designs.",
  "data analytics":
    "Data Analytics is about analyzing and interpreting data to make business decisions. Learn statistics, Excel, Python/R, data visualization, and building dashboards to extract meaningful insights.",
  "full stack":
    "Full Stack Development teaches front-end and back-end web development. Learn HTML, CSS, JavaScript, React, Node.js, databases, and build complete web applications from scratch.",
  "digital marketing":
    "Digital Marketing covers online promotion strategies. Learn SEO, social media marketing, email campaigns, Google Ads, content marketing, and analytics to grow businesses online.",
}

document.addEventListener("click", (e) => {
  const btn = e.target instanceof Element ? e.target.closest(".course-card") : null
  if (!btn) return
  const labelEl = btn.querySelector(".course-title")
  const raw = labelEl
    ? labelEl.textContent.trim()
    : (btn.getAttribute("data-prompt") || "").replace(" course details", "").trim()
  if (!raw) return

  document.getElementById("quick-courses")?.classList.add("hidden")
  displayMessage(`${raw} course details`, "user-message")

  const key = raw.toLowerCase()
  const details = COURSE_DETAILS[key] || "Course details coming soon."
  const wrapper = document.createElement("div")
  wrapper.classList.add("bot-message-wrapper")

  const avatar = document.createElement("div")
  avatar.classList.add("bot-avatar")

  const botResponse = document.createElement("div")
  botResponse.classList.add("bot-message")
  botResponse.innerHTML = `<div class="course-detail-title">${raw}</div><div class="course-detail-text">${escapeHtml(details)}</div>`

  wrapper.appendChild(avatar)
  wrapper.appendChild(botResponse)
  chatBody.appendChild(wrapper)
})

// function updateStatusDot() {
//   const dot = document.querySelector(".status-dot")
//   if (!dot) return
//   if (navigator.onLine) {
//     dot.classList.remove("offline")
//     dot.title = "Online"
//   } else {
//     dot.classList.add("offline")
//     dot.title = "Offline"
//   }
// }
// window.addEventListener("online", updateStatusDot)
// window.addEventListener("offline", updateStatusDot)
// updateStatusDot()

// const style = document.createElement("style")
// style.innerHTML = `.hidden{display:none !important;}`
// document.head.appendChild(style)

// function smartScrollToNewMessage(el) {
//   if (!el) return
//   requestAnimationFrame(() => {
//     const container = chatBody
//     const isLong = el.scrollHeight > container.clientHeight * 0.6
//     if (isLong) {
//       el.scrollIntoView({ behavior: "smooth", block: "start" })
//     } else {
//       container.scrollTop = container.scrollHeight
//     }
//   })
// }