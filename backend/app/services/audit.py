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
    def export_to_text_report(meeting_title: str, minutes_data: Dict[str, Any], lang: str = "en") -> str:
        """
        Export meeting minutes into a highly structured Government report format.
        """
        # Supported languages mapping (fallback to en if not matching)
        lang_key = lang if lang in ["en", "hi", "mr", "te"] else "en"

        headers_catalog = {
            "en": {
                "gov": "GOVERNMENT OF INDIA",
                "min": "MINISTRY OF PANCHAYATI RAJ",
                "title": "GRAM SABHA MINUTES OF MEETING",
                "exported": "Exported On",
                "hash": "Digital Audit Hash",
                "summary": "MEETING SUMMARY",
                "topics": "AGENDA TOPICS DISCUSSED",
                "schemes": "GOVERNMENT SCHEMES REVIEWED",
                "budget": "BUDGETARY ALLOCATIONS APPROVED",
                "actions": "ACTION ITEMS AND RESPONSIBILITIES",
                "task": "Task",
                "dept": "Department",
                "officer": "Officer",
                "deadline": "Target Deadline",
                "no_budget": "No budget allocations approved in this session.",
                "no_actions": "No action items assigned.",
                "signed": "[DIGITALLY SIGNED VIA GRAM PANCHAYAT SECURE e-SIGN PORTAL]"
            },
            "hi": {
                "gov": "भारत सरकार",
                "min": "पंचायती राज मंत्रालय",
                "title": "ग्राम सभा बैठक की कार्यवाही",
                "exported": "निर्यात की तिथि",
                "hash": "डिजिटल ऑडिट हैश",
                "summary": "बैठक का सारांश",
                "topics": "चर्चा के मुख्य मुद्दे",
                "schemes": "समीक्षा की गई सरकारी योजनाएं",
                "budget": "स्वीकृत बजटीय आवंटन",
                "actions": "कार्यवाही के बिंदु और जिम्मेदारियां",
                "task": "कार्य",
                "dept": "विभाग",
                "officer": "अधिकारी",
                "deadline": "अंतिम तिथि",
                "no_budget": "इस सत्र में कोई बजटीय आवंटन स्वीकृत नहीं किया गया।",
                "no_actions": "कोई कार्यवाही बिंदु आवंटित नहीं किया गया।",
                "signed": "[ग्राम पंचायत सुरक्षित ई-हस्ताक्षर पोर्टल द्वारा डिजिटल रूप से हस्ताक्षरित]"
            },
            "mr": {
                "gov": "भारत सरकार",
                "min": "पंचायती राज मंत्रालय",
                "title": "ग्रामसभा बैठकीचे इतिवृत्त",
                "exported": "निर्यात तारीख",
                "hash": "डिजिटल ऑडिट हॅश",
                "summary": "बैठकीचा सारांश",
                "topics": "चर्चा केलेले मुख्य विषय",
                "schemes": "आढावा घेतलेल्या सरकारी योजना",
                "budget": "मंजूर अर्थसंकल्पीय वाटप",
                "actions": "कृती आराखडा आणि जबाबदाऱ्या",
                "task": "काम",
                "dept": "विभाग",
                "officer": "अधिकारी",
                "deadline": "अंतिम मुदत",
                "no_budget": "या सत्रात कोणतेही बजेट वाटप मंजूर केले गेले नाही.",
                "no_actions": "कोणत्याही कृती बाबी नियुक्त केलेल्या नाहीत.",
                "signed": "[ग्रामपंचायत सुरक्षित ई-स्वाक्षरी पोर्टलद्वारे डिजिटल स्वाक्षरीकृत]"
            },
            "te": {
                "gov": "భారత ప్రభుత్వం",
                "min": "పంచాయతీ రాజ్ మంత్రిత్వ శాఖ",
                "title": "గ్రామ సభ సమావేశ నిమిషాలు",
                "exported": "ఎగుమతి చేసిన తేదీ",
                "hash": "డిజిటల్ ఆడిట్ హాష్",
                "summary": "సమావేశ సారాంశం",
                "topics": "చర్చించిన ఎజెండా అంశాలు",
                "schemes": "సమీక్షించిన ప్రభుత్వ పథకాలు",
                "budget": "ఆమోదించబడిన బడ్జెట్ కేటాయింపులు",
                "actions": "చర్యలు మరియు బాధ్యతలు",
                "task": "పని",
                "dept": "శాఖ",
                "officer": "అధికారి",
                "deadline": "గడువు తేదీ",
                "no_budget": "ఈ సమావేశంలో ఎటువంటి బడ్జెట్ కేటాయింపులు ఆమోదించబడలేదు.",
                "no_actions": "ఎటువంటి చర్యలు కేటాయించబడలేదు.",
                "signed": "[గ్రామ పంచాయతీ సురక్షిత ఈ-సంతకం పోర్టల్ ద్వారా డిజిటల్ సంతకం చేయబడింది]"
            }
        }

        h = headers_catalog[lang_key]
        report = []
        report.append("=================================================================")
        report.append(f"                    {h['gov']}")
        report.append(f"               {h['min']}")
        report.append(f"          {h['title']}: {meeting_title.upper()}")
        report.append("=================================================================")
        report.append(f"{h['exported']}: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        report.append(f"{h['hash']}: {minutes_data.get('digital_hash', 'N/A')}")
        
        report.append(f"\n--- {h['summary']} ---")
        report.append(minutes_data.get("summary", "No summary available."))
        
        report.append(f"\n--- {h['topics']} ---")
        topics = minutes_data.get("topics", [])
        if topics:
            for idx, topic in enumerate(topics, 1):
                report.append(f"{idx}. {topic}")
        else:
            report.append(" N/A")
            
        report.append(f"\n--- {h['schemes']} ---")
        schemes = minutes_data.get("schemes", [])
        if schemes:
            for idx, scheme in enumerate(schemes, 1):
                report.append(f"{idx}. {scheme}")
        else:
            report.append(" N/A")
            
        report.append(f"\n--- {h['budget']} ---")
        budget = minutes_data.get("budget_summary", {})
        if budget:
            for item, amount in budget.items():
                report.append(f" - {item}: INR {amount:,.2f}")
        else:
            report.append(f" {h['no_budget']}")
            
        report.append(f"\n--- {h['actions']} ---")
        actions = minutes_data.get("action_items", [])
        if actions:
            for idx, action in enumerate(actions, 1):
                report.append(f"{idx}. {h['task']}: {action.get('title')}")
                report.append(f"   {h['dept']}: {action.get('department')} | {h['officer']}: {action.get('responsible_person')}")
                report.append(f"   {h['deadline']}: {action.get('deadline')}")
        else:
            report.append(f" {h['no_actions']}")
            
        report.append("\n=================================================================")
        report.append(f"   {h['signed']}")
        report.append("=================================================================")
        
        return "\n".join(report)

audit_service = AuditService()
