# Ai Doc - Healthcare Assistant

> **Prototype limits:** This is a local demo, not a clinical service. It uses bundled illustrative data in `datasets_data.js`; it does not download or query the Hugging Face datasets listed below. PDF.js and Tesseract.js load from public CDNs for report text extraction. A configured AI endpoint is required for personalized report interpretation and open-ended answers. Speech uses browser-provided features when available. Do not rely on this app for diagnosis, treatment, emergency dispatch, or confirmed appointments.

The host app can inject `window.AIDOC_CONTEXT` before `app.js` loads. Supported fields are `selected_language`, `user_profile` (object or JSON string), `report_text`, `agent_endpoint`, `agent_model`, and optional `agent_headers`. The endpoint should accept an OpenAI-compatible chat-completions body; Ai Doc sends `temperature: 0.25`. No model credentials or endpoint are bundled with this local demo.

An educational health-support prototype with bundled illustrative data. It is not a clinical decision-support service.

---

## 🌟 Overview & Problem Statement

Healthcare information is often fragmented, complex to interpret, and difficult to access promptly. Many individuals struggle to:
1. Understand laboratory blood and diagnostic reports.
2. Adhere to strict, doctor-prescribed medication schedules.
3. Formulate nutritious diet and hydration plans tailored to metabolic conditions.
4. Distinguish between common symptoms and life-threatening medical emergencies.
5. Provide age-appropriate bodily health and safety education to children (<18) vs adults (18+).
6. Book home phlebotomy and nursing services for routine laboratory testing.

**Ai Doc** is a browser prototype featuring conversational intake, demo report examples, report text extraction, general nutrition and schedule ideas, browser voice controls, local FAQ search, and an interactive body board.

---

## 📚 Integrated Datasets

The following Hugging Face datasets were proposed as possible future sources. This prototype does not fetch or integrate them; it uses bundled demo data:

1. **`AnubhutiBhardwaj/medical-reports-demo`**:
   - Comprehensive laboratory panels (Blood Sugar Fasting/PP/HbA1c, Blood Pressure, Lipid Profile, Complete Blood Count, Liver & Kidney Function, Thyroid).
   - Parameter-by-parameter reference ranges and plain-language interpretations.
2. **`dux-tecblic/symptom-disease-dataset`**:
   - Symptom-to-condition knowledge mapping, triage severity indicators, suggested lab tests, and recommended medical specialists.
3. **`nutrition-assistant-team/nutrition-food-label`** (`items`, `off_products`, `test`):
   - Condition-specific foods to eat vs avoid, scientific rationale, macronutrient breakdowns, allergen filters, and dietary preferences (Veg, Non-Veg, Vegan).
4. **`jason1966/aakashjoshi123_exercise-and-fitness-metrics-dataset`**:
   - Age-appropriate physical activity, target heart rates, calorie burn estimates, hydration requirements, and sleep targets.
5. **`sksayril/medicine-information`**:
   - Drug roles, mechanisms, food interactions, and doctor-prescribed adherence rules.
6. **`Karmukilan/Medical_Question_answering_Dataset`**:
   - Instant doubt resolution and clinical FAQs for the search bar and voice assistant.

---

## 🛡️ Core Safety Guardrails

- **Zero Diagnostic or Prescription Claims**: The AI never diagnoses diseases or prescribes medications.
- **Strict Respect for Prescriptions**: Never alters, invents, or guesses medicine dosages or timings.
- **Safer Option Rule**: If emergency red flags appear (chest pain, breathing difficulty, stroke signs, fainting), the assistant immediately triggers emergency triage (Ambulance 108/911 and nearby ER locator).
- **Minor / Under-18 Safeguards**: For users under 18, the system gives **zero medicine advice**, involves parents/guardians, and delivers body safety education (swimsuit/underwear rule, personal boundaries, trusted adults).

---

## 🚀 Key Features

### 1. Conversational Intake Flow (One Question at a Time)
1. Greeting & Name + Age
2. Biological Gender
3. Preferred Language (English, Hindi, Spanish, French)
4. Dietary Preference (Vegetarian, Non-Vegetarian, Vegan, Eggetarian)
5. Known Allergies (Penicillin, Sulfa, Peanuts, Gluten, Dairy, etc.)
6. Existing Medical Conditions (Diabetes, Hypertension, Thyroid, etc.)
7. Current Doctor-Prescribed Medicines (Exact dosage/timing)
8. Upload Report (Photo/PDF) or Type Symptoms

### 2. Medical Report & Symptom Scanner
- Scans parameters (Sugar, BP, Hemoglobin, Cholesterol, Creatinine, etc.).
- Categorizes values as **Normal**, **Low**, or **High** with plain explanations.
- Outlines precautions, pros, and cons of lifestyle management.
- For symptoms: non-diagnostic possible causes, suggested tests, and specialist doctor recommendations.

### 3. Personalized Diet Plan & "Today Schedule"
- Condition-specific foods to eat and avoid with scientific rationale.
- Respects food preferences and filters out all known allergens.
- Hydration targets (liters/day) and sleep recommendations.
- Interactive **Today Schedule** with suggested habit times; it does not create medicine reminders from medicine names.
- Adherence tracking: "Mark Done", "Mark Missed", and completion percentage.

### 4. AI Voice Assistant & Global Search Bar
- Powered by Web Speech API (`SpeechSynthesis` & `webkitSpeechRecognition`).
- Multi-language voice playback.
- **Guided Tour**: "How to Use the App" spoken aloud.
- **Read Results Aloud**: Narrates scanned values and diet plans.
- **Global Search Bar**: Instant answers to user doubts with doctor consultation disclaimers.

### 5. Interactive Human Body Board
- **Under 18 (Kids & Teens)**:
  - Cartoon/illustrated interactive organs (Brain, Heart, Lungs, Stomach, Bones, Skin).
  - Fun superhero analogies, hygiene rules (handwashing, brushing), active outdoor play vs screen time.
  - **Body Safety & Boundaries**: The Swimsuit/Underwear Rule, safe vs unsafe touches, 3-step safety rule (Say NO, run away, tell a trusted adult), involving parents, zero medicine advice to kids.
- **18 and Above (Adults)**:
  - Deep anatomical and physiological breakdown of 8 body systems.
  - Clinical biomarkers (BP, FBS, HbA1c, Lipids, Creatinine, GFR, Hemoglobin).
  - Age-specific preventive screening milestones (20s, 30s, 40s, 50s+).

### 6. Emergency Warning & Nearby Hospital Locator
- Detects red flags: chest pain, shortness of breath, stroke signs (FAST), severe BP/sugar crashes, fainting.
- Calm, urgent alert banner and modal: "Act Now: Immediate Medical Attention Required".
- Emergency phone links and a general maps search; this prototype does not locate or contact hospitals or dispatch an ambulance.

### 7. Home Nurse Sample Collection Booking
- Prepare a draft request for a home sample collection service; no provider is contacted.
- Captures State, City, Area, Street Address, Date, and Time Slot.
- No booking confirmation or automatic result sync is available.

---

## 💻 Running the Application

### Option A: Open directly in your browser
Simply double-click `index.html` or open it with Google Chrome, Edge, or Firefox:
```text
file:///c:/Users/Zbook 14u g6/Downloads/project/index.html
```

### Option B: Run via Python Web Server
```powershell
python health_assistant.py serve 8080
```
Then visit `http://localhost:8080` in your web browser.

### Option C: Run Interactive CLI Mode
```powershell
python health_assistant.py
```
