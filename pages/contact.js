import { useState } from 'react';
import Link from 'next/link';

export default function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formError, setFormError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);

  const faqs = [
    {
      question: "How do I track my order?",
      answer: "You can track your order by logging into your account and visiting the 'Orders' section. You'll receive tracking information via email once your order ships."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and other secure payment methods. All transactions are encrypted and secure."
    },
    {
      question: "What is your return policy?",
      answer: "We offer a 30-day return policy for most items. Products must be unused and in original packaging. Please contact our support team to initiate a return."
    },
    {
      question: "How long does shipping take?",
      answer: "Standard shipping typically takes 3-5 business days. Express shipping is available for 1-2 day delivery. International shipping may take 7-14 business days."
    },
    {
      question: "Do you ship internationally?",
      answer: "Yes, we ship to most countries worldwide. Shipping costs and delivery times vary by location. You can check shipping rates during checkout."
    }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!formData.name || !formData.email || !formData.message) {
      setFormError('Please fill out all required fields');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }
    
    // Form submission would go here
    console.log('Form submitted:', formData);
    
    // For demo purposes, we'll just set the form as submitted
    setFormSubmitted(true);
    setFormError(null);
  };

  return (
    <div className="contact-page">
      {/* Page Header */}
      <div className="page-header">
        <h1>Contact Us</h1>
        <p>We'd love to hear from you!</p>
      </div>

      {/* Contact Sections */}
      <div className="contact-sections">
        <section className="contact-form-section">
          <h2>Send us a Message</h2>
          
          {formSubmitted ? (
            <div className="success-message">
              <h3>Thank you for your message!</h3>
              <p>We've received your inquiry and will get back to you as soon as possible.</p>
              <button 
                className="btn-outline" 
                onClick={() => {
                  setFormData({ name: '', email: '', subject: '', message: '' });
                  setFormSubmitted(false);
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="contact-form">
              {formError && <div className="form-error">{formError}</div>}
              
              <div className="form-group">
                <label htmlFor="name">Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="subject">Subject</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                ></textarea>
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn-primary">Send Message</button>
              </div>
            </form>
          )}
        </section>
        
        <section className="contact-info-section">
          <h2>Contact Information</h2>
          
          <div className="contact-info">
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-content">
                <h3>Address</h3>
                <p>
                  123 Car Rental Avenue<br />
                  Suite 456<br />
                  New York, NY 10001<br />
                  United States
                </p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-content">
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">✉️</div>
              <div className="info-content">
                <h3>Email</h3>
                <p>support@revxrent.com</p>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">⏰</div>
              <div className="info-content">
                <h3>Business Hours</h3>
                <p>Monday - Friday: 9am - 6pm EST</p>
                <p>Saturday: 10am - 4pm EST</p>
                <p>Sunday: Closed</p>
              </div>
            </div>
          </div>
          
          <div className="social-links">
            <h3>Follow Us</h3>
            <div className="social-icons">
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                Twitter
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                Facebook
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                Instagram
              </a>
              <a href="#" target="_blank" rel="noopener noreferrer" className="social-icon">
                LinkedIn
              </a>
            </div>
          </div>
        </section>
      </div>

      {/* FAQ Section */}
      <section className="faq-section">
        <h2>Frequently Asked Questions</h2>
        
        <div className="faq-container">
          {faqs.map((faq, index) => (
            <div 
              key={index} 
              className={`faq-item ${activeTab === index ? 'active' : ''}`}
              onClick={() => setActiveTab(activeTab === index ? -1 : index)}
            >
              <div className="faq-question">
                <h3>{faq.question}</h3>
                <span className="faq-toggle">{activeTab === index ? '−' : '+'}</span>
              </div>
              <div className="faq-answer" style={{ display: activeTab === index ? 'block' : 'none' }}>
                <p>{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
        
        <div className="faq-more">
          <p>Don't see your question here? Feel free to contact us directly.</p>
        </div>
      </section>

      {/* Map Section */}
      <section className="map-section">
        <h2>Find Us</h2>
        <div className="map-container">
          {/* This would be replaced with an actual map implementation */}
          <div className="placeholder-map">
            <img 
              src="https://via.placeholder.com/1200x400?text=Google+Map+Location" 
              alt="Map location" 
              className="map-image"
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="contact-cta-section">
        <div className="cta-content">
          <h2>Ready to Start Renting?</h2>
          <p>Explore our catalog of products available for purchase or rent.</p>
          <Link href="/catalog">
            <button className="btn-primary">Rent a Car</button>
          </Link>
        </div>
      </section>
    </div>
  );
} 