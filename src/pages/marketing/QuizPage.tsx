import React, { useMemo } from 'react';
import QuizFlow from '../../components/marketing/quiz/QuizFlow';
import { usePageMeta } from '../../hooks/marketing/usePageMeta';
import '../../styles/marketing.css';
import '../../styles/quiz.css';

const QuizPage: React.FC = () => {
  const meta = useMemo(
    () => ({
      title: 'Free Cognitive Reflection Quiz | Insight — AI Mindfulness Journal',
      description:
        'Take Insight’s 4-minute cognitive profile quiz. Discover your thought-loop patterns and get a personalized 28-day reflection plan — a thoughtful Liven alternative.',
      canonical: 'https://myinsightai.app/quiz',
      keywords:
        'AI cognitive reflection, mindfulness journal, mental clarity app, Liven alternative, overthinking quiz, anxiety journaling, self-discovery app',
      ogTitle: 'Discover Your Cognitive Reflection Profile | Insight Quiz',
      ogDescription:
        'Answer a few questions and get a personalized AI reflection plan. Free mindfulness journal app for mental clarity.',
      ogType: 'website',
      schema: [
        {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: 'Insight Cognitive Reflection Quiz',
          description:
            'Interactive quiz to discover your cognitive reflection profile and get a personalized AI journaling plan.',
          url: 'https://myinsightai.app/quiz',
          isPartOf: { '@type': 'WebSite', name: 'Insight', url: 'https://myinsightai.app' },
        },
        {
          '@context': 'https://schema.org',
          '@type': 'SoftwareApplication',
          name: 'Insight',
          applicationCategory: 'HealthApplication',
          operatingSystem: 'iOS',
          description:
            'AI-powered cognitive reflection and mindfulness journal for mental clarity, anxiety processing, and daily journaling.',
          url: 'https://myinsightai.app',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      ],
    }),
    [],
  );

  usePageMeta(meta);

  return (
    <div className="App marketing-page marketing-page--light quiz-page">
      <QuizFlow />
    </div>
  );
};

export default QuizPage;
