import os
import uuid
import shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from app.core.config import settings
from app.core.database import get_db
from app import models, schemas
from app.services.ai_pipeline import ai_pipeline
from app.services.rag import rag_service

router = APIRouter(prefix="/audio", tags=["Audio & Transcript Pipeline"])

def run_processing_pipeline(meeting_id: int, file_path: str, db: Session):
    try:
        # 1. Update status to processing
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if not meeting:
            return
        meeting.status = "processing"
        
        # Clear any stale transcripts, minutes, actions, votes, or translations
        db.query(models.Transcript).filter(models.Transcript.meeting_id == meeting_id).delete()
        db.query(models.Minutes).filter(models.Minutes.meeting_id == meeting_id).delete()
        db.query(models.ActionItem).filter(models.ActionItem.meeting_id == meeting_id).delete()
        db.query(models.Vote).filter(models.Vote.meeting_id == meeting_id).delete()
        db.query(models.Translation).filter(models.Translation.meeting_id == meeting_id).delete()
        
        db.commit()

        # 2. Noise reduction filter simulation
        clean_audio_path = ai_pipeline.reduce_noise(file_path)

        # 3. Language and dialect detection
        lang, confidence = ai_pipeline.detect_language_and_dialect(clean_audio_path)

        # 4. Speech Diarization & Whisper Transcription
        raw_text, diarized_segments = ai_pipeline.diarize_and_transcribe(clean_audio_path, lang)

        # 5. Store transcript in database
        transcript = models.Transcript(
            meeting_id=meeting_id,
            raw_text=raw_text,
            diarized_json=diarized_segments,
            language=lang,
            confidence=confidence
        )
        db.add(transcript)
        db.commit()

        # 6. Extract NLP structural units (topics, schemes, budget, action items, votes)
        nlp_data = ai_pipeline.extract_structured_minutes(raw_text, lang)

        # 7. Create preliminary Minutes, ActionItems, and Votes
        minutes = models.Minutes(
            meeting_id=meeting_id,
            summary=nlp_data.get("summary", ""),
            topics=nlp_data.get("topics", []),
            schemes=nlp_data.get("schemes", []),
            budget_summary=nlp_data.get("budget_summary", {})
        )
        db.add(minutes)

        for act in nlp_data.get("action_items", []):
            action_item = models.ActionItem(
                meeting_id=meeting_id,
                title=act.get("title", ""),
                description=act.get("description", ""),
                responsible_person=act.get("responsible_person", ""),
                department=act.get("department", ""),
                status="pending"
            )
            db.add(action_item)

        for vt in nlp_data.get("votes", []):
            vote_rec = models.Vote(
                meeting_id=meeting_id,
                proposal_title=vt.get("proposal_title", ""),
                votes_for=vt.get("votes_for", 0),
                votes_against=vt.get("votes_against", 0),
                votes_abstain=vt.get("votes_abstain", 0),
                objections_summary=vt.get("objections_summary", "")
            )
            db.add(vote_rec)

        # 8. Index the transcript chunk segments inside RAG chatbot search
        rag_service.add_document(meeting_id, meeting.title, raw_text)

        # 9. Mark meeting as draft (ready for human verification)
        meeting.status = "draft"
        db.commit()

    except Exception as e:
        db.rollback()
        # Mark as failed status if crashed
        meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
        if meeting:
            meeting.status = "failed"
            db.commit()
        raise e

@router.post("/upload/{meeting_id}", response_model=schemas.MeetingResponse)
async def upload_audio(
    meeting_id: int,
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    meeting = db.query(models.Meeting).filter(models.Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")

    # Generate path
    file_ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{file_ext}"
    dest_path = os.path.join(settings.UPLOAD_DIR, unique_filename)

    # Save file
    with open(dest_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    meeting.audio_url = f"/uploads/{unique_filename}"
    db.commit()

    # Trigger async processing background tasks
    background_tasks.add_task(run_processing_pipeline, meeting_id, dest_path, db)

    return meeting
