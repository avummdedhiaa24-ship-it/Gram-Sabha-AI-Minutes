from sqlalchemy import Column, Integer, String, Text, DateTime, Float, ForeignKey, Boolean, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(String, default="Citizen")  # Citizen, Secretary, Moderator, DistrictOfficer, StateOfficer, Admin
    full_name = Column(String)
    age = Column(Integer)
    gender = Column(String)  # Male, Female, Other
    social_category = Column(String)  # General, OBC, SC, ST
    village = Column(String)
    block = Column(String)
    district = Column(String)
    state = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meetings = relationship("Meeting", back_populates="secretary")
    attendance = relationship("Attendance", back_populates="user")
    audit_logs = relationship("AuditLog", back_populates="user")

class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True, nullable=False)
    description = Column(Text)
    date = Column(DateTime, nullable=False)
    location = Column(String)
    scheduled_start = Column(DateTime)
    actual_start = Column(DateTime)
    actual_end = Column(DateTime)
    status = Column(String, default="scheduled")  # scheduled, ongoing, processing, draft, approved
    agenda = Column(Text)
    agenda_pdf_url = Column(String)
    qr_code_data = Column(String)
    secretary_id = Column(Integer, ForeignKey("users.id"))
    audio_url = Column(String)
    video_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    secretary = relationship("User", back_populates="meetings")
    attendance = relationship("Attendance", back_populates="meeting")
    transcripts = relationship("Transcript", back_populates="meeting", uselist=False)
    minutes = relationship("Minutes", back_populates="meeting", uselist=False)
    action_items = relationship("ActionItem", back_populates="meeting")
    votes = relationship("Vote", back_populates="meeting")
    audit_logs = relationship("AuditLog", back_populates="meeting")
    translations = relationship("Translation", back_populates="meeting")

class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    checkin_time = Column(DateTime(timezone=True), server_default=func.now())
    method = Column(String, default="manual")  # qr, manual, biometric, gps
    gps_lat = Column(Float)
    gps_lng = Column(Float)
    verified = Column(Boolean, default=True)

    meeting = relationship("Meeting", back_populates="attendance")
    user = relationship("User", back_populates="attendance")

class Transcript(Base):
    __tablename__ = "transcripts"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    raw_text = Column(Text)
    diarized_json = Column(JSON)  # [{speaker: string, start: float, end: float, text: string}]
    language = Column(String)
    confidence = Column(Float)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting = relationship("Meeting", back_populates="transcripts")

class Minutes(Base):
    __tablename__ = "minutes"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    summary = Column(Text)
    topics = Column(JSON)  # List of main topic strings
    schemes = Column(JSON)  # List of Government schemes discussed
    budget_summary = Column(JSON)  # Dict of allocations
    digital_hash = Column(String)
    approved_by_id = Column(Integer, ForeignKey("users.id"))
    approved_at = Column(DateTime)
    doc_url = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    meeting = relationship("Meeting", back_populates="minutes")

class ActionItem(Base):
    __tablename__ = "action_items"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    title = Column(String, nullable=False)
    description = Column(Text)
    responsible_person = Column(String)
    department = Column(String)
    deadline = Column(DateTime)
    status = Column(String, default="pending")  # pending, completed

    meeting = relationship("Meeting", back_populates="action_items")

class Vote(Base):
    __tablename__ = "votes"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    proposal_title = Column(String, nullable=False)
    votes_for = Column(Integer, default=0)
    votes_against = Column(Integer, default=0)
    votes_abstain = Column(Integer, default=0)
    objections_summary = Column(Text)

    meeting = relationship("Meeting", back_populates="votes")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    action = Column(String, nullable=False)  # edit_transcript, edit_minutes, finalize_minutes
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    modified_by_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    previous_state = Column(JSON)
    current_state = Column(JSON)
    state_hash = Column(String)

    meeting = relationship("Meeting", back_populates="audit_logs")
    user = relationship("User", back_populates="audit_logs")

class Translation(Base):
    __tablename__ = "translations"

    id = Column(Integer, primary_key=True, index=True)
    meeting_id = Column(Integer, ForeignKey("meetings.id"), nullable=False)
    language = Column(String, nullable=False)  # hi, mr, gu, ta, te, kn, ml, pa, bn
    minutes_summary = Column(Text)
    agenda = Column(Text)
    transcript_translated_json = Column(JSON)

    meeting = relationship("Meeting", back_populates="translations")
