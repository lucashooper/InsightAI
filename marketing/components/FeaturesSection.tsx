import React from 'react';
import { Brain, BarChart3, Target, Shield, FileText, Palette } from 'lucide-react';

const features = [
  {
    icon: Brain,
    title: 'AI-Powered Insights',
    description: 'Understand your emotional journey and identify trends in your daily life',
  },
  {
    icon: BarChart3,
    title: ' Beautiful Dashboards',
    description: 'Visualize your progress with interactive charts and sentiment flow graphs',
  },
  {
    icon: Target,
    title: 'Pattern Recognition',
    description: 'Automatically detect recurring themes and opportunities for personal growth',
  },
  {
    icon: Shield,
    title: 'Privacy First',
    description: 'Your data stays on your device. End-to-end encryption ensures complete privacy',
  },
  {
    icon: FileText,
    title: 'Smart Editor',
    description: 'Distraction-free writing with quick inputs and intelligent keyword highlighting',
  },
  {
    icon: Palette,
    title: ' Beautiful Themes',
    description: 'Carefully crafted dark themes designed for comfortable journaling',
  },
];

const FeaturesSection: React.FC = () => {
  return (
    <section className="features-section">
      <div className="container">
        <h2 className="section-title">
          <span className="gradient-text-insight">Everything you need to understand yourself.</span>
        </h2>
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
