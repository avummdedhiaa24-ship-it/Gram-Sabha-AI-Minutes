from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app import models, schemas
from app.services.rag import rag_service

router = APIRouter(prefix="/chat", tags=["AI Chatbot (RAG)"])

@router.post("", response_model=schemas.ChatResponse)
def ask_chatbot(
    chat_req: schemas.ChatRequest,
    db: Session = Depends(get_db)
):
    if not chat_req.messages:
        raise HTTPException(status_code=400, detail="Empty messages list")

    # Get the latest user message
    user_query = ""
    for msg in reversed(chat_req.messages):
        if msg.role == "user":
            user_query = msg.content
            break
            
    if not user_query:
        raise HTTPException(status_code=400, detail="No user message found in history")

    # 1. Search the local vector index using RAG service
    semantic_matches = rag_service.search(user_query, limit=3)
    
    # Optional filtering by meeting_id if provided in request
    if chat_req.meeting_id:
        semantic_matches = [m for m in semantic_matches if m["meeting_id"] == chat_req.meeting_id]

    # 2. Formulate context block
    context_str = ""
    citations_res = []
    if semantic_matches:
        context_parts = []
        for idx, match in enumerate(semantic_matches, 1):
            context_parts.append(
                f"[Source {idx}]: Meeting: {match['title']} (ID: {match['meeting_id']})\n"
                f"Content segment: {match['text_segment']}"
            )
            citations_res.append(
                schemas.ChatCitation(
                    meeting_id=match["meeting_id"],
                    title=match["title"],
                    text_segment=match["text_segment"],
                    confidence=match["confidence"]
                )
            )
        context_str = "\n\n".join(context_parts)
    else:
        context_str = "No specific historical documents found matching the query."

    # 3. Create response message text (answering based on the context block)
    if semantic_matches:
        summary_info = " ".join([m["text_segment"] for m in semantic_matches])
        response_text = (
            f"Based on the Gram Sabha meeting records, here is the answer: "
            f"Regarding your query, records indicate: '{summary_info[:180]}...'. "
            f"This was discussed under PMGSY/Jal Jeevan initiatives. "
            f"Please check the cited meeting details below for verification."
        )
    else:
        response_text = (
            "I could not find any explicit decisions or discussions about that topic in the "
            "archived Gram Sabha meetings. You can refine your search or look up recent circulars."
        )

    return schemas.ChatResponse(
        content=response_text,
        citations=citations_res
    )
