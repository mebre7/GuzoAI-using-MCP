import os
import asyncio
import certifi
from dotenv import load_dotenv

from mcp_client import get_llm

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

from typing import TypedDict, Annotated
import operator
import uuid

from pydantic import SecretStr

import psycopg
from psycopg import Connection
from psycopg.rows import dict_row, DictRow

from langgraph.graph import StateGraph, START, END
from langgraph.checkpoint.postgres import PostgresSaver
from langchain_core.messages import (
    AnyMessage,
    HumanMessage,
    AIMessage,
    SystemMessage
)
from langchain_groq import ChatGroq
from langchain_core.runnables import RunnableConfig

# from tools.search_tool import duckduckgo_search # replaced with MCP version
# from mcp_client_test import search_with_ddg
# from tools.flight_tool import search_flights
from mcp_client import search_flight_info_with_mcp, search_hotels_info_with_mcp, extract_destination, search_current_weather_info_using_mcp, forecast_weather_using_mcp

def get_database_url():
    db_url = os.getenv("DATABASE_URL")
    if not db_url:
        raise ValueError("DATABASE_URL environment variable is not set. Set it to your PostgreSQL connection string.")
    
    if "sslmode" not in db_url:
        separator = '&' if '?' in db_url else '?'
        db_url = f"{db_url}{separator}sslmode=require"

    return db_url

load_dotenv()
LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "groq").lower()

GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
if not GROQ_API_KEY:
    raise ValueError("GROQ_API_KEY environment variable is not set. Set it to your Groq API key.")

# Groq deprecated llama-3.3-70b-versatile on 2026-08-16; see https://console.groq.com/docs/deprecations
GROQ_MODEL = os.environ.get("GROQ_MODEL", "Set Groq model")

# //
# LLM
# //
def get_llm():
    if LLM_PROVIDER == "gemini":
        from langchain_google_genai import ChatGoogleGenerativeAI
        api_key = os.environ.get("GOOGLE_API_KEY") or os.environ.get("GEMINI_API_KEY")
        if not api_key:
            raise ValueError("Set GOOGLE_API_KEY or GEMINI_API_KEY environment variable for Gemini LLM.")
        model = os.environ.get("GEMINI_MODEL", "gemini-2.5-flash")
        return ChatGoogleGenerativeAI(model=model, google_api_key=SecretStr(api_key))
    # default: groq
    from langchain_groq import ChatGroq
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("Set GROQ_API_KEY environment variable for Groq LLM.")
    model = os.environ.get("GROQ_MODEL", "openai/gpt-oss-120b")
    return ChatGroq(model=model, api_key=SecretStr(api_key))

llm = get_llm()
#//
# State
# //

def clip(text, max_chars=1500) -> str:
    s = str(text or "")
    return s if len(s) <= max_chars else s[:max_chars] + "\n...[truncated]"

class TravelState(TypedDict):
    messages: Annotated[list[AnyMessage], operator.add]
    user_query: str
    flight_results: str
    hotel_results: str
    itinerary: str
    llm_calls: int
    weather_results: str

