import { useState } from "react";
import "./App.css";
import CalendarView from "./CalendarView";

import myData from "./mock/200.json";

function App() {
  const [days, setDays] = useState("2");
  const [fetchStatus, setFetchStatus] = useState("200");
  const [country, setCountry] = useState("bangkok, thailand");
  const [rawPlan, setRawPlan] = useState("");
  const [loading, setLoading] = useState(false);
  const [structuredPlan, setStructuredPlan] = useState(null);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!days || !country) {
      setError("Please provide both number of days and a country.");
      return;
    }
    setError("");
    setLoading(true);
    setRawPlan("");
    setStructuredPlan(null);

    try {
      let response;
      if (fetchStatus === "none") {
        response = await fetchData();
      }
      if (fetchStatus === "200") {
        response = fetchMockData200();
      }
      if (fetchStatus === "400") {
        response = fetchMockDataThrow400();
      }
      if (fetchStatus === "500") {
        response = fetchMockDataThrow500();
      }
      console.log("Mock data fetched successfully", response);
      if (!response.ok) {
        throw new Error("Failed to get response from the server.");
      }

      const data = await response.json();
      setRawPlan(
        data.rawText ||
        JSON.stringify(data.plan, null, 2) ||
        "No text response."
      );

      if (data.plan && data.plan.itinerary) {
        setStructuredPlan(data.plan.itinerary);
      } else {
        setStructuredPlan(null);
        if (data.error) {
          setError((prev) => (prev ? prev + " " : "") + data.error);
        }
      }
    } catch (err) {
      if (fetchStatus !== "none") {
        // For mock errors, just display the error message
        setError(`${err}`);
      } else {
        setError(
          "An error occurred while generating the plan. Please try again." + err
        );
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  async function fetchData() {
    return await fetch(
      process.env.REACT_APP_TRIP_PLANNER_API_URL
      ,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ days, country }),
      }
    );
  }

  function fetchMockData200() {
    return new Response(JSON.stringify(myData), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  function fetchMockDataThrow400() {
    throw new Error("Days and country are required.");
  }
  function fetchMockDataThrow500() {
    throw new Error("Failed to generate travel plan");
  }

  return (
    <div className="App">
      <nav className="App-nav">
        <select
          name="fetchStatus"
          id="fetchStatus"
          defaultValue="200"
          onChange={(e) => {
            setFetchStatus(e.target.value);
          }}
        >
          <option value="200">Mock Response 200 ok</option>
          <option value="400">Mock Response 400 Bad Request</option>
          <option value="500">Mock Response 500 Server Error</option>
          <option value="none">No Mock</option>
        </select>
      </nav>
      <header className="App-header">
        <h1 data-testid="header">Trip Planner Generator</h1>
        <form onSubmit={handleSubmit} className="plan-form">
          <div className="input-group" data-testid="input-group">
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              placeholder="Number of days (e.g., 3)"
              data-testid="day"
            />
            <input
              type="text"
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              placeholder="Country (e.g., Thailand)"
              data-testid="country"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            data-testid="generate-button"
          >
            {loading ? "Generating..." : "Generate Plan"}
          </button>
        </form>
        {error && <p className="error">{error}</p>}
        <textarea
          className="plan-result"
          value={rawPlan}
          readOnly
          placeholder="Your raw JSON travel plan will appear here..."
        />

        <CalendarView itinerary={structuredPlan} />
      </header>
    </div>
  );
}

export default App;
