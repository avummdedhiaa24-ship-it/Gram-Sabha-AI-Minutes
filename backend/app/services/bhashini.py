import os
import base64
import logging
import requests
from typing import Dict, Any, Optional
from app.core.config import settings

logger = logging.getLogger(__name__)

class BhashiniService:
    """
    Official Bhashini (National Language Translation Mission - MeitY)
    Integration for Indic ASR Speech-to-Text and NMT Translation.
    """
    DHRUVA_PIPELINE_URL = "https://dhruva-api.bhashini.gov.in/services/inference/pipeline"

    def __init__(self):
        self.user_id = settings.BHASHINI_USER_ID
        self.api_key = settings.BHASHINI_API_KEY
        self.pipeline_id = settings.BHASHINI_PIPELINE_ID

    def is_configured(self) -> bool:
        return bool(self.user_id and self.api_key)

    def transcribe(self, audio_file_path: str, source_lang: str = "hi") -> Optional[str]:
        """
        Sends audio recording to Bhashini Dhruva ASR API.
        Supported Indic source languages: hi, mr, gu, ta, te, kn, ml, pa, bn, or, as.
        """
        if not self.is_configured():
            logger.info("Bhashini API keys not configured. Falling back to local engine.")
            return None

        if not os.path.exists(audio_file_path):
            return None

        try:
            logger.info(f"Submitting audio to Bhashini ASR (lang={source_lang}): {audio_file_path}")
            with open(audio_file_path, "rb") as audio_f:
                encoded_audio = base64.b64encode(audio_f.read()).decode("utf-8")

            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "asr",
                        "config": {
                            "language": {"sourceLanguage": source_lang},
                            "serviceId": f"ai4bharat/whisper-medium-{source_lang}-gpu",
                            "audioFormat": "wav",
                            "samplingRate": 16000
                        }
                    }
                ],
                "inputData": {
                    "audio": [{"audioContent": encoded_audio}]
                }
            }

            headers = {
                "Content-Type": "application/json",
                "userID": self.user_id,
                "ulcaApiKey": self.api_key
            }

            resp = requests.post(self.DHRUVA_PIPELINE_URL, json=payload, headers=headers, timeout=30)
            if resp.status_code == 200:
                res_json = resp.json()
                transcript = res_json["pipelineResponse"][0]["output"][0]["source"]
                logger.info("Bhashini ASR transcription successful.")
                return transcript
            else:
                logger.warning(f"Bhashini ASR API failed ({resp.status_code}): {resp.text}")
                return None
        except Exception as e:
            logger.error(f"Bhashini ASR service error: {e}")
            return None

    def translate(self, text: str, source_lang: str = "en", target_lang: str = "hi") -> Optional[str]:
        """
        Translates text via Bhashini NMT service across Indic scheduled languages.
        """
        if not self.is_configured() or not text.strip():
            return None

        try:
            payload = {
                "pipelineTasks": [
                    {
                        "taskType": "translation",
                        "config": {
                            "language": {
                                "sourceLanguage": source_lang,
                                "targetLanguage": target_lang
                            }
                        }
                    }
                ],
                "inputData": {
                    "input": [{"source": text}]
                }
            }

            headers = {
                "Content-Type": "application/json",
                "userID": self.user_id,
                "ulcaApiKey": self.api_key
            }

            resp = requests.post(self.DHRUVA_PIPELINE_URL, json=payload, headers=headers, timeout=15)
            if resp.status_code == 200:
                res_json = resp.json()
                translated = res_json["pipelineResponse"][0]["output"][0]["target"]
                return translated
        except Exception as e:
            logger.warning(f"Bhashini translation failed: {e}")
        return None

bhashini_service = BhashiniService()
