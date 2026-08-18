import asyncio
import os
import certifi
from dotenv import load_dotenv
from pydantic import SecretStr
from langchain_mcp_adapters.client import MultiServerMCPClient

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

LLM_PROVIDER = os.environ.get("LLM_PROVIDER", "groq").lower()

load_dotenv()

OPENWEATHER_API_KEY = os.environ.get("OPENWEATHER_API_KEY")
# create the client and connect to the MCP servers

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

MCP_client = MultiServerMCPClient(
    {
        # DuckDuckGo remote MCP server
        "ddg-search": {
            "command": "uvx",
            "args": ["duckduckgo-mcp-server"],
            "transport": "stdio", # stdio, sse, websocket, http
            # "url": "https://html.duckduckgo.com/html"
        },

        # AviationStack local MCP server
        "Aviationstack MCP": {
            "transport": "stdio",
            "command": "uvx",
            "args": [
                "--with", "mcp[cli]>=1.10.1,<2",
                "aviationstack-mcp"
            ],
            "env": {
                "AVIATION_STACK_API_KEY": os.environ.get("AVIATIONSTACK_API_KEY"),
          }
        },
        # local custom MCP server
        "Weather MCP": {
            "transport": "stdio",
            "command": r"/home/mebratu/Documents/Coding/AI-agents/Projects/GuzoAI-using-MCP/.travel_mcp/bin/python3.14",
            "args": [
                r"/home/mebratu/Documents/Coding/AI-agents/Projects/GuzoAI-using-MCP/weather_mcp_server.py"
            ],
            "env": {
                "OPENWEATHER_API_KEY": OPENWEATHER_API_KEY
            }
        },
    }
)

# get all tools in the MCP client
async def get_all_mcp_tools():
    """
    Load each MCP server and print the tools available in each server.
    If there is broken server, it will print the error message and continue to the next server.
    """
    all_tools = []
    for server_name in ("ddg-search", "Aviationstack MCP", "Weather MCP"):
        try:
            tools = await MCP_client.get_tools(server_name=server_name)
            all_tools.extend(tools)
            print(f"\nConnected MCP tools in server '{server_name}':")
            for tool in tools:
                print(f"- {tool.name}")
        except Exception as e:
            print(f"\nError connecting to MCP server '{server_name}: {e}")
    return all_tools

# ===========================
# 1. DuckDuckGo tool
# ===========================

# get the search tool from the DuckDuckGo MCP server
search_tool = None
async def get_search_tools():
    global search_tool
    if search_tool is not None:
        return

    all_tools = await MCP_client.get_tools(server_name="ddg-search")

    tools = {
        tool.name: tool
        for tool in all_tools
    }

    # search_tool = next(
    #     tool for tool in tools.get("search")
    # )
    search_tool = tools.get("search")
    if search_tool is None:
        available_tools = ", ".join(sorted(tools.keys()))
        raise ValueError(
            f"DuckDuckGo MCP connected, but 'search' tool not found."
            f"\nAvailable tools: {available_tools or 'None'}"
        )

# Call DuckDuckGo MCP tool to search for hotels
async def search_hotels_info_with_mcp(query: str):
    await get_search_tools()
    result = await search_tool.ainvoke(
        {
            "query": query
        }
    )
    return result


# ===============================
# 2. AviationStack MCP tool
# ===============================

# get all tools
aviation_tools = {}
async def get_aviation_tools():
    global aviation_tools
    if aviation_tools:
        return

    tools = await MCP_client.get_tools(server_name="Aviationstack MCP")
    aviation_tools = {
        tool.name: tool for tool in tools
    }

    if not aviation_tools:
        raise RuntimeError(
            "AviationStack MCP connected, but no tools found. "
            "Please check the MCP server configuration and ensure that the AviationStack tool is available."
        )

# Call aviation MCP tool to search for flights
async def search_flight_info_with_mcp(tool_name: str, tool_args: dict = None):
    await get_aviation_tools()
    tool = aviation_tools.get(tool_name)
    if tool is None:
        available_tools = ", ".join(sorted(aviation_tools.keys()))
        raise ValueError(
            f"Tool '{tool_name} not found in AviationStack MCP."
            f"\nAvailable tools: {available_tools or 'None'}"
        )

    result = await tool.ainvoke(tool_args or {})
    return result

# ============================================
# 3. Weather MCP tools
# ============================================

# get weather tools
current_weather_tool = None
forecast_tool = None

async def get_weather_tools():
    global current_weather_tool, forecast_tool

    if current_weather_tool is not None and forecast_tool is not None:
        return

    tools = await MCP_client.get_tools(server_name="Weather MCP")
    
    all_weather_tools = {
        tool.name: tool
        for tool in tools
    }

    current_weather_tool = all_weather_tools.get("get_current_weather")
    forecast_tool = all_weather_tools.get("get_forecast")

# Call weather MCP tools to get weather information of a city

async def search_current_weather_info_using_mcp(city: str):
    await get_weather_tools()
    return current_weather_tool.ainvoke(
        {
            "city": city,
        }
    )

async def forecast_weather_using_mcp(city: str):
    await get_weather_tools()
    return forecast_tool.ainvoke(
        {
            "city": city,
        }
    )


# Destination extractor

def extract_destination(query: str):
    prompt = f"""
    Extract only the destination city or country.

    Query: {query}

    Return only destination name.
    """
    response = llm.invoke(prompt)
    return response.content.strip()