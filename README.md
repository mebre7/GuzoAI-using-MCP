# ✈️ GuzoAI - multi-agent travel planner using MCP

This is the MCP-powered version of [GuzoAI](https://github.com/mebre7/GuzoAI). Compared to the original, tools are now exposed and consumed via the **Model Context Protocol (MCP)**, and a new **Weather Agent** has been added.

A multi-agent AI travel planner that takes natural language input and generates personalized travel itineraries — including flights, hotels, weather, activities, and local attractions.

## Plan a better trip, in one conversation

GuzoAI turns a travel idea into a practical, personalized plan.

Tell it where you want to go, when you are traveling, what you enjoy, and how you want to spend. GuzoAI brings those details together into a day-by-day itinerary with flight guidance, hotel suggestions, local experiences, budget planning, and useful destination context.

> **Guzo** (ጉዞ) means “journey” in Amharic.

## What GuzoAI helps with

- **Start naturally**: describe a trip in your own words instead of filling out a long form.
- **Shape the experience**: adjust trip length, travel style, budget, and number of travelers.
- **Explore flight options**: see route guidance and destination hubs on an interactive map after your plan is ready.
- **Find places to stay**: get accommodation ideas suited to the destination and your preferences.
- **Build a realistic itinerary**: receive a clear day-by-day plan with activities, food, sightseeing, and local highlights.
- **Travel with more context**: use weather information, local phrases, customs, and practical planning suggestions.
- **Keep the plan**: save trips, compare saved plans, share a plan, and export a printer-friendly copy.
- **Use your voice**: provide trip details by speaking when supported by your browser.

GuzoAI is designed to help with the planning decisions that make a trip feel personal: pace, comfort, interests, budget, and the places you actually want to experience.

## A simple planning flow

1. Describe the trip you have in mind.
2. Add or adjust your dates, style, budget, and travelers.
3. Review the personalized summary, itinerary, flight information, and hotel suggestions.
4. Save, compare, share, or export the plan.

## Important expectations

Flight and hotel information can change. GuzoAI provides route guidance, recommendations, and estimates to support planning; it does not guarantee ticket prices, availability, taxes, fees, or bookable fares. Confirm current details with the airline, hotel, or booking provider before paying.

## How it works

GuzoAI receives one travel request, gathers supporting information, and combines the results into one plan. The workflow can use flight information, accommodation search, weather context, and language-model planning to produce the final response. Conversation state is persisted in PostgreSQL so a planning thread can continue across requests.

The implementation uses:

- **FastAPI** for the web application and planner API
- **LangGraph** and **LangChain** for the planning workflow
- **Groq** or **Gemini** for language-model responses
- **MCP-connected tools** for flight, hotel, and weather information
- **PostgreSQL** for persistent conversation state

## Agents

| Agent | Role |
|---|---|
| Flight Agent | Finds live flight data based on route and travel dates using AviationStack API |
| Hotel Agent | Recommends accommodations based on budget and preferences via DuckDuckGo search |
| Weather Agent | Fetches weather forecasts for the destination to help plan activities |
| Itinerary Agent | Builds a day-by-day travel plan with activities and sightseeing |
| Final Response Agent | Compiles all agent outputs into a cohesive travel plan |

Each agent shares a common **State** stored in PostgreSQL, which acts as persistent memory across the session. State fields: `user_query`, `flight_results`, `hotel_results`, `weather_results`, `itinerary`, `final_response`, `messages`.

## What Changed from the Non-MCP Version

- Tools (`flight_tool`, `search_tool`) are now exposed as **MCP servers**
- Agents consume tools via the **MCP client** instead of direct function calls
- A new **Weather Agent** is included to provide destination weather context
- Tool logic is decoupled from agent logic, making it easier to swap or extend tools

## Tech Stack

- [LangGraph](https://github.com/langchain-ai/langgraph) — multi-agent workflow orchestration
- [LangChain + Groq](https://python.langchain.com/) — LLM integration
- [MCP (Model Context Protocol)](https://modelcontextprotocol.io/) — tool serving and consumption
- [AviationStack API](https://aviationstack.com/) — live flight data
- [DuckDuckGo Search](https://pypi.org/project/ddgs/) — web search tool
- [OpenWeatherMap API](https://openweathermap.org/api) — weather forecasts
- [PostgreSQL](https://www.postgresql.org/) — persistent agent memory
- [FastAPI](https://fastapi.tiangolo.com/) — web server
- **Vanilla HTML, CSS, and JavaScript** for the default user interface

## License

[MIT](LICENSE)

> NEXT STEP: Final, fully functional product with a polished UI, more agents, Guardrails, HITL, and additional features.