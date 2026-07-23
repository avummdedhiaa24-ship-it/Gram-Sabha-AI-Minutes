from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.core.database import get_db
from app import models, schemas
from app.services.rag import rag_service

router = APIRouter(prefix="/search", tags=["Global Search"])

@router.get("", response_model=List[Dict[str, Any]])
def search_meetings(
    query: str,
    db: Session = Depends(get_db)
):
    if not query:
        raise HTTPException(status_code=400, detail="Search query must not be empty.")
    
    # Run vector semantic search
    semantic_matches = rag_service.search(query, limit=5)
    
    # We will attach metadata, like the meeting date and current approval status
    results = []
    for match in semantic_matches:
        meeting = db.query(models.Meeting).filter(models.Meeting.id == match["meeting_id"]).first()
        status_val = meeting.status if meeting else "unknown"
        date_val = meeting.date.strftime("%Y-%m-%d") if meeting else ""
        
        results.append({
            **match,
            "status": status_val,
            "date": date_val
        })
        
    return results
