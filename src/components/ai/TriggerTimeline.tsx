import React from 'react';

interface TimelineEvent {
  relative_date: string;
  trigger_summary: string;
}

interface TriggerTimelineProps {
  events: TimelineEvent[];
  isLoading?: boolean;
}

const TriggerTimeline: React.FC<TriggerTimelineProps> = ({ events, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="trigger-timeline-container">
        <h4>Analyzing Trigger Timeline...</h4>
        <div className="timeline-loading">
          <div className="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
          <p>Looking for patterns in your recent entries...</p>
        </div>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return null;
  }

  return (
    <div className="trigger-timeline-container">
      <h4>Potential Trigger Timeline</h4>
      <p className="timeline-description">
        Based on your recent entries, here are events that may have contributed to today's challenges:
      </p>
      <div className="timeline">
        {events.map((event, index) => (
          <div key={index} className="timeline-item">
            <div className="timeline-dot"></div>
            <div className="timeline-content">
              <span className="timeline-date">{event.relative_date}</span>
              <p className="timeline-text">{event.trigger_summary}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TriggerTimeline; 