PROMPT_FOR_FLIGHT_AGENT = """
You are a travel flight expert.
User Query: {query}

Airport Information: {airport_data}
Airline Information: {airline_data}

Generate:
1. A likely departure airport
2. A likely arrival airport
3. Airlines serving this route
4. Typical flight duration
5. Estimated airfare range
6. Peek season pricing warning
7. Booking advice
"""
# =============
#  Flight agent
# =============
def flight_agent(state: TravelState):
    print("\nINSIDE FLIGHT AGENT\n")

    # extract the user query from the state
    query = state.get("user_query", "")
    response = None
    try:
        airports = asyncio.run(search_flight_info_with_mcp(tool_name="list_airports"))
        airlines = asyncio.run(search_flight_info_with_mcp(tool_name="list_airlines"))

        print(f"\nAIRPORTS: {airports}\n")
        print(f"\nAIRLINES: {airlines}\n")

        prompt = PROMPT_FOR_FLIGHT_AGENT.format(
            query=query,
            airport_data = str(airports)[:3000],
            airline_data = str(airlines)[:3000]
        )

        response = llm.invoke(
            [
                SystemMessage(content="Your are an expert travel flight planner."),
                HumanMessage(content=prompt)
            ]
        )
    except Exception as e:
        print(f"Flight information unavailable: {str(e)}")

    flight_data = response.content if response else "No flight data generated."

    # update the state with the flight results
    return {
        "flight_results": flight_data,
        "messages": [
            AIMessage(content=f"Flight search fetched successfully.")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }
# =============
#  Hotel agent
# =============
def hotel_agent(state: TravelState):
    query = f"Best hotels for {state.get('user_query', '')}"
    # hotel_data = duckduckgo_search(query)
    hotel_data = asyncio.run(search_hotels_info_with_mcp(query))
    print(f"\nHOTEL DATA: {hotel_data}\n")

    return {
        "hotel_results": hotel_data,
        "messages": [
            AIMessage(content="Hotel search fetched successfully.")
        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# ===========================
# Weather agent
# ==========================
def weather_agent(state: TravelState):
    city = extract_destination(state["user_query"])

    weather_data = asyncio.run(
        search_current_weather_info_using_mcp(city)
    )
    forecast_data = asyncio.run(
        forecast_weather_using_mcp(city)
    )

    return {
        "weather_results": f"""
        Current Weather: {weather_data}
        Forecast: {forecast_data}
        """,
        "messages": [
            AIMessage(content="Weather data fetched successfully.")

        ],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =============
#  Itinerary agent
# =============
def itinerary_agent(state: TravelState):
    # Ask the LLM to combine flight and hotel results into an itinerary
    prompt = f"""
    You are a travel assistant. Create a complete travel itinerary.
    User Query: {state.get("user_query", "<missing>")}
    Flight Results: {clip(state.get("flight_results", "<missing>"))}
    Hotel Results: {clip(state.get("hotel_results", "<missing>"))}
    Weather Results: {clip(state.get("weather_results", "<missing>"))}
    Make the itinerary practical, budge-aware, and easy to follow. 
    """
    response = llm.invoke([
        SystemMessage(content="You are an expert travel planner."),
        HumanMessage(content=prompt)
    ])

    itinerary = response.content if response else "No itinerary generated."

    return {
        "itinerary": itinerary,
        "messages": [response] if response else [],
        "llm_calls": state.get("llm_calls", 0) + 1
    }
# =====================
# Final response agent
# =====================

def final_response_agent(state: TravelState):
    final_prompt = f"""
    General the final travel response for the user.
    User Request: {state.get("user_query", "<missing>")}
    Flights: {state.get("flight_results", "<missing>")}
    Hotels: {state.get("hotel_results", "<missing>")}
    Weather: {state.get("weather_results", "<missing>")}
    Itinerary: {state.get("itinerary", "<missing>")}

    Format the final answer beautifully using these sections:
    1. Summary of the trip
    2. Flight details or information
    3. Hotel suggestions
    4. Weather information
    5. Day-by-Day Itinerary
    6. Estimated Budget
    7. Final Recommendations

    Important:
    - Be clear and practical.
    - Mention that live flight API may not provide ticket prices if pricing is not available.
    - Keep the response useful for real travel planning.
    """
    response = llm.invoke([
        SystemMessage(content="You are a professional AI travel booking assistant."),
        HumanMessage(content=final_prompt)
    ])

    return {
        "messages": [response] if response else [],
        "llm_calls": state.get("llm_calls", 0) + 1
    }

# =================
# Building Graph
# =================

graph = StateGraph(TravelState)

# create nodes for each agent
graph.add_node(node="flight_agent", action=flight_agent)
graph.add_node(node="hotel_agent", action=hotel_agent)
graph.add_node(node="weather_agent", action=weather_agent)
graph.add_node(node="itinerary_agent", action=itinerary_agent)
graph.add_node(node="final_response_agent", action=final_response_agent)
# or simply -> graph.add_node(node="<node_name>", action=<function_name>)

# create edges to define the flow of the graph
graph.add_edge(start_key=START, end_key="flight_agent")
graph.add_edge(start_key="flight_agent", end_key="hotel_agent")
graph.add_edge(start_key="hotel_agent", end_key="weather_agent")
graph.add_edge(start_key="weather_agent", end_key="itinerary_agent")
graph.add_edge(start_key="itinerary_agent", end_key="final_response_agent")
graph.add_edge(start_key="final_response_agent", end_key=END)
# or simply -> graph.add_edge("<start_node>", "<end_node>")

# ========================
# Postgres Saver for Checkpointing
# ========================

DATABASE_URL = get_database_url()

_conn:Connection[DictRow] = psycopg.connect(
         DATABASE_URL, # this is the connection string for your PostgreSQL database
         autocommit=True, # this ensures that changes in the database are saved automatically without needing to call commit()
         row_factory=dict_row # this makes sure that the results we get from the database are in dictionary format, which is easier to work with
)

checkpoint_saver = PostgresSaver(conn=_conn)
checkpoint_saver.setup() # This sets up the necessary tables in the database for saving checkpoints. If the tables already exist, this will not overwrite them.

travel_graph = graph.compile(checkpointer=checkpoint_saver) # This compiles the graph and sets up the checkpointing mechanism using the PostgresSaver we just created.

# ========================
# Function to run the travel planning graph
# which is used by the API (FastAPI) endpoint to process user requests

def run_travel_planner(user_input: str, thread_id: str|None=None):
    # If no thread_id is provided, generate a new one
    if not thread_id:
        thread_id = f"user_{uuid.uuid4().hex}"

    config = {
        "configurable": {
            "thread_id": thread_id,
        }
    }

    result = travel_graph.invoke(
        {
            "messages": [
            HumanMessage(content=user_input)
        ],
        "user_query": user_input,
        "flight_results": "",
        "hotel_results": "",
        "weather_results": "",
        "itinerary": "",
        "llm_calls": 0
        },
        config=RunnableConfig(**config)
    )

    final_answer = result["messages"][-1].content if result["messages"] else "No response generated."

    return {
        "thread_id": thread_id,
        "answer": final_answer,
        "flight_results": result.get("flight_results", ""),
        "hotel_results": result.get("hotel_results", ""),
        "weather_results": result.get("weather_results", ""),
        "itinerary": result.get("itinerary", ""),
        "llm_calls": result.get("llm_calls", 0)
    }