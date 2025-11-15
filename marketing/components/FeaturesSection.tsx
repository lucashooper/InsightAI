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
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything you need to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
              understand yourself.
            </span>
          </h2>
          <p className="text-gray-400 text-lg max-w-2xl mx-auto">
            InsightAI combines powerful AI with beautiful design to help you gain deeper
            insights into your habits and emotions
          </p>
        </div>
        
        {/* Feature cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div key={index} className="relative group">
                {/* Hover glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-blue-600 
                                rounded-2xl opacity-0 group-hover:opacity-20 
                                blur-xl transition-opacity duration-500" />
                
                {/* Card */}
                <div className="relative h-full bg-gradient-to-br from-gray-900/90 to-gray-800/50 
                                backdrop-blur-sm border border-white/10 
                                rounded-2xl p-8
                                hover:border-white/20 transition-all duration-300">
                  {/* Icon */}
                  <div className="mb-6 inline-flex p-4 rounded-2xl 
                                  bg-gradient-to-br from-purple-600/20 to-blue-600/20
                                  border border-white/10
                                  shadow-lg shadow-purple-500/20">
                    <Icon className="w-8 h-8 text-purple-400" strokeWidth={1.5} />
                  </div>
                  
                  {/* Content */}
                  <h3 className="text-xl font-semibold mb-3 text-white">
                    {feature.title}
                  </h3>
                  <p className="text-gray-400 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
export default FeaturesSection;
