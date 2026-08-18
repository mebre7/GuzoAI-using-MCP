# tools folder removed
# from tools.search_tool import duckduckgo_search
# from tools.flight_tool import search_flights
# from mcp_client_test import get_all_mcp_tools, get_ddg_search_tool, search_with_ddg
from mcp_client import get_all_mcp_tools, get_search_tools, get_aviation_tools, search_flight_info_with_mcp, search_hotels_info_with_mcp
import asyncio

# test the duckduckgo_search function
"""
results = duckduckgo_search("What are best hotels in Addis Ababa?")
for result in results:
    print(result)
"Plan a 7 days Japan trip from Ethiopia"
result = search_flights("Plan a 7 days Japan trip from Ethiopia")
print(result)
"""


# test the search_flights function
"""
from backend import run_travel_planner

res = run_travel_planner("Plan a 7 days Japan trip from Ethiopia", "")
print(res)
"""

# what is default place if no place is given in the query for origin

# test the MCP client by running the get_all_mcp_tools function

if __name__ == "__main__":
    asyncio.run(get_all_mcp_tools())
    # asyncio.run(get_search_tools())
    # asyncio.run(get_aviation_tools())
    # result = asyncio.run(search_hotels_info_with_mcp("What are best hotels in Addis Ababa?"))
    # print(result)
    """
    tool_args1 = {
        "query": "Best airlines from Addis Ababa to Dubai"
    }
    tool_args2 = {
        "query": "Best airporst in Dubai"
    }
    airlines = asyncio.run(search_flight_info_with_mcp("list_airlines", tool_args1))
    airports = asyncio.run(search_flight_info_with_mcp("list_airports", tool_args2))
    print("AIRPORTS:\n", airports)
    print("\n\nAIRLINES:\n", airlines)
    """