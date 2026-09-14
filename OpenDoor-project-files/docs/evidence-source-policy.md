# Digital Evidence Source Policy

## Decision
For the scope of the hackathon MVP, we are **not** building a general-purpose web crawler or integrating with third-party mapping APIs (like Google Places or Yelp) to scrape accessibility data.

## Rationale
- **Reliability**: Web scraping for highly specific accessibility facts (e.g., "Is the elevator currently working?") is notoriously flaky and often outdated.
- **Hackathon Timeframe**: Building and testing a reliable scraper detracts from the core thesis, which is the CALL-E integration and feasibility engine.
- **Project Brief Compliance**: The prompt explicitly advises: "Do not implement a broad web crawler. Prefer deterministic/manual seeded evidence for the first demo path if external web retrieval is not reliable enough."

## Implementation
We will implement a `SeededDigitalEvidenceSource` adapter. This adapter will mock a digital lookup by returning deterministic evidence for a few known test venues. Any constraint not found in the seeded database will correctly remain `unknown`, triggering the need for a CALL-E verification call.
