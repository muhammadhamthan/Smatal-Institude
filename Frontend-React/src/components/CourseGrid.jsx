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

const CourseGrid = ({ onCourseClick }) => {
    return (
        <div id="quick-courses" className="courses-grid" aria-label="Quick course categories">
            {courses.map((c, index) => (
                <button key={index} className={`course-card ${c.color}`} onClick={() => onCourseClick(c.label)}>
                    <i className={`${c.icon} card-icon`}></i>
                    <div className="card-text">
                        <span className="course-title">{c.label}</span>
                        <span className="course-sub">{c.sub}</span>
                    </div>
                </button>
            ))}
        </div>
    )
}

export default CourseGrid
