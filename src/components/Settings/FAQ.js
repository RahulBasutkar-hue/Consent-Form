import React, { useState } from 'react';
import '../../styles/FAQ.css';

const FAQ = () => {
  const [activeIndex, setActiveIndex] = useState(null);
  const [query, setQuery] = useState('');
  const [contacted, setContacted] = useState(false);

  const faqData = [
    {
      question: 'Why do you need consent to use my transaction data?',
      answer: 'Consent allows the bank to use your transaction data for identity verification, fraud screening, and related protected workflows. It is limited to these stated purposes and is not used for unrelated marketing or profiling.'
    },
    {
      question: 'How do I give consent?',
      answer: 'Open Home, select Give consent, and confirm the one-time passcode sent to the phone number on your account. Consent is recorded only after the OTP is verified.'
    },
    {
      question: 'What happens if I opt out?',
      answer: 'Your transaction data will not be used for the verification workflow, and an OTP will not be requested. You can choose to give consent later from Home.'
    },
    {
      question: 'Why is an OTP required?',
      answer: 'The OTP confirms that you control the phone number linked to your account before consent is recorded. The code is four digits and expires according to the verification flow.'
    },
    {
      question: 'How is my transaction data handled?',
      answer: 'The data is used only for the stated verification purpose, retained only as long as necessary, and not processed for unrelated marketing, profiling, or secondary use without additional consent.'
    },
    {
      question: 'How do credit card offers work?',
      answer: 'After verification, Home can show available card offers and their recommended credit scores. Select Contact bank for offers if you want the team to follow up with suitable options.'
    },
    {
      question: 'Can I update my profile details?',
      answer: 'Yes. Open Profile, choose Edit Profile, update the available fields, and save your changes. Your profile information helps the team contact you about account and offer requests.'
    },
    {
      question: 'How do I change my password?',
      answer: 'Open Settings and go to Security. Enter your current password and a new password, then submit the form. You can log in again with the updated password.'
    },
    {
      question: 'How do I contact support?',
      answer: 'Use the Contact Support button below the FAQs. A support request will be recorded and the team will reply using the email on your profile.'
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
