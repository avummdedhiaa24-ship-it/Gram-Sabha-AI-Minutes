import { useState, useEffect } from "react";

export type LanguageCode = "en" | "hi" | "mr" | "te";

export const UI_TRANSLATIONS: Record<string, Record<LanguageCode, string>> = {
  // Navigation & Header
  "Digital India": { en: "Digital India", hi: "डिजिटल इंडिया", mr: "डिजिटल इंडिया", te: "డిజిటల్ ఇండియా" },
  "e-Panchayat Initiative": { en: "e-Panchayat Initiative", hi: "ई-पंचायत पहल", mr: "ई-पंचायत उपक्रम", te: "ఈ-పంచాయతీ చొరవ" },
  "Gram Sabha AI Minutes": { en: "Gram Sabha AI Minutes", hi: "Gram Sabha AI Minutes", mr: "Gram Sabha AI Minutes", te: "Gram Sabha AI Minutes" },
  "Log Out": { en: "Log Out", hi: "लॉग आउट", mr: "लॉग आउट", te: "లాగ్ అవుట్" },
  "Switch User": { en: "Switch User", hi: "उपयोगकर्ता बदलें", mr: "वापरकर्ता बदला", te: "వినియోగదారుని మార్చండి" },
  "Modules": { en: "Modules", hi: "मॉड्यूल", mr: "मॉड्यूल", te: "మాడ్యూల్స్" },
  "Dashboard": { en: "Dashboard", hi: "डैशबोर्ड", mr: "डॅशबोर्ड", te: "డాష్‌బోర్డ్" },
  "Meetings & Check-in": { en: "Meetings & Check-in", hi: "बैठक और चेक-इन", mr: "बैठकी आणि चेक-इन", te: "సమావేశాలు & చెక్-ఇన్" },
  "Record / ASR Uploader": { en: "Record / ASR Uploader", hi: "रिकॉर्ड / एएसआर अपलोडर", mr: "रेकॉर्ड / एएसआर अपलोडर", te: "రికార్డ్ / ASR అప్‌లోడర్" },
  "Review & Sign": { en: "Review & Sign", hi: "समीक्षा और हस्ताक्षर", mr: "आढावा आणि स्वाक्षरी", te: "సమీక్ష & సంతకం" },
  "RAG Assistant": { en: "RAG Assistant", hi: "आरएजी सहायक", mr: "आरएजी सहाय्यक", te: "RAG సహాయకుడు" },
  "Citizen Portal": { en: "Citizen Portal", hi: "नागरिक पोर्टल", mr: "नागरिक पोर्टल", te: "సిటిజన్ పోర్టల్" },
  "Audit Ledger": { en: "Audit Ledger", hi: "ऑडिट बही", mr: "ऑडिट लेजर", te: "ఆడిట్ రిజిస్టర్" },

  // Dashboard Cards
  "Namaste! Gram Panchayat Digital Dashboard": {
    en: "Namaste! Gram Panchayat Digital Dashboard",
    hi: "नमस्ते! ग्राम पंचायत डिजिटल डैशबोर्ड",
    mr: "नमस्ते! ग्रामपंचायत डिजिटल डॅशबोर्ड",
    te: "నమస్కారం! గ్రామ పంచాయతీ డిజిటల్ డాష్‌బోర్డ్"
  },
  "Real-time indicators, digital meeting ledger tracking, and Indic Whisper translation portal.": {
    en: "Real-time indicators, digital meeting ledger tracking, and Indic Whisper translation portal.",
    hi: "वास्तविक समय के संकेतक, डिजिटल बैठक बही ट्रैकिंग, और भारतीय भाषा व्हिस्पर अनुवाद पोर्टल।",
    mr: "थेट निर्देशक, डिजिटल बैठक नोंदवही ट्रॅकिंग आणि भारतीय भाषा व्हिस्पर भाषांतर पोर्टल.",
    te: "నిజ-సమయ సూచికలు, డిజిటల్ సమావేశ రిజిస్టర్ ట్రాకింగ్ మరియు భారతీయ భాషా విస్పర్ అనువాద పోర్టల్."
  },
  "Record Live Sabha": {
    en: "Record Live Sabha",
    hi: "लाइव सभा रिकॉर्ड करें",
    mr: "थेट सभा रेकॉर्ड करा",
    te: "లైవ్ సభను రికార్డ్ చేయండి"
  },
  "Retrieving official e-Panchayat indicators...": {
    en: "Retrieving official e-Panchayat indicators...",
    hi: "आधिकारिक ई-पंचायत संकेतक प्राप्त किए जा रहे हैं...",
    mr: "अधिकृत ई-पंचायत निर्देशक मिळवत आहे...",
    te: "అధికారిక ఈ-పంచాయతీ సూచికలను పొందుతోంది..."
  },
  "Meetings Conducted": { en: "Meetings Conducted", hi: "आयोजित बैठकें", mr: "आयोजित बैठका", te: "నిర్వहించిన సమావేశాలు" },
  "Women Participation": { en: "Women Participation", hi: "महिला भागीदारी", mr: "महिला सहभाग", te: "మహిళల భాగస్వామ్యం" },
  "Action Items Done": { en: "Action Items Done", hi: "पूर्ण किए गए कार्य", mr: "पूर्ण केलेल्या कृती बाबी", te: "పూర్తయिन చర్యలు" },
  "Funds Sanctioned": { en: "Funds Sanctioned", hi: "स्वीकृत निधि", mr: "मंजूर निधी", te: "మంజూరైన నిధులు" },
  "All scheduled/historic": { en: "All scheduled/historic", hi: "सभी अनुसूचित/ऐतिहासिक", mr: "सर्व नियोजित/ऐतिहासिक", te: "అన్ని షెడ్యూల్డ్/చారిత్రక" },
  "Women empowerment ratio": { en: "Women empowerment ratio", hi: "महिला सशक्तिकरण अनुपात", mr: "महिला सक्षमीकरण प्रमाण", te: "మహిళా సాధికారత నిష్పत्ति" },
  "signed minutes logs": { en: "signed minutes logs", hi: "हस्ताक्षरित बैठक विवरण लॉग", mr: "स्वाक्षरी केलेले इतिवृत्त लॉग", te: "సంతకం చేసిన సమావేశ లాగ్‌లు" },
  "100% auditable via ledger": { en: "100% auditable via ledger", hi: "बही द्वारा शत-प्रतिशत ऑडिट योग्य", mr: "वहीद्वारे १००% तपासणीयोग्य", te: "లెడ్జర్ ద్వారా 100% ఆడిట్ చేయదగినది" },
  "MEETING TITLE": { en: "MEETING TITLE", hi: "बैठक का शीर्षक", mr: "बैठकीचे शीर्षक", te: "సమావేశ శీర్షిక" },
  "CONDUCTED ON": { en: "CONDUCTED ON", hi: "आयोजन की तिथि", mr: "आयोजित तारीख", te: "నిర్వహించిన తేదీ" },
  "STATUS": { en: "STATUS", hi: "स्थिति", mr: "स्थिती", te: "స్థితి" },
  "LOCATION": { en: "LOCATION", hi: "स्थान", mr: "ठिकाण", te: "స్థలం" },
  "MEETINGS CONDUCTED": { en: "MEETINGS CONDUCTED", hi: "आयोजित बैठकें", mr: "आयोजित बैठका", te: "निर्वहించిన సమావేశాలు" },
  "WOMEN PARTICIPATION": { en: "WOMEN PARTICIPATION", hi: "महिला भागीदारी", mr: "महिला सहभाग", te: "మహిళల భాగస్వామ్యం" },
  "ACTION ITEMS DONE": { en: "ACTION ITEMS DONE", hi: "पूर्ण किए गए कार्य", mr: "पूर्ण केलेल्या कृती बाबी", te: "పూర్తయిన చర్యలు" },
  "FUNDS SANCTIONED": { en: "FUNDS SANCTIONED", hi: "स्वीकृत निधि", mr: "मंजूर निधी", te: "మంజూరైన నిధులు" },
  "Budgetary Allocations (INR)": { en: "Budgetary Allocations (INR)", hi: "बजटीय आवंटन (INR)", mr: "अर्थसंकल्पीय वाटप (INR)", te: "బడ్జెట్ కేటాయింపులు (INR)" },
  "Marginalized & Social Category Split": { en: "Marginalized & Social Category Split", hi: "वंचित और सामाजिक श्रेणी विभाजन", mr: "वंचित आणि सामाजिक प्रवर्ग विभाजन", te: "వెనుకబడిన & సామాజिक వర్గాల విభజన" },
  "Speaking Time Distribution": { en: "Speaking Time Distribution", hi: "बोलने के समय का वितरण", mr: "बोलण्याच्या वेळेचे वाटप", te: "మాట్లాడే సమయం పంపిణీ" },
  "Recent Gram Sabha Logs": { en: "Recent Gram Sabha Logs", hi: "हालिया ग्राम सभा लॉग", mr: "अलीकडील ग्रामसभा लॉग", te: "ఇటీवలి గ్రామ సభ లాగ్‌లు" },
  "View All Logs": { en: "View All Logs", hi: "सभी लॉग देखें", mr: "सर्व लॉग पहा", te: "అన్ని లాగ్‌లను వీక్షించండి" },
  "Panchayat Secretary Quick Login": { en: "Panchayat Secretary Quick Login", hi: "पंचायत सचिव त्वरित लॉगिन", mr: "पंचायत सचिव त्वरित लॉगिन", te: "పంచాయతీ కార్యదర్శి త్వరిత లాగిన్" },

  // Meetings page
  "Meetings & Check-in QR Codes": { en: "Meetings & Check-in QR Codes", hi: "बैठक और चेक-इन क्यूआर कोड", mr: "बैठकी आणि चेक-इन क्यूआर कोड", te: "సమావేశాలు & చెక్-ఇన్ QR కోడ్‌లు" },
  "Schedule Sabha assemblies, print Check-in passes, and trace attendance registers.": {
    en: "Schedule Sabha assemblies, print Check-in passes, and trace attendance registers.",
    hi: "सभा बैठकों को शेड्यूल करें, चेक-इन पास प्रिंट करें और उपस्थिति पंजिकाओं को ट्रैक करें।",
    mr: "सभांचे वेळापत्रक तयार करा, चेक-इन पास मुद्रित करा आणि उपस्थिती नोंदणीचा मागोवा घ्या.",
    te: "సభ సమావేశాలను షెడ్యూల్ చేయండి, చెక్-ఇన్ పాస్‌లను ప్రింట్ చేయండి మరియు హాజరు రిజిస్టర్‌లను ట్రాక్ చేయండి."
  },
  "Schedule New Gram Sabha": { en: "Schedule New Gram Sabha", hi: "नई ग्राम सभा शेड्यूल करें", mr: "नवीन ग्रामसभा आयोजित करा", te: "కొత్తグラム సభను షెడ్యూల్ చేయండి" },
  "Sabha Title": { en: "Sabha Title", hi: "सभा का शीर्षक", mr: "सभेचे शीर्षक", te: "సభ శీర్షిక" },
  "Proposed Date & Time": { en: "Proposed Date & Time", hi: "प्रस्तावित तिथि और समय", mr: "प्रस्तावित तारीख आणि वेळ", te: "ప్రతిపాదిత తేదీ & సమయం" },
  "Assembly Location": { en: "Assembly Location", hi: "बैठक का स्थान", mr: "सभेचे ठिकाण", te: "సమావేశ స్థలం" },
  "Detailed Agenda": { en: "Detailed Agenda", hi: "विस्तृत एजेंडा", mr: "सविस्तर अजेंडा", te: "వివరణాत्मक ఎజెండా" },
  "Schedule Gram Sabha": { en: "Schedule Gram Sabha", hi: "ग्राम सभा शेड्यूल करें", mr: "ग्रामसभा आयोजित करा", te: "గ్రామ సభను షెడ్యూల్ చేయండి" },
  "QR Check-in Pass": { en: "QR Check-in Pass", hi: "क्यूआर चेक-इन पास", mr: "क्यूआर चेक-इन पास", te: "QR చెక్-ఇన్ పాస్" },
  "Official Sabha Schedules & Agenda Registry": { en: "Official Sabha Schedules & Agenda Registry", hi: "आधिकारिक सभा अनुसूची और एजेंडा रजिस्ट्री", mr: "अधिकृत सभा वेळापत्रक आणि अजेंडा नोंदणी", te: "అధికారిక సభ షెడ్యూల్‌లు & ఎజెండా రిజిస్టర్" },

  // Record / ASR
  "Indic Speech-to-Text Pipeline (ASR)": { en: "Indic Speech-to-Text Pipeline (ASR)", hi: "भारतीय भाषा भाषण-से-पाठ पाइपलाइन (ASR)", mr: "भारतीय भाषा भाषण-ते-मजकूर पाइपलाइन (ASR)", te: "భారతీయ భాషా స్పీచ్-టు-టెక్స్ట్ పైప్‌లైన్ (ASR)" },
  "Capture live Gram Sabha audio with noise filter buffers, or upload pre-recorded meetings.": {
    en: "Capture live Gram Sabha audio with noise filter buffers, or upload pre-recorded meetings.",
    hi: "शोर फिल्टर बफर के साथ लाइव ग्राम सभा ऑडियो कैप्चर करें, या पूर्व-रिकॉर्ड की गई बैठकें अपलोड करें।",
    mr: "आवाज फिल्टर बफरसह थेट ग्रामसभा ऑडिओ कॅप्चर करा किंवा आधी रेकॉर्ड केलेल्या बैठका अपलोड करा.",
    te: "నాయిస్ ఫిల్టర్ బఫర్‌లతో ప్రత్యక్ష గ్రామ సభ ఆడియోను క్యాప్చర్ చేయండి లేదా ముందే రికార్డ్ చేసిన సమావేశాలను అప్‌లోడ్ చేయండి."
  },
  "Assembly Live Mic Streamer": { en: "Assembly Live Mic Streamer", hi: "सभा लाइव माइक स्ट्रीमर", mr: "थेट माईक प्रवाहक", te: "సభ లైవ్ మైక్ స్ట్రీమర్" },
  "Directly records and streams audio segments to the ASR indic pipeline.": {
    en: "Directly records and streams audio segments to the ASR indic pipeline.",
    hi: "ऑडियो सेगमेंट को सीधे रिकॉर्ड करता है और एएसआर पाइपलाइन में स्ट्रीम करता है।",
    mr: "थेट ऑडिओ रेकॉर्ड करतो आणि एएसआर पाइपलाइनवर प्रवाहित करतो.",
    te: "ఆడియో భాగాలను నేరుగా రికార్డ్ చేస్తుంది మరియు ASR పైప్‌లైన్‌కు ప్రసారం చేస్తుంది."
  },
  "Start Live Recording": { en: "Start Live Recording", hi: "लाइव रिकॉर्डिंग शुरू करें", mr: "लाइव रेकॉर्डिंग सुरू करा", te: "లైవ్ రికార్డింగ్ ప్రారంభించండి" },
  "Stop & Process Audio": { en: "Stop & Process Audio", hi: "ऑडियो रोकें और संसाधित करें", mr: "रेकॉर्डिंग थांबवा आणि ऑडिओ प्रक्रिया करा", te: "ఆపండి & ఆడియోను ప్రాసెస్ చేయండి" },
  "Upload Pre-recorded Audio or Video": { en: "Upload Pre-recorded Audio or Video", hi: "पूर्व-रिकॉर्ड किया गया ऑडियो या वीडियो अपलोड करें", mr: "आधी रेकॉर्ड केलेला ऑडिओ किंवा व्हिडिओ अपलोड करा", te: "ముందే రికార్డ్ చేసిన ఆడియో లేదా వీడియోను అప్‌లోడ్ చేయండి" },
  "Drag and drop file here, or click to browse": { en: "Drag and drop file here, or click to browse", hi: "फ़ाइल को यहाँ खींचें और छोड़ें, या ब्राउज़ करने के लिए क्लिक करें", mr: "येथे फाईल ड्रॅग आणि ड्रॉप करा किंवा ब्राउझ करण्यासाठी क्लिक करा", te: "ఫైల్‌ను ఇక్కడ లాగి వదలండి లేదా బ్రౌజ్ చేయడానికి క్లిక్ చేయండి" },
  "Select Audio File": { en: "Select Audio File", hi: "ऑडियो फ़ाइल चुनें", mr: "ऑडिओ फाईल निवडा", te: "ఆడియో ఫైల్‌ను ఎంచుకోండి" },

  // Review & Sign
  "Review & Sign Resolutions": { en: "Review & Sign Resolutions", hi: "संकल्पों की समीक्षा और हस्ताक्षर", mr: "ठरावांचा आढावा आणि स्वाक्षरी", te: "तीर्మానాల సమీక్ష & సంతకం" },
  "Audit draft resolutions, edit budget items, and seal with SHA256 cryptographic logs.": {
    en: "Audit draft resolutions, edit budget items, and seal with SHA256 cryptographic logs.",
    hi: "मसौदा प्रस्तावों का ऑडिट करें, बजट मदों को संपादित करें, और SHA256 क्रिप्टोग्राफिक लॉग के साथ सील करें।",
    mr: "मसुदा ठरावांचे परीक्षण करा, अर्थसंकल्प सुधारित करा आणि SHA256 क्रिप्टोग्राफिक लॉगने सील करा.",
    te: "డ్రాఫ్ట్ తీర్మానాలను ఆడిట్ చేయండి, బడ్జెట్ అంశాలను సవరించండి మరియు SHA256 క్రిప్టోగ్రాఫిక్ లాగ్‌లతో సీల్ చేయండి."
  },
  "ASR Transcript Logs": { en: "ASR Transcript Logs", hi: "एएसआर प्रतिलेख लॉग", mr: "एएसआर उतारे लॉग", te: "ASR ట్రాన్స్క్రిప్ట్ లాగ్‌లు" },
  "Citizen Attendance": { en: "Citizen Attendance", hi: "नागरिक उपस्थिति", mr: "नागरिक उपस्थिती", te: "సిటిజన్ హాజరు" },
  "Official Resolution Form": { en: "Official Resolution Form", hi: "आधिकारिक संकल्प पत्र", mr: "अधिकृत ठराव फॉर्म", te: "అధికారిక తీర్మాన ఫారమ్" },
  "EXECUTIVE SUMMARY": { en: "EXECUTIVE SUMMARY", hi: "कार्यकारी सारांश", mr: "कार्यकारी सारांश", te: "కార్యనిర్వాహక సారాంశం" },
  "TOPICS DISCUSSED (JSON ARRAY)": { en: "TOPICS DISCUSSED (JSON ARRAY)", hi: "चर्चा किए गए विषय (JSON ARRAY)", mr: "चर्चा केलेले विषय (JSON ARRAY)", te: "చర్చించిన అంశాలు (JSON ARRAY)" },
  "SUPPORTING SCHEMES (JSON ARRAY)": { en: "SUPPORTING SCHEMES (JSON ARRAY)", hi: "सहायक योजनाएं (JSON ARRAY)", mr: "सहाय्यक योजना (JSON ARRAY)", te: "మద్దతు ఇచ్చే పథకాలు (JSON ARRAY)" },
  "BUDGET BREAKDOWN (JSON KEY-VALUE)": { en: "BUDGET BREAKDOWN (JSON KEY-VALUE)", hi: "बजट विवरण (JSON KEY-VALUE)", mr: "अर्थसंकल्पीय तपशील (JSON KEY-VALUE)", te: "బడ్జెట్ విశ్లేషణ (JSON KEY-VALUE)" },
  "Save Draft Changes": { en: "Save Draft Changes", hi: "ड्राफ्ट में बदलाव सहेजें", mr: "मसुदा बदल जतन करा", te: "డ్రాफ्ट మార్పులను సేవ్ చేయండి" },
  "Approve & Sign Ledger": { en: "Approve & Sign Ledger", hi: "लेज़र स्वीकृत और हस्ताक्षरित करें", mr: "लेजर मंजूर आणि स्वाक्षरी करा", te: "రిజిస్టర్‌ను ఆమోదించండి & సంతకం చేయండి" },

  // Chat
  "e-Panchayat RAG assistant": { en: "e-Panchayat RAG assistant", hi: "ई-पंचायत आरएजी सहायक", mr: "ई-पंचायत आरएजी सहाय्यक", te: "ఈ-పంచాయతీ RAG సహాయకుడు" },
  "Greetings! I am the e-Panchayat RAG assistant. Ask me anything about local Gram Sabha resolutions, budgetary allocations, or scheme updates.": {
    en: "Greetings! I am the e-Panchayat RAG assistant. Ask me anything about local Gram Sabha resolutions, budgetary allocations, or scheme updates.",
    hi: "नमस्कार! मैं ई-पंचायत आरएजी सहायक हूं। मुझसे स्थानीय ग्राम सभा प्रस्तावों, बजटीय आवंटन या योजना अपडेट के बारे में कुछ भी पूछें।",
    mr: "नमस्कार! मी ई-पंचायत आरएजी सहाय्यक आहे. मला स्थानिक ग्रामसभा ठराव, अर्थसंकल्पीय वाटप किंवा योजना अद्यतनांबद्दल काहीही विचारा.",
    te: "నమస్కారం! నేను ఈ-పంచాయతీ RAG సహాయకుడిని. స్థానిక గ్రామ సభ తీర్మానాలు, బడ్జెట్ కేటాయింపులు లేదా పథకాల నవీకరణల గురించి నన్ను ఏదైనా అడగండి."
  },
  "Ask the AI Assistant...": { en: "Ask the AI Assistant...", hi: "एआई सहायक से पूछें...", mr: "एआय सहाय्यकाला विचारा...", te: "AI సహాయకుడిని అడగండి..." },

  // Audit
  "Panchayat Cryptographic Ledger Audit": { en: "Panchayat Cryptographic Ledger Audit", hi: "पंचायत क्रिप्टोग्राफिक लेजर ऑडिट", mr: "पंचायत क्रिप्टोग्राफिक लेजर ऑडिट", te: "పంచాయతీ క్రిప్టోగ్రాఫిక్ లెడ్జర్ ఆడిట్" },
  "Verify immutable transactions logs, previous states, and SHA256 digital seals.": {
    en: "Verify immutable transactions logs, previous states, and SHA256 digital seals.",
    hi: "अपरिवर्तनीय लेनदेन लॉग, पिछली स्थिति और SHA256 डिजिटल सील को सत्यापित करें।",
    mr: "अपरिवर्तनीय व्यवहार लॉग, मागील स्थिती आणि SHA256 डिजिटल सील सत्यापित करा.",
    te: "మార్చలేని లావాదేవీల లాగ్‌లు, మునుపటి స్థితులు మరియు SHA256 డిజిటల్ సీల్‌లను ధృవీకరించండి."
  },
  "Audit Trail Activity Log": { en: "Audit Trail Activity Log", hi: "ऑडिट ट्रेल गतिविधि लॉग", mr: "ऑडिट ट्रेल क्रियाकलाप लॉग", te: "ఆడిట్ ట్రైల్ కార్యాచరణ లాగ్" },

  // Statuses
  "approved": { en: "Approved", hi: "स्वीकृत", mr: "मंजूर", te: "ఆమోదించబడింది" },
  "draft": { en: "Draft", hi: "मसौदा", mr: "मसुदा", te: "డ్రాఫ్ట్" },
  "processing": { en: "Processing", hi: "संसाधित हो रहा है", mr: "प्रक्रिया सुरू आहे", te: "ప్రాసెస్ అవుతోంది" },
  "scheduled": { en: "Scheduled", hi: "निर्धारित", mr: "नियोजित", te: "షెడ్యూల్ చేయబడింది" },

  // Chat/RAG additions
  "Consulting vector indexing databases...": {
    en: "Consulting vector indexing databases...",
    hi: "वेक्टर इंडेक्सिंग डेटाबेस से परामर्श किया जा रहा है...",
    mr: "वेक्टर इंडेक्सिंग डेटाबेसचा सल्ला घेत आहे...",
    te: "వెక్టర్ ఇండెక్సింగ్ డేటాబేస్‌లను సంప్రదిస్తోంది..."
  },
  "Ask a question about Rampur budget updates, drinking water projects, or scheduled meetings...": {
    en: "Ask a question about Rampur budget updates, drinking water projects, or scheduled meetings...",
    hi: "रामपुर बजट अपडेट, पेयजल परियोजनाओं, या निर्धारित बैठकों के बारे में एक प्रश्न पूछें...",
    mr: "रामपूर बजेट अद्यतने, पिण्याच्या पाण्याच्या योजना किंवा नियोजित बैठकांबद्दल प्रश्न विचारा...",
    te: "రాంపూర్ బడ్జెట్ అప్‌డేట్‌లు, త్రాగునీటి ప్రాజెక్టులు లేదా షెడ్యూల్ చేసిన సమావేశాల గురించి ఒక ప్రశ్న అడగండి..."
  },
  "Send Query": {
    en: "Send Query",
    hi: "प्रश्न भेजें",
    mr: "प्रश्न पाठवा",
    te: "ప్రశ్న పంపండి"
  },
  "Contextual semantic search over archived Gram Sabha transcripts.": {
    en: "Contextual semantic search over archived Gram Sabha transcripts.",
    hi: "संग्रहीत ग्राम सभा प्रतिलेखों पर प्रासंगिक शब्दार्थ खोज।",
    mr: "संग्रहित ग्रामसभा उतार्‍यांवर संदर्भानुसार अर्थपूर्ण शोध.",
    te: "ఆర్కైవ్ చేసిన గ్రామ సభ ట్రాన్స్క్రిప్ట్‌లపై సందర్భోచిత సెమాంటిక్ శోధన."
  },
  "Official Citations & Sources": {
    en: "Official Citations & Sources",
    hi: "आधिकारिक उद्धरण और स्रोत",
    mr: "अधिकृत संदर्भ आणि स्रोत",
    te: "అధికారిక ఆధారాలు & వనరులు"
  },
  "Filter Meeting:": {
    en: "Filter Meeting:",
    hi: "बैठक फ़िल्टर करें:",
    mr: "बैठक फिल्टर करा:",
    te: "సమావేశాన్ని ఫిల్టర్ చేయండి:"
  },
  "All Sabha Archives": {
    en: "All Sabha Archives",
    hi: "सभी सभा अभिलेखागार",
    mr: "सर्व सभा संग्रहण",
    te: "అన్ని సభ ఆర్కైవ్‌లు"
  },
  "Target Sabha Ledger:": {
    en: "Target Sabha Ledger:",
    hi: "लक्षित सभा बही:",
    mr: "लक्षित सभा नोंदवही:",
    te: "లక్ష్య సభ రిజిస్టర్:"
  },
  "No meetings found": {
    en: "No meetings found",
    hi: "कोई बैठक नहीं मिली",
    mr: "कोणतीही बैठक आढळली नाही",
    te: "సమావేశాలు కనుగొనబడలేదు"
  },
  "Verification Ledger Chronology": {
    en: "Verification Ledger Chronology",
    hi: "सत्यापन बही कालक्रम",
    mr: "पडताळणी नोंदवही कालानुक्रम",
    te: "ధృవీకరణ రిజిస్టర్ క్రమం"
  },
  "Previous state summary": {
    en: "Previous state summary",
    hi: "पिछली स्थिति का सारांश",
    mr: "मागील स्थितीचा सारांश",
    te: "మునుపటి స్థితి సారాంశం"
  },
  "Current state summary": {
    en: "Current state summary",
    hi: "वर्तमान स्थिति का सारांश",
    mr: "सध्याच्या स्थितीचा सारांश",
    te: "ప్రస్తుत స్థితి సారాంశం"
  }
};

export function useTranslation() {
  const [lang, setLangState] = useState<LanguageCode>("en");

  useEffect(() => {
    const saved = localStorage.getItem("ui_lang") as LanguageCode;
    if (saved && ["en", "hi", "mr", "te"].includes(saved)) {
      setLangState(saved);
    }

    const handleStorageChange = () => {
      const current = localStorage.getItem("ui_lang") as LanguageCode;
      if (current && ["en", "hi", "mr", "te"].includes(current)) {
        setLangState(current);
      }
    };

    window.addEventListener("ui_lang_change", handleStorageChange);
    return () => window.removeEventListener("ui_lang_change", handleStorageChange);
  }, []);

  const setLang = (newLang: LanguageCode) => {
    localStorage.setItem("ui_lang", newLang);
    setLangState(newLang);
    window.dispatchEvent(new Event("ui_lang_change"));
  };

  const t = (key: string): string => {
    const cleanKey = key.trim();
    if (UI_TRANSLATIONS[cleanKey]) {
      return UI_TRANSLATIONS[cleanKey][lang] || cleanKey;
    }
    return cleanKey;
  };

  return { t, currentLanguage: lang, setLanguage: setLang };
}
