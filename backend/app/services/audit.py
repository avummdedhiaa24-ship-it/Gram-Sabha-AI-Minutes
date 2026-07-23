import hashlib
import json
from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models import AuditLog, Minutes

class AuditService:
    @staticmethod
    def calculate_minutes_hash(minutes: Dict[str, Any]) -> str:
        """
        Generate a unique SHA256 hash for a minutes dictionary to ensure immutability.
        """
        # Canonicalize JSON by sorting keys to guarantee same hash for identical content
        serialized = json.dumps(minutes, sort_keys=True, default=str)
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    @staticmethod
    def log_change(
        db: Session,
        meeting_id: int,
        modified_by_id: int,
        action: str,
        previous_state: Optional[Dict[str, Any]],
        current_state: Dict[str, Any]
    ) -> AuditLog:
        """
        Create a secure entry in the e-Panchayat AuditLogs table.
        """
        state_hash = AuditService.calculate_minutes_hash(current_state)
        
        audit_entry = AuditLog(
            meeting_id=meeting_id,
            action=action,
            modified_by_id=modified_by_id,
            previous_state=previous_state,
            current_state=current_state,
            state_hash=state_hash
        )
        db.add(audit_entry)
        db.commit()
        db.refresh(audit_entry)
        return audit_entry

    @staticmethod
    def export_to_text_report(meeting_title: str, minutes_data: Dict[str, Any]) -> str:
        """
        Export meeting minutes into a highly structured Government report format.
        """
        report = []
        report.append("=================================================================")
        report.append("                    GOVERNMENT OF INDIA")
        report.append("               MINISTRY OF PANCHAYATI RAJ")
        report.append(f"          GRAM SABHA MINUTES OF MEETING: {meeting_title.upper()}")
        report.append("=================================================================")
        report.append(f"Exported On: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"Digital Audit Hash: {minutes_data.get('digital_hash', 'N/A')}")
        report.append("\n--- MEETING SUMMARY ---")
        report.append(minutes_data.get("summary", "No summary available."))
        
        report.append("\n--- AGENDA TOPICS DISCUSSED ---")
        for idx, topic in enumerate(minutes_data.get("topics", []), 1):
            report.append(f"{idx}. {topic}")
            
        report.append("\n--- GOVERNMENT SCHEMES REVIEWED ---")
        for idx, scheme in enumerate(minutes_data.get("schemes", []), 1):
            report.append(f"{idx}. {scheme}")
            
        report.append("\n--- BUDGETARY ALLOCATIONS APPROVED ---")
        budget = minutes_data.get("budget_summary", {})
        if budget:
            for item, amount in budget.items():
                report.append(f" - {item}: INR {amount:,.2f}")
        else:
            report.append(" No budget allocations approved in this session.")
            
        report.append("\n--- ACTION ITEMS AND RESPONSIBILITIES ---")
        actions = minutes_data.get("action_items", [])
        if actions:
            for idx, action in enumerate(actions, 1):
                report.append(f"{idx}. Task: {action.get('title')}")
                report.append(f"   Department: {action.get('department')} | Officer: {action.get('responsible_person')}")
                report.append(f"   Target Deadline: {action.get('deadline')}")
        else:
            report.append(" No action items assigned.")
            
        report.append("\n=================================================================")
        report.append("   [DIGITALLY SIGNED VIA GRAM PANCHAYAT SECURE e-SIGN PORTAL]")
        report.append("=================================================================")
        
        return "\n".join(report)

audit_service = AuditService()
