import React from "react";
import "./CalendarView.css";

export const CalendarView = ({ itinerary }) => {
  if (!itinerary || itinerary.length === 0) {
    return null;
  }

  return (
    <div className="calendar-view">
      <h2 data-testid="calendar-header">Trip Planner</h2>
      <div className="calendar-grid">
        {itinerary.map((dayPlan) => (
          <div key={dayPlan.day} className="calendar-day">
            <h3 data-testid={`header-${dayPlan.day}`}>
              Day {dayPlan.day}: {dayPlan.title}
            </h3>
            <div className="day-details" data-testid={`section-${dayPlan.day}`}>
              <div className="time-slot">
                <h4>Morning</h4>
                <p>
                  <strong>Activity:</strong> {dayPlan.morning.activity}
                </p>
                <p>
                  <em>{dayPlan.morning.description}</em>
                </p>
              </div>
              <div className="time-slot">
                <h4>Lunch</h4>
                <p>{dayPlan.lunch.description}</p>
                <ul>
                  {dayPlan.lunch.food_suggestions.map((food, index) => (
                    <li key={index}>{food}</li>
                  ))}
                </ul>
              </div>
              <div className="time-slot">
                <h4>Afternoon</h4>
                <p>
                  <strong>Activity:</strong> {dayPlan.afternoon.activity}
                </p>
                <p>
                  <em>{dayPlan.afternoon.description}</em>
                </p>
              </div>
              <div className="time-slot">
                <h4>Evening</h4>
                <p>
                  <strong>Activity:</strong> {dayPlan.evening.activity}
                </p>
                <p>
                  <em>{dayPlan.evening.description}</em>
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CalendarView;
