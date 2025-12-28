import { useState } from 'react'

const DetailsForm = ({ courseName, onSubmit }) => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '' })
    const [errors, setErrors] = useState({})

    const validate = () => {
        const newErrors = {}
        if (!formData.name || formData.name.length < 2) newErrors.name = true
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = true
        if (!/^[6-9]\d{9}$/.test(formData.phone)) newErrors.phone = true
        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = () => {
        if (validate()) {
            onSubmit(formData)
        }
    }

    return (
        <div className="details-form-message">
            <h4>Get <span className="form-course-name">{courseName}</span> Syllabus</h4>

            <div className={`form-field ${errors.name ? 'error' : ''}`}>
                <label htmlFor="user-name">
                    <span className="icon">👤</span> Full Name
                </label>
                <input
                    type="text"
                    id="user-name"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
                <span className="error-message">Name must be at least 2 characters</span>
            </div>

            <div className={`form-field ${errors.email ? 'error' : ''}`}>
                <label htmlFor="user-email">
                    <span className="icon">✉️</span> Email Address
                </label>
                <input
                    type="email"
                    id="user-email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
                <span className="error-message">Please enter a valid email</span>
            </div>

            <div className={`form-field ${errors.phone ? 'error' : ''}`}>
                <label htmlFor="user-phone">
                    <span className="icon">📱</span> Phone Number
                </label>
                <input
                    type="text"
                    id="user-phone"
                    placeholder="9876543210"
                    maxLength="10"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value.replace(/\D/g, '') })}
                />
                <span className="error-message">Phone must be 10 digits starting with 6-9</span>
            </div>

            <button id="submit-details-btn" onClick={handleSubmit}>
                Get Syllabus
            </button>
        </div>
    )
}

export default DetailsForm
