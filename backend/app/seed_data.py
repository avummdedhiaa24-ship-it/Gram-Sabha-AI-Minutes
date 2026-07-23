from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from app.core.database import SessionLocal, engine, Base
from app import models
from app.routers.auth import get_password_hash
from app.services.rag import rag_service

def seed_db():
    print("Starting database seeding...")
    db = SessionLocal()
    try:
        # Create tables
        Base.metadata.create_all(bind=engine)

        # 1. Seed Users
        users_to_add = [
            {
                "username": "admin",
                "email": "admin@panchayat.gov.in",
                "role": "Admin",
                "full_name": "Rajendra Prasad",
                "age": 45,
                "gender": "Male",
                "social_category": "General",
                "village": "Rampur",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            },
            {
                "username": "secretary",
                "email": "secretary@panchayat.gov.in",
                "role": "Secretary",
                "full_name": "Rajesh Kumar",
                "age": 38,
                "gender": "Male",
                "social_category": "OBC",
                "village": "Rampur",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            },
            {
                "username": "moderator",
                "email": "sarpanch@panchayat.gov.in",
                "role": "Gram Sabha Moderator",
                "full_name": "Sarita Patil",
                "age": 42,
                "gender": "Female",
                "social_category": "General",
                "village": "Rampur",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            },
            {
                "username": "citizen1",
                "email": "ram.singh@gmail.com",
                "role": "Citizen",
                "full_name": "Ram Singh",
                "age": 29,
                "gender": "Male",
                "social_category": "SC",
                "village": "Rampur East",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            },
            {
                "username": "citizen2",
                "email": "sunita.kadam@gmail.com",
                "role": "Citizen",
                "full_name": "Sunita Kadam",
                "age": 31,
                "gender": "Female",
                "social_category": "ST",
                "village": "Rampur West",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            },
            {
                "username": "citizen3",
                "email": "amit.patel@gmail.com",
                "role": "Citizen",
                "full_name": "Amit Patel",
                "age": 62,
                "gender": "Male",
                "social_category": "General",
                "village": "Rampur Center",
                "block": "Kalyan",
                "district": "Thane",
                "state": "Maharashtra"
            }
        ]

        seeded_users = {}
        for u_data in users_to_add:
            existing = db.query(models.User).filter(models.User.username == u_data["username"]).first()
            if not existing:
                pwd_hash = get_password_hash("password123")
                user = models.User(
                    username=u_data["username"],
                    email=u_data["email"],
                    hashed_password=pwd_hash,
                    role=u_data["role"],
                    full_name=u_data["full_name"],
                    age=u_data["age"],
                    gender=u_data["gender"],
                    social_category=u_data["social_category"],
                    village=u_data["village"],
                    block=u_data["block"],
                    district=u_data["district"],
                    state=u_data["state"]
                )
                db.add(user)
                db.commit()
                db.refresh(user)
                seeded_users[u_data["username"]] = user
                print(f"Seeded user: {u_data['username']}")
            else:
                seeded_users[u_data["username"]] = existing

        # 2. Seed Meetings
        sec_id = seeded_users["secretary"].id
        mod_id = seeded_users["moderator"].id

        # Meeting 1: Water Supply and Sanitation (Approved)
        m1 = db.query(models.Meeting).filter(models.Meeting.title == "Water Supply and Sanitation Review").first()
        if not m1:
            m1 = models.Meeting(
                title="Water Supply and Sanitation Review",
                description="Special meeting to review Jal Jeevan Mission progress and sanitation drives.",
                date=datetime.now() - timedelta(days=10),
                location="Panchayat Hall Rampur",
                scheduled_start=datetime.now() - timedelta(days=10, hours=1),
                actual_start=datetime.now() - timedelta(days=10, hours=1),
                actual_end=datetime.now() - timedelta(days=10),
                status="approved",
                agenda="1. Clean drinking water supply pipelines.\n2. Sanitation under Swachh Bharat Abhiyan.\n3. Open discussions.",
                qr_code_data="gram_sabha_attendance:meeting_id=1",
                secretary_id=sec_id
            )
            db.add(m1)
            db.commit()
            db.refresh(m1)
            print("Seeded meeting: Water Supply and Sanitation Review")

            # Attendance for Meeting 1
            att1 = models.Attendance(meeting_id=m1.id, user_id=seeded_users["citizen1"].id, method="qr", gps_lat=19.0762, gps_lng=72.8778, verified=True)
            att2 = models.Attendance(meeting_id=m1.id, user_id=seeded_users["citizen2"].id, method="qr", gps_lat=19.0759, gps_lng=72.8775, verified=True)
            att3 = models.Attendance(meeting_id=m1.id, user_id=seeded_users["citizen3"].id, method="manual", verified=True)
            db.add_all([att1, att2, att3])

            # Transcript for Meeting 1
            t1 = models.Transcript(
                meeting_id=m1.id,
                raw_text="The meeting discussed fixing the drinking water well in Rampur East and laying pipes under the Jal Jeevan Mission. We allocated three lakh rupees.",
                diarized_json=[
                    {"speaker": "Secretary", "start": 0.0, "end": 8.0, "text": "Let us discuss the first agenda point regarding clean drinking water pipeline extensions."},
                    {"speaker": "Ram Singh", "start": 8.5, "end": 15.0, "text": "Our side of the village is not getting adequate water. We need a direct tube well connection."},
                    {"speaker": "Sarpanch", "start": 15.5, "end": 25.0, "text": "We approve three lakh rupees for this pipe extension from the Gram Panchayat development fund."}
                ],
                language="en",
                confidence=0.97
            )
            db.add(t1)

            # Minutes for Meeting 1
            min1 = models.Minutes(
                meeting_id=m1.id,
                summary="The Gram Sabha approved an allocation of INR 3,00,000 for laying clean drinking water pipes under the Jal Jeevan Mission in Rampur East. Standard sanitation inspections were ordered.",
                topics=["Water Supply", "Sanitation", "Jal Jeevan Mission"],
                schemes=["Jal Jeevan Mission (JJM)", "Gram Panchayat Development Plan (GPDP)"],
                budget_summary={"Water Pipeline Extension": 300000.0},
                digital_hash="da56bc7812ea0f4b986e11122aefc8821948b8cc7e08bbcfdaeeef01bc89a622",
                approved_by_id=mod_id,
                approved_at=datetime.utcnow() - timedelta(days=10)
            )
            db.add(min1)

            # Action Items for Meeting 1
            act1 = models.ActionItem(
                meeting_id=m1.id,
                title="Laying water pipelines in Rampur East",
                description="Technical estimate preparation and worker assignment for water lines.",
                responsible_person="Rajesh Kumar (Secretary)",
                department="Public Works Department",
                deadline=datetime.now() + timedelta(days=30),
                status="pending"
            )
            db.add(act1)

            # Votes for Meeting 1
            v1 = models.Vote(
                meeting_id=m1.id,
                proposal_title="Sanction INR 3,00,000 for pipeline construction",
                votes_for=22,
                votes_against=0,
                votes_abstain=1,
                objections_summary="None"
            )
            db.add(v1)
            db.commit()

            # Index inside RAG vector search
            rag_service.add_document(
                meeting_id=m1.id,
                title=m1.title,
                text="The Gram Sabha approved an allocation of INR 3,00,000 for laying clean drinking water pipes under the Jal Jeevan Mission in Rampur East. Standard sanitation inspections were ordered."
            )

        # Meeting 2: Primary School Repair (Scheduled)
        m2 = db.query(models.Meeting).filter(models.Meeting.title == "Primary School Infrastructure").first()
        if not m2:
            m2 = models.Meeting(
                title="Primary School Infrastructure",
                description="Discussion on funding allocations for repairing the roof of the Rampur Primary School.",
                date=datetime.now() + timedelta(days=3),
                location="Primary School compound",
                status="scheduled",
                agenda="1. Roof leakage inspection.\n2. Allocation of funds under Samagra Shiksha.\n3. Appointment of contractor.",
                qr_code_data="gram_sabha_attendance:meeting_id=2",
                secretary_id=sec_id
            )
            db.add(m2)
            db.commit()
            print("Seeded meeting: Primary School Infrastructure")

    except Exception as e:
        db.rollback()
        print(f"Error during seeding: {str(e)}")
        raise e
    finally:
        db.close()
    print("Database seeding completed successfully.")

if __name__ == "__main__":
    seed_db()
