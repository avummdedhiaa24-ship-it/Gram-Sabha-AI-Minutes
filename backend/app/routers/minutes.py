from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from datetime import datetime
from typing import Dict, Any, List

from app.core.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user, RoleChecker
from app.services.audit import audit_service

router = APIRouter(prefix="/minutes", tags=["Minutes & Human Review"])

officer_roles = ["Secretary", "Gram Sabha Moderator", "District Officer", "State Officer", "Admin"]
is_officer = RoleChecker(officer_roles)

@router.get("/{meeting_id}", response_model=schemas.MinutesResponse)
def get_meeting_minutes(
    meeting_id: int,
    db: Session = Depends(get_db)
):
    minutes = db.query(models.Minutes).filter(models.Minutes.meeting_id == meeting_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found/generated yet.")
    return minutes

@router.put("/{meeting_id}", response_model=schemas.MinutesResponse)
def update_minutes_draft(
    meeting_id: int,
    minutes_in: schemas.MinutesCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(is_officer)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    minutes = db.query(models.Minutes).filter(models.Minutes.meeting_id == meeting_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")

    # Serialize states for audit logging
    prev_state = {
        "summary": minutes.summary,
        "topics": minutes.topics,
        "schemes": minutes.schemes,
        "budget_summary": minutes.budget_summary
    }

    # Update fields
    minutes.summary = minutes_in.summary
    minutes.topics = minutes_in.topics
    minutes.schemes = minutes_in.schemes
    minutes.budget_summary = minutes_in.budget_summary
    
    current_state = {
        "summary": minutes.summary,
        "topics": minutes.topics,
        "schemes": minutes.schemes,
        "budget_summary": minutes.budget_summary
    }

    # Create audit log record
    audit_service.log_change(
        db=db,
        meeting_id=meeting_id,
        modified_by_id=current_user.id,
        action="edit_minutes",
        previous_state=prev_state,
        current_state=current_state
    )

    db.commit()
    db.refresh(minutes)
    return minutes

@router.post("/{meeting_id}/finalize", response_model=schemas.MinutesResponse)
def finalize_minutes(
    meeting_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(is_officer)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    minutes = db.query(models.Minutes).filter(models.Minutes.meeting_id == meeting_id).first()
    if not minutes:
        raise HTTPException(status_code=404, detail="Minutes not found")

    current_state = {
        "summary": minutes.summary,
        "topics": minutes.topics,
        "schemes": minutes.schemes,
        "budget_summary": minutes.budget_summary
    }

    # Compute secure hash
    digital_hash = audit_service.calculate_minutes_hash(current_state)

    minutes.digital_hash = digital_hash
    minutes.approved_by_id = current_user.id
    minutes.approved_at = datetime.utcnow()
    
    meeting.status = "approved"

    # Save final log record
    audit_service.log_change(
        db=db,
        meeting_id=meeting_id,
        modified_by_id=current_user.id,
        action="finalize_minutes",
        previous_state=current_state,
        current_state={**current_state, "digital_hash": digital_hash, "approved_by_id": current_user.id}
    )

    db.commit()
    db.refresh(minutes)
    db.refresh(meeting)
    return minutes

@router.get("/{meeting_id}/export", response_class=Response)
def export_minutes(
    meeting_id: int,
    format: str = "text", # text, json
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting or not meeting.minutes:
        raise HTTPException(status_code=404, detail="Meeting or minutes not found")

    minutes_dict = {
        "summary": meeting.minutes.summary,
        "topics": meeting.minutes.topics,
        "schemes": meeting.minutes.schemes,
        "budget_summary": meeting.minutes.budget_summary,
        "digital_hash": meeting.minutes.digital_hash,
        "action_items": [{"title": a.title, "department": a.department, "responsible_person": a.responsible_person, "deadline": str(a.deadline)} for a in meeting.action_items],
        "votes": [{"proposal_title": v.proposal_title, "votes_for": v.votes_for, "votes_against": v.votes_against, "votes_abstain": v.votes_abstain} for v in meeting.votes]
    }

    if format == "json":
        return Response(
            content=json.dumps(minutes_dict, indent=2),
            media_type="application/json",
            headers={"Content-Disposition": f"attachment; filename=minutes_meeting_{meeting_id}.json"}
        )
    
    # Text Govt layout fallback
    report_text = audit_service.export_to_text_report(meeting.title, minutes_dict)
    return Response(
        content=report_text,
        media_type="text/plain",
        headers={"Content-Disposition": f"attachment; filename=minutes_meeting_{meeting_id}.txt"}
    )
