from pathlib import Path
import traceback
import uvicorn
from fastapi import FastAPI
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from starlette import status

from backend import run_travel_planner

BASE_DIR = Path(__file__).resolve().parent

# ── [CHANGE 1] Point to vanilla HTML/CSS/JS frontend ────────────────────────
STATIC_DIR    = BASE_DIR / "static"
TEMPLATES_DIR = BASE_DIR / "templates"
TEMPLATES_INDEX = TEMPLATES_DIR / "index.html"

# Legacy React build (kept for reference, no longer served by default)
FRONTEND_DIST  = BASE_DIR / "frontend2" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"
# ─────────────────────────────────────────────────────────────────────────────


app = FastAPI(
    title="GuzoAI: AI Travel Planning System",
    description="LangGraph Multi-Agent Travel Planner with Vanilla HTML/CSS/JS + FastAPI",
    version="3.0.0",
)

# ── [CHANGE 2] Allow both dev origins and same-origin requests ───────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── [CHANGE 3] Mount /static → serves styles.css and script.js ───────────────
app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class TravelRequest(BaseModel):
    message: str
    thread_id: str | None = None


@app.post("/api/travel")
def travel_planner(request_data: TravelRequest):
    try:
        user_message = request_data.message.strip()

        if not user_message:
            return JSONResponse(
                status_code=status.HTTP_400_BAD_REQUEST,
                content={"success": False, "error": "Message can't be empty."},
            )

        result = run_travel_planner(
            user_input=user_message,
            thread_id=request_data.thread_id,
        )

        hotel_results = result.get("hotel_results", "")
        if isinstance(hotel_results, list):
            hotel_results = [
                item if isinstance(item, str) else str(item)
                for item in hotel_results
            ]

        return JSONResponse(
            content={
                "success": True,
                "thread_id": result["thread_id"],
                "answer": result["answer"],
                "flight_results": result.get("flight_results", ""),
                "hotel_results": hotel_results,
                "itinerary": result.get("itinerary", ""),
                "llm_calls": result.get("llm_calls", 0),
            }
        )
    except Exception as e:
        print("ERROR:", e)
        traceback.print_exc()
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"success": False, "error": "We could not generate your plan right now. Please try again."},
        )


@app.get("/health")
async def health():
    return {
        "status": "ok",
        "message": "GuzoAI travel planner API is running",
        "frontend": "vanilla HTML/CSS/JS",
        "template_exists": TEMPLATES_INDEX.is_file(),
    }


@app.get("/favicon.ico")
async def favicon():
    # ── [CHANGE 4] Check templates dir first, fallback to dist ──────────────
    for candidate in [TEMPLATES_DIR / "favicon.ico", FRONTEND_DIST / "favicon.ico"]:
        if candidate.is_file():
            return FileResponse(candidate)
    return JSONResponse(content={})


# ── [CHANGE 5] Root route → serve templates/index.html ───────────────────────
@app.get("/")
async def spa_root():
    return FileResponse(TEMPLATES_INDEX)


# ── [CHANGE 6] Catch-all → always return templates/index.html ────────────────
@app.get("/{full_path:path}")
async def spa_fallback(full_path: str):
    if full_path.startswith("api/"):
        return JSONResponse(status_code=404, content={"detail": "Not Found"})
    # Serve templates/index.html for any unknown path (SPA behavior)
    return FileResponse(TEMPLATES_INDEX)


if __name__ == "__main__":
    uvicorn.run("app:app", host="127.0.0.1", port=8000, reload=True)
