from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app import models, schemas
from app.routers.auth import get_current_user, RoleChecker
from app.services.ai_pipeline import ai_pipeline

router = APIRouter(prefix="/translation", tags=["Translation"])

officer_roles = ["Secretary", "Gram Sabha Moderator", "District Officer", "State Officer", "Admin"]
is_officer = RoleChecker(officer_roles)

@router.post("/{meeting_id}/{lang_code}", response_model=schemas.TranslationResponse)
def trigger_translation(
    meeting_id: int,
    lang_code: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(is_officer)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting or not meeting.minutes:
        raise HTTPException(status_code=404, detail="Meeting or finalized minutes not found")

    # Check if translation already exists
    existing = db.query(models.Translation).filter(
        models.Translation.meeting_id == meeting_id,
        models.Translation.language == lang_code
    ).first()
    
    if existing:
        return existing

    # Generate translations using AI pipeline
    translated_summary = ai_pipeline.translate_text(meeting.minutes.summary, lang_code)
    translated_agenda = ai_pipeline.translate_text(meeting.agenda or "", lang_code)
    
    # Translate transcript segments if transcript exists
    translated_segments = []
    if meeting.transcripts and meeting.transcripts.diarized_json:
        for seg in meeting.transcripts.diarized_json:
            translated_segments.append({
                "speaker": seg.get("speaker"),
                "start": seg.get("start"),
                "end": seg.get("end"),
                "text": ai_pipeline.translate_text(seg.get("text", ""), lang_code)
            })

    trans_rec = models.Translation(
        meeting_id=meeting_id,
        language=lang_code,
        minutes_summary=translated_summary,
        agenda=translated_agenda,
        transcript_translated_json=translated_segments
    )
    db.add(trans_rec)
    db.commit()
    db.refresh(trans_rec)
    return trans_rec

@router.get("/{meeting_id}/{lang_code}", response_model=schemas.TranslationResponse)
def get_translation(
    meeting_id: int,
    lang_code: str,
    db: Session = Depends(get_db)
):
    trans = db.query(models.Translation).filter(
        models.Translation.meeting_id == meeting_id,
        models.Translation.language == lang_code
    ).first()
    if not trans:
        raise HTTPException(status_code=404, detail=f"Translation for language '{lang_code}' not found.")
    return trans
