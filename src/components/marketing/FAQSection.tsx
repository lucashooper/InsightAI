import React, { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: 'What is Insight?',
    answer: 'Insight is an AI-powered journaling app that helps you understand your emotional patterns, track your mental wellbeing, and build better habits. It analyzes your journal entries to surface meaningful insights about your thoughts, feelings, and behaviors.'
  },
  {
    question: 'Who is Insight for?',
    answer: 'Insight is for anyone looking to improve their mental wellbeing and self-awareness. Whether you\'re dealing with stress, anxiety, or simply want to understand yourself better, Insight provides personalized insights and actionable strategies based on your unique patterns.'
  },
  {
    question: 'How is my data used?',
    answer: 'Your data is private and secure. We use end-to-end encryption to protect your journal entries. Your information is used solely to generate personalized insights for you. We never share your data with third parties without your explicit consent.'
  },
  {
    question: 'Can I cancel my subscription anytime?',
    answer: 'Yes, you can cancel your Insight Pro subscription at any time. There are no long-term commitments, and you can continue to enjoy the benefits until the end of your billing cycle.'
  }
];

const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="faq-section">
      <div className="faq-container">
        <h2 className="faq-title">Common Questions</h2>
        <div className="faq-list">
          {faqData.map((item, index) => (
            <div 
              key={index} 
              className={`faq-item ${openIndex === index ? 'faq-item-open' : ''}`}
            >
              <button 
                className="faq-question" 
                onClick={() => toggleFAQ(index)}
                aria-expanded={openIndex === index}
              >
                <span>{item.question}</span>
                <svg 
                  className="faq-chevron" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 20 20" 
                  fill="none"
                  style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  <path 
                    d="M5 7.5L10 12.5L15 7.5" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
              {openIndex === index && (
                <div className="faq-answer">
                  <p>{item.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
