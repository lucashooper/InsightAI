import React from 'react';
import { Brain, BarChart3, Target, Shield, FileText, Palette } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Advanced sentiment analysis and pattern detection to understand your emotional journey and identify trends in your daily life',
  },
  {
    icon: BarChart3,
    title: ' Beautiful Dashboards',
    description: 'Visualize your progress with interactive charts, sentiment flow graphs, and comprehensive monthly reviews',
  },
  {
    icon: Target,
    title: 'Pattern Recognition',
    description: 'Automatically detect recurring themes, triggers, and opportunities for personal growth in your journal entries',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays on your device. End-to-end encryption ensures your thoughts remain completely private',
  },
  {
    icon: FileText,
    title: 'Smart Editor',
    description: 'Distraction-free writing with quick inputs, auto-save, and intelligent highlighting of emotional keywords',
  },
  {
    icon: Palette,
    title: ' Beautiful Themes',
    description: 'Choose from carefully crafted dark themes designed for comfortable journaling at any time of day',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">Everything you need to understand yourself</h2>
        <p className="section-subtitle">
          InsightAI combines powerful AI with beautiful design to help you gain deeper insights into your habits and emotions
        </p>
        
        <div className="features-grid">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="feature-card glass-card">
                <div className="feature-icon-container">
                  <Icon className="feature-icon-svg" size={40} strokeWidth={1.5} />
                </div>
                <h3 className="feature-title">{feature.title}</h3>
                <p className="feature-description">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;
