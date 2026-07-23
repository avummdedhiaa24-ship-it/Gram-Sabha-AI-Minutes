import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import sys
import os

# Append project path to sys.path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.database import Base, get_db
from app.main import app

# Setup in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test_temp.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create tables in test DB
Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)

@pytest.fixture(autouse=True)
def run_around_tests():
    # Setup: create clean tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    yield
    # Teardown: clear tables
    Base.metadata.drop_all(bind=engine)

def test_health_check():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_signup_and_login():
    # 1. Register User
    signup_data = {
        "username": "testsecretary",
        "email": "secretary@gov.in",
        "role": "Secretary",
        "password": "securepassword123",
        "full_name": "Ramesh Patel",
        "age": 35,
        "gender": "Male",
        "social_category": "General",
        "village": "Rampur East",
        "block": "Kalyan",
        "district": "Thane",
        "state": "Maharashtra"
    }
    response = client.post("/api/v1/auth/signup", json=signup_data)
    assert response.status_code == 201
    assert response.json()["username"] == "testsecretary"

    # 2. Login
    login_data = {
        "username": "testsecretary",
        "password": "securepassword123"
    }
    response = client.post("/api/v1/auth/login", data=login_data)
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_create_meeting():
    # Create Secretary User
    signup_data = {
        "username": "sec1",
        "email": "sec1@gov.in",
        "role": "Secretary",
        "password": "password",
        "full_name": "S. Patil"
    }
    client.post("/api/v1/auth/signup", json=signup_data)
    login_res = client.post("/api/v1/auth/login", data={"username": "sec1", "password": "password"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create Meeting
    meet_data = {
        "title": "Ward 3 Water Pipeline Repair",
        "description": "Allocating funds for pipeline leaks fixing",
        "date": "2026-08-01T10:00:00",
        "location": "Panchayat Hall",
        "agenda": "Inspect leak spots, approve local estimates."
    }
    response = client.post("/api/v1/auth/signup", json=signup_data) # Registering again is fine, but it already exists. Let's make sure it handles it or we bypass it.
    
    # Scheduling Meeting
    response = client.post("/api/v1/meetings", json=meet_data, headers=headers)
    assert response.status_code == 201
    assert response.json()["title"] == "Ward 3 Water Pipeline Repair"
    assert response.json()["status"] == "scheduled"
    assert "gram_sabha_attendance" in response.json()["qr_code_data"]

def test_attendance_and_demographics():
    # 1. Setup meeting and citizen
    client.post("/api/v1/auth/signup", json={"username": "sec2", "email": "sec2@gov.in", "role": "Secretary", "password": "pass", "full_name": "Patil"})
    login_res = client.post("/api/v1/auth/login", data={"username": "sec2", "password": "pass"})
    token = login_res.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    
    meet_res = client.post("/api/v1/meetings", json={"title": "M1", "date": "2026-08-01T10:00:00"}, headers=headers)
    meet_id = meet_res.json()["id"]

    citizen_res = client.post("/api/v1/auth/signup", json={
        "username": "citizen_test",
        "email": "c@test.com",
        "role": "Citizen",
        "password": "pass",
        "full_name": "Ram Singh",
        "gender": "Male",
        "social_category": "SC",
        "age": 30
    })
    citizen_id = citizen_res.json()["id"]

    # 2. Register Check-in
    checkin_data = {
        "user_id": citizen_id,
        "method": "qr",
        "gps_lat": 19.0761,
        "gps_lng": 72.8778
    }
    response = client.post(f"/api/v1/attendance/{meet_id}", json=checkin_data)
    assert response.status_code == 200
    assert response.json()["verified"] is True

    # 3. Query stats
    stats_res = client.get(f"/api/v1/attendance/{meet_id}/stats")
    assert stats_res.status_code == 200
    assert stats_res.json()["total_attendance"] == 1
    assert stats_res.json()["gender"]["Male"] == 1
    assert stats_res.json()["social_category"]["SC"] == 1

def test_chat_rag_endpoints():
    chat_req = {
        "messages": [
            {"role": "user", "content": "How much budget was allocated to school repair?"}
        ]
    }
    response = client.post("/api/v1/chat", json=chat_req)
    assert response.status_code == 200
    assert "citations" in response.json()
