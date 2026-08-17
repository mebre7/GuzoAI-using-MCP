import asyncio
import os
import certifi
from dotenv import load_dotenv
from langchain_mcp_adapters.client import MultiServerMCPClient

os.environ["SSL_CERT_FILE"] = certifi.where()
os.environ["REQUESTS_CA_BUNDLE"] = certifi.where()

load_dotenv()

# create the client and connect to the MCP servers
MCP_client = MultiServerMCPClient(
    {
        # DuckDuckGo MCP server
        "ddg-search": {
            "command": "uvx",
            "args": ["duckduckgo-mcp-server"],
            "transport": "stdio", # stdio, sse, websocket, http
            # "url": "https://html.duckduckgo.com/html"
        },
        # AviationStack MCP server
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
        }

    }
)

# get all tools in the MCP client
async def get_all_mcp_tools():
    """
    Load each MCP server and print the tools available in each server.
    If there is broken server, it will print the error message and continue to the next server.
    """
    all_tools = []
    for server_name in ("ddg-search", "Aviationstack MCP", "weather-mcp"):
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

# ============================================
# 3. Weather MCP tool
# ============================================