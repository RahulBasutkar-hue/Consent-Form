import React, { useState } from 'react';
import '../../styles/FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [contacted, setContacted] = useState(false);

  const faqData = [
    {
      question: 'How do I reset my password?',
      answer: 'Open Settings > Security and use Change Password. Demo current password starts as password123 unless you already changed it.'
    },
    {
      question: 'How does OTP verification work?',
      answer: 'From Home, choose Give consent to send a 4-digit OTP to the phone on your account, or Opt-out to skip it.'
    },
    {
      question: 'Can I change my profile information?',
      answer: 'Yes. Go to Profile, click Edit Profile, update your details, then Save. Changes stay in this browser.'
    },
    {
      question: 'How do I enable dark mode?',
      answer: 'Go to Settings > General and toggle Dark Mode.'
    },
    {
      question: 'What is two-factor authentication?',
      answer: 'Two-factor authentication adds a second verification step. Toggle it in Settings > Security, then complete the OTP flow from Home.'
    },
    {
      question: 'How do I contact support?',
      answer: 'Use Contact Support below, or the feedback option in Settings > About.'
    },
    {
      question: 'Is my data secure?',
      answer: 'This demo stores login session and profile data only in localStorage on your machine.'
    },
    {
      question: 'How do I delete my account?',
      answer: 'This demo has no server account. Use Logout to end the session.'
    }
  ];

  const filteredFaqs = faqData.filter((item) => {
    const haystack = `${item.question} ${item.answer}`.toLowerCase();
    return haystack.includes(query.toLowerCase().trim());
  });

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-container">
      <div className="panel-header">
        <div>
          <h2>Frequently asked questions</h2>
          <p className="faq-lead">Search the knowledge base or expand a topic below.</p>
        </div>
      </div>

      <div className="search-box">
        <input
          type="text"
          placeholder="Search FAQs..."
          className="faq-search"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setActiveIndex(null);
          }}
        />
      </div>

      <div className="faq-list">
        {filteredFaqs.length === 0 && <p className="form-message">No FAQs match your search.</p>}
        {filteredFaqs.map((item, index) => (
          <div key={item.question} className="faq-item">
            <div
              className={`faq-question ${activeIndex === index ? 'active' : ''}`}
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => e.key === 'Enter' && toggleFAQ(index)}
              role="button"
              tabIndex={0}
            >
              <span>{item.question}</span>
              <span className="faq-icon">
                {activeIndex === index ? '−' : '+'}
              </span>
            </div>

            {activeIndex === index && (
              <div className="faq-answer">
                <p>{item.answer}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="faq-contact">
        <h4>Still have questions?</h4>
        <p>Can't find what you're looking for? Contact our support team.</p>
        <button type="button" className="contact-support-btn" onClick={() => setContacted(true)}>
          Contact Support
        </button>
        {contacted && <p className="faq-contact-confirm">Support request sent. We will reply to your profile email.</p>}
      </div>
    </div>
  );
};

export default FAQ;
