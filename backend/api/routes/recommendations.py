"""Travel recommendation routes."""

import logging
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

logger = logging.getLogger(__name__)

from api.deps import get_optional_user
from database import get_db
from database.models import User
from models import BudgetRange, LocationInfo, StartLocationInfo, TravelPreferenceRequest, TravelRecommendation
from recommendation_engine import RecommendationEngine
from schemas.user import UserPreferenceResponse
from services.user_service import UserService

router = APIRouter(prefix="/api/v1", tags=["Recommendations"])

# Initialize recommendation engine
engine = RecommendationEngine()


@router.post("/recommendations", response_model=dict)
async def get_recommendations(
    data: TravelPreferenceRequest,
    limit: int = 10,
    current_user: Optional[User] = Depends(get_optional_user),
    db: Session = Depends(get_db),
):
    """
    Get travel recommendations based on preferences.

    - **travel_styles**: List of preferred travel styles
    - **days**: Number of travel days (1-14)
    - **start_location**: Starting point
    - **budget**: Maximum budget in LKR
    - **limit**: Maximum number of results (default: 10)

    Authentication is optional. If authenticated, preferences will be saved.
    """
    recommendations = engine.get_recommendations(
        db=db,
        travel_styles=data.travel_styles,
        days=data.days,
        start_location=data.start_location,
        budget=data.budget,
        limit=limit,
    )

    # If user is authenticated, optionally update their preferences
    if current_user:
        try:
            from schemas.user import UserPreferenceUpdate

            preference_data = UserPreferenceUpdate(
                preferred_travel_styles=data.travel_styles,
                preferred_start_location=data.start_location,
                preferred_budget_range=_get_budget_category(data.budget),
            )

            UserService.update_preferences(db, current_user.id, preference_data)
        except Exception as e:
            logger.error(f"Failed to save user preferences: {e}")
            db.rollback()

    return {
        "success": True,
        "total_results": len(recommendations),
        "recommendations": recommendations,
        "filters_applied": {
            "travel_styles": data.travel_styles,
            "days": data.days,
            "start_location": data.start_location,
            "budget": data.budget,
        },
    }


@router.get("/travel-styles", response_model=list[str])
async def get_travel_styles(db: Session = Depends(get_db)):
    """Get all available travel styles."""
    return engine.get_travel_styles(db)


@router.get("/start-locations", response_model=list[StartLocationInfo])
async def get_start_locations(db: Session = Depends(get_db)):
    """Get all available starting locations with coordinates."""
    return engine.get_start_locations(db)


@router.get("/budget-ranges", response_model=dict[str, BudgetRange])
async def get_budget_ranges(db: Session = Depends(get_db)):
    """Get budget range categories with min/max values in LKR."""
    return engine.get_budget_ranges(db)


@router.get("/locations", response_model=list[LocationInfo])
async def get_locations(category: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Get all tourist locations, optionally filtered by category.

    - **category**: Optional filter (cultural, spiritual, adventure, nature_wildlife)
    """
    return engine.get_all_locations(db, category=category)


@router.get("/combinations/{combination_id}", response_model=TravelRecommendation)
async def get_combination_by_id(combination_id: int, db: Session = Depends(get_db)):
    """Get a specific travel combination by its ID."""
    combination = engine.get_combination_by_id(db, combination_id)

    if combination is None:
        raise HTTPException(status_code=404, detail=f"Combination with ID {combination_id} not found")

    return combination


def _get_budget_category(budget: int) -> str:
    """Helper to determine budget category."""
    if budget < 100000:
        return "budget"
    elif budget < 250000:
        return "moderate"
    elif budget < 400000:
        return "luxury"
    else:
        return "premium"
