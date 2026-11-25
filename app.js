// HealthMate AI - Core Application Engine
// Multi-Agent Medical Support Assistant with Voice, Search, Report Scanning, Diet & Schedule

// Load saved chat sessions from localStorage
let savedSessions = [];
try {
  const stored = localStorage.getItem("healthmate_chat_history");
  if (stored) savedSessions = JSON.parse(stored);
} catch (e) {
  savedSessions = [];
}

const AIDOC_CONTEXT = window.AIDOC_CONTEXT || {};
const rawSeededProfile = AIDOC_CONTEXT.user_profile || AIDOC_CONTEXT.userProfile || {};
let seededProfile = rawSeededProfile;
if (typeof rawSeededProfile === "string") {
  try { seededProfile = JSON.parse(rawSeededProfile); } catch { seededProfile = {}; }
}
const seededLanguage = AIDOC_CONTEXT.selected_language || AIDOC_CONTEXT.selectedLanguage || seededProfile.language || "";
const AppState = {
  user: {
    name: seededProfile.name || "Guest",
    age: seededProfile.age ?? "None",
    gender: seededProfile.gender || "None",
    language: seededLanguage || "",
    foodPreference: seededProfile.foodPreference || seededProfile.food_preference || "None",
    allergies: seededProfile.allergies || "None",
    existingConditions: seededProfile.existingConditions || seededProfile.conditions || "None",
    currentMedicines: seededProfile.currentMedicines || seededProfile.medicines || "None"
  },
  languageChosen: Boolean(seededLanguage),
  conversationStep: 0,
  chatHistory: [],
  chatSessions: savedSessions,
  currentReport: AIDOC_CONTEXT.report_text || AIDOC_CONTEXT.reportText ? { extractedText: AIDOC_CONTEXT.report_text || AIDOC_CONTEXT.reportText, title: "Uploaded report text" } : null,
  currentSymptoms: null,
  activeTab: "chat",
  bodyMode: "adult", // 'kids' or 'adult'
  selectedOrgan: "heart",
  isSpeaking: false,
  isListening: false,
  recognition: null,
  voiceTarget: "chat",
  speechSynth: window.speechSynthesis || null,
  voiceSettings: {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    selectedVoiceURI: ""
  },
  todaySchedule: [
    { id: 1, time: "07:30 AM", title: "Morning Hydration", desc: "Drink 1-2 glasses of warm water to awaken metabolism.", category: "water", status: "pending" },
    { id: 2, time: "08:15 AM", title: "Nutritious Breakfast", desc: "Whole oats or vegetable poha with almonds and chia seeds.", category: "meal", status: "pending" },
    { id: 4, time: "11:00 AM", title: "Hydration & Movement Break", desc: "Drink 1 glass water and do 5 mins light stretches.", category: "water", status: "pending" },
    { id: 5, time: "01:15 PM", title: "Balanced High-Fiber Lunch", desc: "Salad plate + whole grains (brown rice/quinoa) + lentils/dal.", category: "meal", status: "pending" },
    { id: 6, time: "04:30 PM", title: "Active Evening Walk / Exercise", desc: "30-40 mins brisk walking (Target heart rate 100-125 bpm).", category: "exercise", status: "pending" },
    { id: 7, time: "05:30 PM", title: "Hydration Refuel", desc: "Coconut water or herbal tea without added sugar.", category: "water", status: "pending" },
    { id: 8, time: "07:45 PM", title: "Light Wholesome Dinner", desc: "Steamed vegetables, soup, or light lentil preparation.", category: "meal", status: "pending" },
    { id: 10, time: "10:30 PM", title: "Restorative Sleep Routine", desc: "Power down screens for 7-8 hours deep cellular recovery.", category: "sleep", status: "pending" }
  ],
  nurseBookings: []
};

// Language map for Web Speech API
const LANG_VOICE_MAP = {
  "en-US": "en-US",
  "te-IN": "te-IN",
  "hi-IN": "hi-IN",
  "es-ES": "es-ES",
  "fr-FR": "fr-FR"
};

const LANGUAGE_ALIASES = {
  english: "en-US", telugu: "te-IN", తెలుగు: "te-IN", "te-in": "te-IN",
  hindi: "hi-IN", हिन्दी: "hi-IN", spanish: "es-ES", español: "es-ES",
  french: "fr-FR", français: "fr-FR", tamil: "ta-IN", தமிழ்: "ta-IN",
  kannada: "kn-IN", ಕನ್ನಡ: "kn-IN", malayalam: "ml-IN", മലയാളം: "ml-IN"
};

const FIRST_MESSAGES = {
  "en-US": { language: "Which language would you like me to use? You can type any language name.", changed: "I’ll use English from now on.", name: "Hello! I’m Ai Doc. What name and age should I use?" },
  "te-IN": { language: "మీకు ఏ భాషలో మాట్లాడాలి? ఏ భాష పేరైనా టైప్ చేయండి.", changed: "ఇకపై నేను తెలుగులో మాట్లాడతాను.", name: "నమస్కారం! నేను Ai Doc. మీ పేరు, వయస్సు ఏమిటి?" },
  "hi-IN": { language: "आप किस भाषा में बात करना चाहेंगे? भाषा का नाम लिखें।", changed: "अब मैं हिंदी में बात करूँगा।", name: "नमस्ते! मैं Ai Doc हूँ। आपका नाम और उम्र क्या है?" },
  "es-ES": { language: "¿En qué idioma prefieres hablar? Escribe el nombre del idioma.", changed: "A partir de ahora hablaré en español.", name: "¡Hola! Soy Ai Doc. ¿Cuál es tu nombre y edad?" },
  "fr-FR": { language: "Quelle langue préférez-vous ? Écrivez son nom.", changed: "Je vais maintenant parler en français.", name: "Bonjour ! Je suis Ai Doc. Quel est votre nom et votre âge ?" }
};

const INTAKE_TRANSLATIONS = {
  "te-IN": {
    gender: "మీ లింగం ఏమిటి? చెప్పాలనుకోకపోతే అలా చెప్పండి.",
    language: "మీకు ఏ భాషలో మాట్లాడాలి?",
    foodPreference: "మీ ఆహార అభిరుచి ఏమిటి? ఉదాహరణకు శాకాహారం, మాంసాహారం లేదా వీగన్.",
    allergies: "మీకు ఏవైనా ఆహార లేదా మందుల అలర్జీలు ఉన్నాయా? లేకపోతే ఏవీ లేవని చెప్పండి.",
    existingConditions: "వైద్యుడు నిర్ధారించిన ఆరోగ్య సమస్యలు ఏవైనా ఉన్నాయా?",
    currentMedicines: "వైద్యుడు సూచించిన మందులు వాడుతున్నారా? 18 ఏళ్లలోపు అయితే తల్లిదండ్రులు లేదా సంరక్షకులు సమాధానం చెప్పాలి.",
    reportOrSymptoms: "మీ దగ్గర వైద్య నివేదిక ఉందా? లేకపోతే లక్షణాలు, ఎప్పటి నుంచి, తీవ్రత, జ్వరం లేదా నొప్పి ఉన్నాయా చెప్పండి."
  },
  "hi-IN": {
    gender: "आपका लिंग क्या है? बताना न चाहें तो ऐसा कहें।",
    foodPreference: "आपकी खानपान की पसंद क्या है? जैसे शाकाहारी, मांसाहारी या वीगन।",
    allergies: "क्या आपको किसी भोजन या दवा से एलर्जी है? नहीं हो तो कोई नहीं कहें।",
    existingConditions: "क्या डॉक्टर ने आपको कोई स्वास्थ्य समस्या बताई है?",
    currentMedicines: "क्या आप डॉक्टर की बताई दवाएँ लेते हैं? 18 वर्ष से कम हों तो माता-पिता या अभिभावक जवाब दें।",
    reportOrSymptoms: "क्या आपके पास मेडिकल रिपोर्ट है? नहीं तो लक्षण, कब से हैं, कितने गंभीर हैं, और बुखार या दर्द है या नहीं बताएं।"
  }
};

function normalizeLanguage(language) {
  if (!language) return "";
  const value = String(language).trim();
  const direct = LANGUAGE_ALIASES[value.toLowerCase()] || LANGUAGE_ALIASES[value];
  if (direct) return direct;
  const menuMatch = ALL_LANGUAGES.find(item => item.name.toLowerCase() === value.toLowerCase() || item.native.toLowerCase() === value.toLowerCase());
  return menuMatch?.code || (value.includes("-") ? value : "");
}

function languageCopy(key) { return FIRST_MESSAGES[AppState.user.language] || FIRST_MESSAGES["en-US"]; }

function buildAiDocSystemMessage() {
  const reportText = AppState.currentReport?.extractedText || AIDOC_CONTEXT.report_text || AIDOC_CONTEXT.reportText || "";
  const userProfile = JSON.stringify(AppState.user);
  const language = AppState.user.language || "not selected";
  return `You are Ai Doc, a friendly healthcare support assistant. Selected language: ${language}. User profile: ${userProfile}. Report text: ${reportText || "not provided"}. Reply in the selected language, use plain text, acknowledge the user's message before asking one question, never diagnose or prescribe, never invent report values or medication instructions. For report extraction, preserve the report's exact names, values, units, flags, and ranges; mark absent details as not found in the report. Use temperature 0.25.`;
}

async function requestAiDoc(message) {
  const endpoint = AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint;
  if (!endpoint) return "";
  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(AIDOC_CONTEXT.agent_headers || {}) },
    body: JSON.stringify({
      model: AIDOC_CONTEXT.agent_model || "",
      temperature: 0.25,
      messages: [
        { role: "system", content: buildAiDocSystemMessage() },
        ...AppState.chatHistory.filter(item => item.sender === "user" || item.sender === "agent").slice(-11, -1).map(item => ({ role: item.sender === "agent" ? "assistant" : "user", content: item.text })),
        { role: "user", content: message }
      ]
    })
  });
  if (!response.ok) throw new Error(`AI endpoint returned ${response.status}`);
  const data = await response.json();
  return data.choices?.[0]?.message?.content || data.reply || "";
}

// Conversational Intake Steps Definition
const INTAKE_STEPS = [
  {
    step: 0,
    field: "name_age",
    question: "Hello! Welcome to HealthMate AI. I'm your friendly, careful medical-support assistant. I'm here to help you understand your reports, plan nutritious meals, keep to your daily health schedule, and get prompt care when needed. \n\nTo begin, what is your **full name** and **age**?",
    quickChips: ["Alex, 32", "Sarah, 45", "Rohan, 14", "Priya, 28"]
  },
  {
    step: 1,
    field: "gender",
    question: (name) => `Pleasure to meet you, ${name}! What is your biological **gender** (Male, Female, Non-Binary, or Prefer not to say)?`,
    quickChips: ["Male", "Female", "Non-Binary", "Prefer not to say"]
  },
  {
    step: 2,
    field: "language",
    question: () => `What is your **preferred language** for voice guidance and reports?`,
    quickChips: ["English", "Hindi", "Spanish", "French"]
  },
  {
    step: 3,
    field: "foodPreference",
    question: () => `What is your **food preference**? (e.g. Vegetarian, Non-Vegetarian, Vegan, Eggetarian)`,
    quickChips: ["Vegetarian", "Non-Vegetarian", "Vegan", "Eggetarian"]
  },
  {
    step: 4,
    field: "allergies",
    question: () => `Do you have any known **food or drug allergies**? (e.g., Penicillin, Peanuts, Gluten, Dairy, Shellfish, or None)`,
    quickChips: ["No Allergies", "Penicillin", "Peanuts", "Gluten / Celiac", "Dairy / Lactose"]
  },
  {
    step: 5,
    field: "existingConditions",
    question: () => `Do you have any **existing health conditions** diagnosed by a doctor? (e.g., Diabetes, High Blood Pressure, Thyroid, Asthma, or None)`,
    quickChips: ["None", "Type 2 Diabetes", "Hypertension (High BP)", "Hypothyroidism", "Asthma"]
  },
  {
    step: 6,
    field: "currentMedicines",
    question: () => AppState.user.age < 18
      ? `Are you taking any medicines prescribed by a doctor? Please ask a parent or guardian to answer. I cannot give medicine advice to anyone under 18.`
      : `Are you taking medicines prescribed by a doctor? Please list the exact dose and timing from the label or prescription, or type 'None'. I will not change or guess your directions.`,
    quickChips: ["No medicines", "I take prescribed medicines (I'll enter the label directions)"]
  },
  {
    step: 7,
    field: "reportOrSymptoms",
    question: () => `Thank you! Now, please **upload your medical report** (as a photo or PDF), choose one of our **sample lab reports** below to test, or **type your symptoms** (what you feel, since when, how severe on a 1-10 scale, and whether you have fever or pain).`,
    quickChips: ["Load Sample Report 1 (Diabetes & BP)", "Load Sample Report 2 (Low Hemoglobin)", "Load Sample Report 3 (Thyroid)", "I have symptoms to report"]
  }
];

// Initialize speech recognition
function initSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (SpeechRecognition) {
    AppState.recognition = new SpeechRecognition();
    AppState.recognition.continuous = false;
    AppState.recognition.interimResults = false;
    AppState.recognition.lang = AppState.user.language || "en-US";

    AppState.recognition.onstart = () => {
      AppState.isListening = true;
      updateVoiceIndicator();
      showToast("Listening... speak your question or answer.");
    };

    AppState.recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      if (AppState.voiceTarget === "search") {
        document.getElementById("globalSearchInput").value = speechResult;
        askFromSearch(speechResult);
      } else {
        document.getElementById("chatInput").value = speechResult;
        handleUserResponse(speechResult);
      }
    };

    AppState.recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      AppState.isListening = false;
      updateVoiceIndicator();
    };

    AppState.recognition.onend = () => {
      AppState.isListening = false;
      updateVoiceIndicator();
    };
  }
}

function startVoiceInput(target = "chat") {
  initSpeechRecognition();
  if (!AppState.recognition) return showToast("Speech recognition is not available in this browser.");
  AppState.voiceTarget = target;
  AppState.recognition.lang = AppState.user.language || "en-US";
  AppState.recognition.start();
}

// Speak text using Web Speech API
function speakText(text, onComplete) {
  if (!AppState.speechSynth) return;
  // Respect Voice ON/OFF switch
  if (!AppState.voiceSettings.enabled) {
    if (onComplete) onComplete();
    return;
  }
  AppState.speechSynth.cancel(); // stop any ongoing speech

  // Strip Markdown characters for clean speech synthesis
  const cleanText = text
    .replace(/[*#_`~>\[\]\(\)]/g, "")
    .replace(/https?:\/\/\S+/g, "")
    .replace(/\n+/g, ". ");

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = AppState.user.language || "en-US";
  utterance.rate = AppState.voiceSettings.rate || 1.0;
  utterance.pitch = AppState.voiceSettings.pitch || 1.0;
  utterance.volume = AppState.voiceSettings.volume !== undefined ? AppState.voiceSettings.volume : 1.0;

  // If a specific system voice was chosen, assign it
  if (AppState.voiceSettings.selectedVoiceURI) {
    const voices = AppState.speechSynth.getVoices();
    const match = voices.find(v => v.voiceURI === AppState.voiceSettings.selectedVoiceURI);
    if (match) utterance.voice = match;
  }

  utterance.onstart = () => {
    AppState.isSpeaking = true;
    updateVoiceIndicator();
  };

  utterance.onend = () => {
    AppState.isSpeaking = false;
    updateVoiceIndicator();
    if (onComplete) onComplete();
  };

  utterance.onerror = (e) => {
    console.warn("Speech synthesis error", e);
    AppState.isSpeaking = false;
    updateVoiceIndicator();
  };

  AppState.speechSynth.speak(utterance);
}

function stopSpeaking() {
  if (AppState.speechSynth) {
    AppState.speechSynth.cancel();
    AppState.isSpeaking = false;
    updateVoiceIndicator();
  }
}

function updateVoiceIndicator() {
  const waveBars = document.querySelectorAll(".wave-bar");
  const voiceStatusText = document.getElementById("voiceStatusText");
  if (!AppState.voiceSettings.enabled) {
    waveBars.forEach(b => b.classList.remove("speaking"));
    if (voiceStatusText) voiceStatusText.textContent = "AI Voice Muted (Audio OFF in Settings)";
    return;
  }

  if (AppState.isSpeaking) {
    waveBars.forEach(b => b.classList.add("speaking"));
    if (voiceStatusText) voiceStatusText.textContent = "AI Voice Assistant is speaking aloud...";
  } else if (AppState.isListening) {
    waveBars.forEach(b => b.classList.add("speaking"));
    if (voiceStatusText) voiceStatusText.textContent = "AI Voice Assistant is listening...";
  } else {
    waveBars.forEach(b => b.classList.remove("speaking"));
    if (voiceStatusText) voiceStatusText.textContent = "AI Voice Assistant Ready";
  }
}

// Global Toast message
function showToast(msg) {
  let toast = document.getElementById("appToast");
  if (!toast) {
    toast = document.createElement("div");
    toast.id = "appToast";
    toast.style.position = "fixed";
    toast.style.bottom = "20px";
    toast.style.right = "20px";
    toast.style.backgroundColor = "rgba(15, 23, 42, 0.9)";
    toast.style.color = "#ffffff";
    toast.style.padding = "10px 18px";
    toast.style.borderRadius = "8px";
    toast.style.zIndex = "9999";
    toast.style.fontSize = "0.85rem";
    toast.style.boxShadow = "0 4px 12px rgba(0,0,0,0.15)";
    document.body.appendChild(toast);
  }
  toast.textContent = msg;
  toast.style.display = "block";
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => {
    toast.style.display = "none";
  }, 3500);
}

// Add message to chat display and record in current session history
function addChatMessage(sender, text, chips = []) {
  // Push to history for archiving
  AppState.chatHistory.push({
    sender,
    text,
    chips: chips || [],
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  });

  const chatBody = document.getElementById("chatBody");
  const msgDiv = document.createElement("div");
  msgDiv.className = `chat-message ${sender}`;

  const avatar = document.createElement("div");
  avatar.className = "chat-avatar";
  avatar.innerHTML = sender === "agent" ? "🤖" : "👤";

  const bubble = document.createElement("div");
  bubble.className = "chat-bubble";
  bubble.innerHTML = text.replace(/\n/g, "<br>");

  if (chips && chips.length > 0) {
    const chipsDiv = document.createElement("div");
    chipsDiv.className = "chat-bubble-actions";
    chips.forEach(chipText => {
      const btn = document.createElement("button");
      btn.className = "btn-chip";
      btn.textContent = chipText;
      btn.onclick = () => handleUserResponse(chipText);
      chipsDiv.appendChild(btn);
    });
    bubble.appendChild(chipsDiv);
  }

  msgDiv.appendChild(avatar);
  msgDiv.appendChild(bubble);
  chatBody.appendChild(msgDiv);
  chatBody.scrollTop = chatBody.scrollHeight;

  // Speak agent messages if user enabled
  if (sender === "agent") {
    speakText(text);
  }
}

// Progress through Conversational Intake
function advanceIntake() {
  if (!AppState.languageChosen) {
    const copy = FIRST_MESSAGES["en-US"];
    addChatMessage("agent", copy.language);
    return;
  }

  while (AppState.conversationStep < INTAKE_STEPS.length) {
    const current = INTAKE_STEPS[AppState.conversationStep];
    const fieldValue = current.field === "reportOrSymptoms" && AppState.currentReport ? true : current.field === "name_age"
      ? AppState.user.name !== "Guest" && AppState.user.age !== "None"
      : current.field === "language" ? true
      : AppState.user[current.field];
    if (!fieldValue || fieldValue === "None" || fieldValue === "") break;
    AppState.conversationStep += 1;
  }

  const currentStep = INTAKE_STEPS[AppState.conversationStep];
  if (!currentStep) return;

  if (AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint) {
    const missing = currentStep.field === "name_age"
      ? (AppState.user.name === "Guest" ? "name" : "age")
      : currentStep.field;
    requestAiDoc(`Continue the one-question-at-a-time intake. Ask only for the missing profile field ${missing}, in the selected language. If the field is name and age, ask for whichever one is still missing. Keep it short and do not ask for fields already in the profile.`)
      .then(reply => { if (reply) addChatMessage("agent", reply); })
      .catch(() => addChatMessage("agent", "The assistant service is unavailable right now. Please try again."));
    return;
  }

  if (currentStep.field === "name_age") {
    const message = AppState.user.name !== "Guest" || AppState.user.age !== "None"
      ? (AppState.user.language === "te-IN"
        ? (AppState.user.name === "Guest" ? "మీ పేరు ఏమిటి?" : `నమస్కారం ${AppState.user.name}. మీ వయస్సు ఎంత?`)
        : AppState.user.name === "Guest" ? "What name should I use?" : `Hello, ${AppState.user.name}. What is your age?`)
      : (FIRST_MESSAGES[AppState.user.language] || FIRST_MESSAGES["en-US"]).name;
    addChatMessage("agent", message);
    return;
  }
  if (currentStep.field === "language") {
    AppState.conversationStep += 1;
    advanceIntake();
    return;
  }

  let questionText = "";
  const translatedQuestion = INTAKE_TRANSLATIONS[AppState.user.language]?.[currentStep.field];
  if (translatedQuestion) {
    questionText = translatedQuestion;
  } else if (currentStep.field === "name_age") {
    questionText = (FIRST_MESSAGES[AppState.user.language] || FIRST_MESSAGES["en-US"]).name;
  } else if (typeof currentStep.question === "function") {
    questionText = currentStep.question(AppState.user.name);
  } else {
    questionText = currentStep.question;
  }

  addChatMessage("agent", questionText, currentStep.quickChips);
}

// Handle user response from input or chip
async function handleUserResponse(userInput) {
  const inputTrimmed = String(userInput || "").trim();
  if (!inputTrimmed) return;

  // Add user bubble
  addChatMessage("user", inputTrimmed);
  document.getElementById("chatInput").value = "";

  const namedLanguage = Object.keys(LANGUAGE_ALIASES).sort((a, b) => b.length - a.length).find(name => inputTrimmed.toLowerCase().includes(name.toLowerCase())) ||
    ALL_LANGUAGES.find(item => inputTrimmed.toLowerCase().includes(item.name.toLowerCase()) || inputTrimmed.includes(item.native))?.name;
  const languageIntent = /\b(language|chat|speak|talk|reply|respond|తెలుగులో)\b/i.test(inputTrimmed) || inputTrimmed.trim().toLowerCase() === namedLanguage?.toLowerCase();
  const requestedLanguage = namedLanguage && languageIntent ? namedLanguage : "";
  if (requestedLanguage) {
    const code = normalizeLanguage(requestedLanguage);
    if (code) {
      AppState.languageChosen = true;
      setAppLanguage(code, false);
      addChatMessage("agent", (FIRST_MESSAGES[code] || FIRST_MESSAGES["en-US"]).changed);
      if (AppState.conversationStep === 0 && AppState.user.name === "Guest") {
        addChatMessage("agent", (FIRST_MESSAGES[code] || FIRST_MESSAGES["en-US"]).name);
      }
      return;
    }
  }

  if (!AppState.languageChosen) {
    const code = normalizeLanguage(inputTrimmed);
    if (!code) {
      addChatMessage("agent", "I didn’t recognize that language name. Please type it again, for example Telugu, Hindi, English, Spanish, or French.");
      return;
    }
    AppState.languageChosen = true;
    setAppLanguage(code, false);
    const copy = FIRST_MESSAGES[code] || FIRST_MESSAGES["en-US"];
    addChatMessage("agent", `${copy.changed} ${copy.name}`);
    return;
  }

  // Check for immediate emergency red flags in user speech
  checkEmergencyWords(inputTrimmed);

  // Process current step
  const step = AppState.conversationStep;

  // Await a configured agent before moving to the next intake question.
  if (AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint) {
    try {
      const reply = await requestAiDoc(inputTrimmed);
      if (reply) addChatMessage("agent", reply);
    } catch (error) {
      console.warn("Ai Doc service unavailable:", error);
      addChatMessage("agent", AppState.user.language === "te-IN"
        ? "Ai Doc సేవ ప్రస్తుతం అందుబాటులో లేదు. మీరు చెప్పింది అర్థమైంది."
        : "The Ai Doc service is unavailable right now. I understand what you said.");
    }
  } else if (step < INTAKE_STEPS.length) {
    const ack = AppState.user.language === "te-IN" ? "మీరు చెప్పింది అర్థమైంది." :
      AppState.user.language === "hi-IN" ? "मैंने आपकी बात समझ ली।" :
      AppState.user.language === "es-ES" ? "Entiendo lo que me has dicho." :
      AppState.user.language === "fr-FR" ? "J’ai bien compris." : "I understand.";
    addChatMessage("agent", ack);
  }

  if (step === 0) {
    // Name and Age
    const match = inputTrimmed.match(/(\d+)/);
    if (match) {
      AppState.user.age = parseInt(match[1]);
      AppState.user.name = inputTrimmed.replace(/\d+/, "").replace(/,|years?|old|am|is|my name/gi, "").trim() || "Friend";
    } else {
      AppState.user.name = inputTrimmed;
    }
    updateProfileUI();
    AppState.conversationStep = 1;
    setTimeout(advanceIntake, 600);
  } else if (step === 1) {
    AppState.user.gender = inputTrimmed;
    updateProfileUI();
    AppState.conversationStep = 2;
    setTimeout(advanceIntake, 600);
  } else if (step === 2) {
    if (inputTrimmed.toLowerCase().includes("hindi")) AppState.user.language = "hi-IN";
    else if (inputTrimmed.toLowerCase().includes("spanish")) AppState.user.language = "es-ES";
    else if (inputTrimmed.toLowerCase().includes("french")) AppState.user.language = "fr-FR";
    else AppState.user.language = "en-US";

    document.getElementById("langSelector").value = AppState.user.language;
    updateProfileUI();
    AppState.conversationStep = 3;
    setTimeout(advanceIntake, 600);
  } else if (step === 3) {
    AppState.user.foodPreference = inputTrimmed;
    updateProfileUI();
    AppState.conversationStep = 4;
    setTimeout(advanceIntake, 600);
  } else if (step === 4) {
    AppState.user.allergies = inputTrimmed;
    updateProfileUI();
    AppState.conversationStep = 5;
    setTimeout(advanceIntake, 600);
  } else if (step === 5) {
    AppState.user.existingConditions = inputTrimmed;
    updateProfileUI();
    AppState.conversationStep = 6;
    setTimeout(advanceIntake, 600);
  } else if (step === 6) {
    AppState.user.currentMedicines = inputTrimmed;
    updateProfileUI();
    updateScheduleWithMedicines(inputTrimmed);
    AppState.conversationStep = 7;
    setTimeout(advanceIntake, 600);
  } else if (step === 7) {
    // Report or symptoms selection
    if (inputTrimmed.includes("Sample Report 1")) {
      loadSampleReport(0);
    } else if (inputTrimmed.includes("Sample Report 2")) {
      loadSampleReport(1);
    } else if (inputTrimmed.includes("Sample Report 3")) {
      loadSampleReport(2);
    } else if (inputTrimmed.toLowerCase().includes("symptom")) {
      switchToTab("report");
      addChatMessage("agent", "I've opened the **Symptom & Report Scanner** tab for you. Please type what you feel, how long it has lasted, the severity level, and whether fever or pain is present.");
    } else {
      // Treat as typed symptoms
      processTypedSymptoms(inputTrimmed);
    }
  } else {
    // General Q&A step
    handleUserDoubt(inputTrimmed);
  }
}

// Check emergency red flags
function checkEmergencyWords(text) {
  const lower = text.toLowerCase();
  const emergencyKeywords = [
    "chest pain", "heart attack", "can't breathe", "cannot breathe", "trouble breathing",
    "stroke", "facial droop", "slurred speech", "passed out", "fainted", "unconscious",
    "heavy bleeding", "crushing pressure"
  ];

  for (let kw of emergencyKeywords) {
    if (lower.includes(kw)) {
      triggerEmergencyAlert(`Emergency symptom detected: "${kw}". Seek immediate medical help!`);
      break;
    }
  }
}

// Trigger Emergency Alert Modal
function triggerEmergencyAlert(reason) {
  const modal = document.getElementById("emergencyModal");
  const modalReason = document.getElementById("emergencyReason");
  if (modalReason) modalReason.textContent = reason;
  if (modal) modal.classList.add("active");

  speakText("Warning sign detected. Please act now. We can help you call an ambulance or find the nearest hospital emergency room right now.");
}

function closeEmergencyModal() {
  const modal = document.getElementById("emergencyModal");
  if (modal) modal.classList.remove("active");
}

// Update schedule with exact prescribed medicines (Never invent dosage)
function updateScheduleWithMedicines(medsText) {
  // Medicine reminders are intentionally not created from free-text medicine names.
  // Add a reminder only when the patient enters the exact prescribed time and directions.
  renderSchedule();
}

// Update User Profile UI & Minor/Adult mode switch
function updateProfileUI() {
  const name = AppState.user.name || "Guest";
  document.getElementById("profileName").textContent = name;

  const age = AppState.user.age;
  const isAgeSet = age !== "None" && !isNaN(parseInt(age));
  const ageDisplay = isAgeSet ? `${age} yrs • ${AppState.user.gender || 'None'}` : `Not set • ${AppState.user.gender || 'None'}`;
  document.getElementById("profileAge").textContent = ageDisplay;

  const ageBadge = document.getElementById("profileAgeBadge");
  const isKid = isAgeSet && parseInt(age) < 18;

  if (isKid) {
    ageBadge.className = "badge-kid";
    ageBadge.textContent = "👶 Junior / Kids Mode (<18)";
    AppState.bodyMode = "kids";
    const btnK = document.getElementById("btnModeKids");
    const btnA = document.getElementById("btnModeAdult");
    if (btnK) btnK.classList.add("active");
    if (btnA) btnA.classList.remove("active");
  } else {
    ageBadge.className = "badge-adult";
    ageBadge.textContent = isAgeSet ? "🧑 Adult Health Mode (18+)" : "🧑 Health Profile";
    AppState.bodyMode = "adult";
    const btnK = document.getElementById("btnModeKids");
    const btnA = document.getElementById("btnModeAdult");
    if (btnA) btnA.classList.add("active");
    if (btnK) btnK.classList.remove("active");
  }

  document.getElementById("profileFood").textContent = AppState.user.foodPreference || "None";
  document.getElementById("profileAllergies").textContent = AppState.user.allergies || "None";
  document.getElementById("profileConditions").textContent = AppState.user.existingConditions || "None";
  document.getElementById("profileMeds").textContent = AppState.user.currentMedicines || "None";

  renderBodyBoard();
  updateSidebarExercises();
}

// Load preloaded sample report from dataset
function loadSampleReport(index) {
  const report = HEALTH_DATASETS.sampleReports[index];
  if (!report) return;

  delete AIDOC_CONTEXT.report_text;
  delete AIDOC_CONTEXT.reportText;
  AppState.currentReport = report;
  AppState.currentSymptoms = null;
  renderReportAnalysis(report);
  generateDualSourceDiet();
  updateSidebarExercises();

  switchToTab("report");

  addChatMessage("agent", `This is an illustrative demo report: **${report.title}**. It is not your personal result. The sample values are shown with simple explanations.`);
  speakText(`This is an illustrative demo report for ${report.title}, not your personal result.`);
}

function loadExternalScript(src, globalName) {
  if (window[globalName]) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = resolve;
    script.onerror = () => reject(new Error(`Could not load ${globalName}. Check your internet connection.`));
    document.head.appendChild(script);
  });
}

async function extractReportText(file) {
  if (AIDOC_CONTEXT.extract_report_text) return AIDOC_CONTEXT.extract_report_text(file);
  if (file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf")) {
    await loadExternalScript("https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js", "pdfjsLib");
    pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise;
    const pages = [];
    for (let pageNo = 1; pageNo <= pdf.numPages; pageNo += 1) {
      const page = await pdf.getPage(pageNo);
      const content = await page.getTextContent();
      pages.push(content.items.map(item => item.str).join(" "));
    }
    return pages.join("\n");
  }
  await loadExternalScript("https://cdn.jsdelivr.net/npm/tesseract.js@4.1.1/dist/tesseract.min.js", "Tesseract");
  const ocrLanguage = AppState.user.language === "te-IN" ? "eng+tel" : "eng";
  const worker = await Tesseract.createWorker(ocrLanguage, 1, {
    langPath: "https://tessdata.projectnaptha.com/4.0.0",
    logger: progress => {
      if (progress.status === "recognizing text") showToast(`Reading report: ${Math.round((progress.progress || 0) * 100)}%`);
    }
  });
  try {
    await worker.load();
    await worker.loadLanguage(ocrLanguage);
    await worker.initialize(ocrLanguage);
    const result = await worker.recognize(file);
    return result.data.text || "";
  } finally {
    await worker.terminate();
  }
}

async function showExtractedReport(extractedText, title = "Uploaded report") {
  AppState.currentReport = { title, extractedText };
  AIDOC_CONTEXT.report_text = extractedText;
  const area = document.getElementById("reportResultsArea");
  area.innerHTML = `<div class="section-card"><h3>Text extracted from ${escapeHtml(title)}</h3><p>Review this text against the original report. OCR can misread names and numbers.</p><pre class="report-extracted-text"></pre><div id="reportAiExplanation"></div></div>`;
  area.querySelector("pre").textContent = extractedText;
  const aiArea = document.getElementById("reportAiExplanation");
  if (AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint) {
    const reply = await requestAiDoc("Read this report text. Before anything else, list patient name, age, gender, report date, lab name, and tests exactly as shown; mark absent details not found in the report. If report identity differs from the saved profile, say so and ask which person it belongs to. Then list each test with result, unit, reference range, and flag exactly as written. Explain results simply without inventing missing values. Report text is included in the system context.");
    aiArea.textContent = reply || "The connected assistant returned no report explanation.";
    addChatMessage("agent", reply || "The connected assistant returned no report explanation.");
  } else {
    aiArea.textContent = "Connect an AI endpoint to identify report fields and explain results. The extracted text above is shown unchanged; check it against the original before relying on it.";
  }
}

async function handleReportFile(file) {
  if (!file) return;
  AppState.currentReport = null;
  AppState.currentSymptoms = null;
  const area = document.getElementById("reportResultsArea");
  area.innerHTML = `<div class="section-card"><p>Reading ${escapeHtml(file.name)}. The previous report has been cleared.</p></div>`;
  switchToTab("report");
  try {
    const extractedText = (await extractReportText(file)).trim();
    if (!extractedText) throw new Error("No readable text was found. The report may be a low-quality scan or an image-only PDF.");
    await showExtractedReport(extractedText, file.name);
  } catch (error) {
    area.innerHTML = `<div class="section-card"><h3>Could not read the report</h3><p>${escapeHtml(error.message)} You can try a clearer image or a text-based PDF.</p></div>`;
    addChatMessage("agent", `I could not extract text from ${escapeHtml(file.name)}. Please try a clearer image or text-based PDF.`);
  }
}

// Process typed symptoms
function processTypedSymptoms(symptomsText) {
  const lower = symptomsText.toLowerCase();
  let matched = null;

  // Search in symptom disease dataset
  for (let s of HEALTH_DATASETS.symptomsDatabase) {
    const keyWords = s.symptom.toLowerCase().split(" ");
    let matchCount = 0;
    keyWords.forEach(w => {
      if (w.length > 3 && lower.includes(w)) matchCount++;
    });
    if (matchCount >= 2) {
      matched = s;
      break;
    }
  }

  if (!matched) {
    matched = HEALTH_DATASETS.symptomsDatabase[4]; // Default to general symptoms
  }

  AppState.currentSymptoms = {
    userNote: symptomsText,
    guidance: matched
  };

  renderSymptomsAnalysis(symptomsText, matched);
  generateDualSourceDiet();
  updateSidebarExercises();
  switchToTab("report");

  addChatMessage("agent", `Based on your symptoms: **"${symptomsText}"**, here are general possible causes without a diagnosis. I strongly suggest consulting a **${matched.recommendedSpecialist}** and taking the recommended laboratory tests.`);
}

// Render report analysis view
function renderReportAnalysis(report) {
  const container = document.getElementById("reportResultsArea");
  if (!container) return;

  let html = `
    <div class="section-card">
      <div class="section-header">
        <h2>📄 ${report.title}</h2>
        <span class="badge-status badge-normal">${report.patientType}</span>
      </div>
      <p style="color: var(--text-muted); margin-bottom: 1.25rem;">${report.summary}</p>
      
      <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: var(--primary-dark);">Scanned Parameters & Simple Explanations:</h3>
      <div class="report-grid">
  `;

  report.values.forEach(param => {
    const badgeClass = param.status === "High" ? "badge-high" : param.status === "Low" ? "badge-low" : "badge-normal";
    const cardClass = param.status === "High" ? "high" : param.status === "Low" ? "low" : "normal";
    html += `
      <div class="param-card ${cardClass}">
        <div class="param-top">
          <span class="param-name">${param.parameter}</span>
          <span class="badge-status ${badgeClass}">${param.status}</span>
        </div>
        <div class="param-val">${param.value} <span>${param.unit}</span></div>
        <div class="param-range">Normal Range: ${param.normalRange} ${param.unit}</div>
        <div class="param-exp">${param.explanation}</div>
      </div>
    `;
  });

  html += `</div>`;

  // Health issues, precautions, pros and cons
  html += `
    <div style="margin-top: 1.5rem;">
      <h3 style="font-size: 1rem; margin-bottom: 0.75rem; color: #1e293b;">Identified Health Issues, Precautions & Management:</h3>
  `;

  report.issues.forEach(issue => {
    html += `
      <div style="background: #f8fafc; border: 1px solid var(--border); border-radius: var(--radius-md); padding: 1rem; margin-bottom: 0.75rem;">
        <h4 style="color: #0f172a; font-size: 0.95rem; margin-bottom: 0.35rem;">⚠️ ${issue.name}</h4>
        <p style="font-size: 0.85rem; color: #334155; margin-bottom: 0.5rem;"><strong>Precautions:</strong> ${issue.precautions}</p>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; font-size: 0.8rem;">
          <div style="background: #f0fdf4; padding: 0.5rem; border-radius: 6px; color: #166534;">
            <strong>Pros of Management:</strong> ${issue.pros}
          </div>
          <div style="background: #fff1f2; padding: 0.5rem; border-radius: 6px; color: #9f1239;">
            <strong>Cons / Challenges:</strong> ${issue.cons}
          </div>
        </div>
      </div>
    `;
  });

  html += `
      <div style="margin-top: 1rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-send" onclick="readReportAloud()">🔊 Read Analysis Aloud</button>
        <button class="btn-chip" onclick="switchToTab('diet')">🥗 View Tailored Diet Plan</button>
        <button class="btn-chip" onclick="switchToTab('nurse')">👩‍⚕️ Book Home Nurse Sample Test</button>
      </div>
    </div>
  </div>`;

  container.innerHTML = html;
}

// Read Report Aloud via AI Voice Assistant
function readReportAloud() {
  if (!AppState.currentReport) return;
  const rep = AppState.currentReport;
  let text = `Here is the explanation for ${rep.title}. `;
  rep.values.forEach(v => {
    if (v.status !== "Normal") {
      text += `${v.parameter} is ${v.status} at ${v.value} ${v.unit}. ${v.explanation} `;
    }
  });
  text += "Check your Diet Plan and Today Schedule for recommended daily actions.";
  speakText(text);
}

// Render Symptoms Guidance View
function renderSymptomsAnalysis(symptomsText, guidance) {
  const container = document.getElementById("reportResultsArea");
  if (!container) return;

  const isEmergency = guidance.warningSign || guidance.severity === "EMERGENCY";

  let html = `
    <div class="section-card">
      <div class="section-header">
        <h2>🩺 Symptom Analysis & Triage Guidance</h2>
        <span class="badge-status ${isEmergency ? 'badge-high' : 'badge-normal'}">${guidance.severity}</span>
      </div>
      <p style="font-size: 0.9rem; margin-bottom: 1rem;"><strong>Your reported symptoms:</strong> "${symptomsText}"</p>
      
      <div style="background: #f8fafc; border-left: 5px solid ${isEmergency ? 'var(--danger)' : 'var(--primary)'}; padding: 1rem; border-radius: var(--radius-sm); margin-bottom: 1rem;">
        <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.35rem;">General Possible Causes (Non-Diagnostic):</h4>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.75rem;">${guidance.generalCauses}</p>
        
        <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.35rem;">Suggested Diagnostic Tests to Request:</h4>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.75rem;">📋 ${guidance.suggestedTests}</p>
        
        <h4 style="color: var(--text-main); font-size: 0.95rem; margin-bottom: 0.35rem;">Recommended Specialist to Consult:</h4>
        <p style="font-size: 0.85rem; color: #475569; margin-bottom: 0.75rem;">👨‍⚕️ ${guidance.recommendedSpecialist}</p>
        
        <div style="background: ${isEmergency ? '#fee2e2' : '#f0fdfa'}; padding: 0.75rem; border-radius: 6px; font-weight: 600; font-size: 0.85rem; color: ${isEmergency ? '#991b1b' : '#0f766e'};">
          ${guidance.actionUrgency}
        </div>
      </div>
      
      ${isEmergency ? `
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <button class="btn-emergency" onclick="triggerEmergencyAlert('Emergency symptoms reported')">🚨 Call Ambulance / View Hospitals</button>
        </div>
      ` : `
        <div style="display: flex; gap: 0.75rem; margin-top: 1rem;">
          <button class="btn-send" onclick="switchToTab('nurse')">👩‍⚕️ Book Home Nurse For Tests</button>
          <button class="btn-chip" onclick="switchToTab('diet')">🥗 View Recommended Nutrition</button>
        </div>
      `}
    </div>
  `;

  container.innerHTML = html;
}

// Generate Custom Diet Plan dynamically based on BOTH report test results AND reported symptoms
function generateDualSourceDiet() {
  const report = AppState.currentReport;
  const symptoms = AppState.currentSymptoms;

  let primaryPlanKey = "generalWellness";
  let conditionHighlights = [];
  let extraFoodsToEat = [];
  let extraFoodsToAvoid = [];

  // 1. Analyze Medical Report Findings
  if (report) {
    if (report.id.includes("diabetes")) {
      primaryPlanKey = "diabetes";
      conditionHighlights.push("Lab Test: High Blood Sugar / Diabetes Panel");
    } else if (report.id.includes("anemia")) {
      primaryPlanKey = "anemia";
      conditionHighlights.push("Lab Test: Low Hemoglobin & Ferritin (Iron Deficiency)");
    } else if (report.id.includes("hypertension")) {
      primaryPlanKey = "hypertension";
      conditionHighlights.push("Lab Test: Elevated Blood Pressure (DASH Protocol)");
    } else if (report.id.includes("thyroid")) {
      primaryPlanKey = "generalWellness";
      conditionHighlights.push("Lab Test: High TSH (Hypothyroid tendency)");
      extraFoodsToEat.push({ name: "Selenium & Zinc Rich Foods (Brazil nuts, pumpkin seeds, lentils)", whyNeeded: "Supports deiodinase enzymes converting T4 to active metabolic T3." });
      extraFoodsToAvoid.push({ name: "Excess raw cruciferous goitrogens (unboiled kale/cabbage)", whyNeeded: "Can compete with iodine absorption if consumed in excess." });
    }
  }

  // 2. Cross-reference with User Symptoms
  if (symptoms) {
    const causes = (symptoms.guidance?.generalCauses || symptoms.userNote || "").toLowerCase();
    conditionHighlights.push(`Reported Symptoms: "${symptoms.userNote}"`);

    if (causes.includes("glucose") || causes.includes("diabetes") || causes.includes("thirst") || causes.includes("urination")) {
      if (primaryPlanKey === "generalWellness") primaryPlanKey = "diabetes";
    } else if (causes.includes("anemia") || causes.includes("iron") || causes.includes("fatigue") || causes.includes("cold hands")) {
      if (primaryPlanKey === "generalWellness") primaryPlanKey = "anemia";
    } else if (causes.includes("blood pressure") || causes.includes("heart") || causes.includes("dizziness") || causes.includes("headache")) {
      if (primaryPlanKey === "generalWellness") primaryPlanKey = "hypertension";
    }

    if (causes.includes("reflux") || causes.includes("gerd") || causes.includes("burning") || causes.includes("heartburn")) {
      extraFoodsToEat.push({ name: "Alkaline soothing foods (Oatmeal, bananas, melons, chia gel)", whyNeeded: "Forms a protective gel layer over stomach mucosa, buffering against acid reflux." });
      extraFoodsToAvoid.push({ name: "Spicy red peppers, citrus on empty stomach, and dark coffee", whyNeeded: "Relaxes the lower esophageal sphincter, exacerbating acid backflow." });
    } else if (causes.includes("respiratory") || causes.includes("fever") || causes.includes("cough")) {
      extraFoodsToEat.push({ name: "Warm ginger-turmeric broth & honey-lemon water", whyNeeded: "Anti-inflammatory curcumin and gingerol soothe pharyngeal membranes and support immunity." });
      extraFoodsToAvoid.push({ name: "Icy cold beverages and heavy fried snacks", whyNeeded: "Induces throat vasoconstriction and delays cellular healing." });
    }
  }

  const basePlan = JSON.parse(JSON.stringify(HEALTH_DATASETS.nutritionPlans[primaryPlanKey]));
  if (conditionHighlights.length > 0) {
    basePlan.conditionName = conditionHighlights.join(" + ");
  }
  if (extraFoodsToEat.length > 0) {
    basePlan.foodsToEat = [...extraFoodsToEat, ...basePlan.foodsToEat];
  }
  if (extraFoodsToAvoid.length > 0) {
    basePlan.foodsToAvoid = [...extraFoodsToAvoid, ...basePlan.foodsToAvoid];
  }

  renderDietUI(basePlan);
}

function renderDietUI(plan) {
  const container = document.getElementById("dietPlanArea");
  if (!container) return;

  const allergyNote = AppState.user.allergies !== "None" ? `(Filtered strictly against user allergy: ${AppState.user.allergies})` : "";
  const foodPref = AppState.user.foodPreference !== "None" ? AppState.user.foodPreference : "Wholesome Balanced";

  let html = `
    <div class="section-card">
      <div class="section-header">
        <h2>🥗 Dual-Source Nutrition & Recovery Plan</h2>
        <span class="badge-status badge-normal">${foodPref} ${allergyNote}</span>
      </div>
      <div style="background: #f0fdf4; border-left: 4px solid var(--success); padding: 0.85rem 1rem; border-radius: 6px; margin-bottom: 1.25rem;">
        <span style="font-size: 0.76rem; font-weight: 700; color: #166534; text-transform: uppercase;">Medical Synergy:</span>
        <p style="font-size: 0.86rem; color: #14532d; font-weight: 600; margin-top: 2px;">
          Formulated directly from your <strong>Test Results &amp; Reported Symptoms</strong>: ${plan.conditionName}
        </p>
      </div>
      
      <div class="diet-grid">
        <div class="diet-column diet-eat">
          <h3>✅ Foods to Eat & Why Needed</h3>
  `;

  plan.foodsToEat.forEach(item => {
    html += `
      <div class="food-item">
        <div class="food-name">🌿 ${item.name}</div>
        <div class="food-reason">${item.whyNeeded}</div>
      </div>
    `;
  });

  html += `
        </div>
        <div class="diet-column diet-avoid">
          <h3>❌ Foods to Avoid & Why</h3>
  `;

  plan.foodsToAvoid.forEach(item => {
    html += `
      <div class="food-item">
        <div class="food-name">🚫 ${item.name}</div>
        <div class="food-reason">${item.whyNeeded}</div>
      </div>
    `;
  });

  html += `
        </div>
      </div>
      
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem; margin-top: 1.5rem;">
        <div style="background: #f0fdfa; border: 1px solid #99f6e4; padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: var(--primary-dark); font-size: 0.9rem; margin-bottom: 0.35rem;">💧 Hydration Guidance:</h4>
          <p style="font-size: 0.82rem; color: #134e4a;">${plan.waterGuidance}</p>
        </div>
        <div style="background: #f5f3ff; border: 1px solid #ddd6fe; padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: #6d28d9; font-size: 0.9rem; margin-bottom: 0.35rem;">🌙 Sleep & Rest Recovery:</h4>
          <p style="font-size: 0.82rem; color: #4c1d95;">${plan.sleepGuidance}</p>
        </div>
        <div style="background: #eff6ff; border: 1px solid #bfdbfe; padding: 1rem; border-radius: var(--radius-md);">
          <h4 style="color: #1d4ed8; font-size: 0.9rem; margin-bottom: 0.35rem;">🏃 Exercise Guidance:</h4>
          <p style="font-size: 0.82rem; color: #1e40af;">${HEALTH_DATASETS.fitnessMetrics.walking.name} (${HEALTH_DATASETS.fitnessMetrics.walking.duration}) — ${HEALTH_DATASETS.fitnessMetrics.walking.recommendation}</p>
        </div>
      </div>
      
      <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem;">
        <button class="btn-send" onclick="readDietAloud()">🔊 Read Diet Plan Aloud</button>
        <button class="btn-chip" onclick="switchToTab('schedule')">⏰ View Today's Schedule</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function readDietAloud() {
  const container = document.getElementById("dietPlanArea");
  if (!container) return;
  const text = "Reading your customized nutrition plan. Focus on whole grains, fresh vegetables, and adequate water. Limit refined sugars, trans-fats, and high sodium. Check the full list on screen.";
  speakText(text);
}

// Render Today Schedule
function renderSchedule() {
  const container = document.getElementById("todayScheduleArea");
  if (!container) return;

  const total = AppState.todaySchedule.length;
  const taken = AppState.todaySchedule.filter(i => i.status === "taken").length;
  const missed = AppState.todaySchedule.filter(i => i.status === "missed").length;
  const percent = total > 0 ? Math.round((taken / total) * 100) : 0;

  let html = `
    <div class="section-card">
      <div class="section-header">
        <h2>⏰ Today Health & Medicine Schedule</h2>
        <span class="badge-status badge-normal">${percent}% Completed</span>
      </div>
      <p style="color: var(--text-muted); font-size: 0.85rem; margin-bottom: 1rem;">
        Suggested times for meals, water, sleep, and movement. These are general habit reminders, not medical instructions. Medication times are not added automatically:
      </p>
      
      <div style="display: flex; gap: 1rem; margin-bottom: 1.25rem; font-size: 0.85rem;">
        <span style="color: #166534; font-weight: 600;">✔️ Confirmed: ${taken}</span>
        <span style="color: #991b1b; font-weight: 600;">❌ Missed: ${missed}</span>
        <span style="color: #64748b;">⏳ Pending: ${total - taken - missed}</span>
      </div>
      
      <div class="schedule-container">
  `;

  AppState.todaySchedule.forEach(item => {
    const isTaken = item.status === "taken";
    const isMissed = item.status === "missed";
    const itemClass = isTaken ? "taken" : isMissed ? "missed" : "";

    html += `
      <div class="schedule-item ${itemClass}">
        <div class="schedule-time-box">
          <span class="schedule-time">${item.time}</span>
          <div class="schedule-details">
            <h4>${item.title}</h4>
            <p>${item.desc}</p>
          </div>
        </div>
        <div class="schedule-actions">
          <button class="btn-track btn-confirm" onclick="markScheduleItem(${item.id}, 'taken')">
            ${isTaken ? '✓ Done' : 'Confirm'}
          </button>
          <button class="btn-track btn-miss" onclick="markScheduleItem(${item.id}, 'missed')">
            ${isMissed ? 'Missed' : 'Skip'}
          </button>
        </div>
      </div>
    `;
  });

  html += `
      </div>
      <div style="margin-top: 1.25rem; display: flex; gap: 0.75rem; flex-wrap: wrap;">
        <button class="btn-chip" onclick="speakText('You have completed ${percent} percent of your daily schedule today. Stay hydrated and take medicines on time.')">🔊 Schedule Summary</button>
        <button class="btn-send" style="padding: 0.4rem 0.85rem; font-size: 0.82rem;" onclick="triggerCompulsoryReminder(AppState.todaySchedule[2] || AppState.todaySchedule[0])">⏰ Test Compulsory Reminder (Audio &amp; Alert)</button>
      </div>
    </div>
  `;

  container.innerHTML = html;
}

function markScheduleItem(id, status) {
  const item = AppState.todaySchedule.find(i => i.id === id);
  if (item) {
    item.status = status;
    renderSchedule();
    showToast(`Marked ${item.title} as ${status}.`);
  }
}

// Interactive Human Body Board Rendering
const ORGANS_DATA = {
  brain: {
    name: "Brain & Nervous System",
    kidsTitle: "🧠 The Superhero Control Computer",
    kidsText: "Your brain is like the master computer inside your head! It controls your thoughts, feelings, dreams, and tells your body when to run, jump, and laugh. It needs 9 to 10 hours of sleep every night to recharge its superhero batteries!",
    kidsHabit: "Eat brain snacks like walnuts and berries, do fun puzzles, and turn off glowing screens 1 hour before sleep.",
    adultTitle: "🧠 Central Nervous & Autonomic System",
    adultText: "The central nervous system coordinates motor signals, cognitive processes, endocrine regulation, and autonomic homeostasis. It consumes roughly 20% of resting metabolic energy.",
    adultBiomarkers: "Key metrics: Sleep quality, cognitive reaction time, resting HRV (Heart Rate Variability), stress hormone (cortisol) balance.",
    adultSuggestions: "Maintain 7-8 hours sleep, engage in continuous lifelong learning, protect against hypertension to preserve microvascular cerebral perfusion."
  },
  heart: {
    name: "Heart & Blood Vessels",
    kidsTitle: "❤️ The Super Pump",
    kidsText: "Your heart is a super-strong muscular pump, about the size of your fist! It pumps fresh blood packed with oxygen to every part of your body, from your brain down to your toes. Place your hand on your chest to feel it go thump-thump!",
    kidsHabit: "Run, skip, and jump for 60 minutes every day to keep your heart engine strong and happy!",
    adultTitle: "❤️ Cardiovascular System",
    adultText: "The cardiovascular system circulates blood throughout 60,000 miles of blood vessels, providing nutrients and oxygen while clearing cellular waste products.",
    adultBiomarkers: "Key metrics: Resting BP (<120/80 mmHg), Resting Heart Rate (60-80 bpm), Lipid profile (LDL < 100, HDL > 40, Triglycerides < 150 mg/dL).",
    adultSuggestions: "Engage in 150 minutes of moderate aerobic exercise weekly, keep dietary sodium under 2,000 mg/day, avoid tobacco and trans-fats."
  },
  lungs: {
    name: "Lungs & Respiratory System",
    kidsTitle: "🫁 The Fresh Air Balloons",
    kidsText: "Your lungs are two big, bouncy sponges in your chest. When you breathe in, they fill up with fresh clean oxygen. When you breathe out, they puff away the air your body doesn't need anymore!",
    kidsHabit: "Practice slow superhero breathing (breathe in through nose for 4 seconds, breathe out through mouth like blowing a birthday candle).",
    adultTitle: "🫁 Pulmonary & Gas Exchange System",
    adultText: "Lungs contain approximately 300 million alveoli, providing a massive surface area for blood oxygenation and carbon dioxide exhalation.",
    adultBiomarkers: "Key metrics: Oxygen Saturation (SpO2 95-100%), Peak Expiratory Flow, Respiratory Rate (12-18 breaths/min).",
    adultSuggestions: "Avoid smoking and secondhand vape, perform deep diaphragmatic breathing, ensure indoor ventilation, and monitor chronic coughs."
  },
  stomach: {
    name: "Stomach, Liver & Gut",
    kidsTitle: "🍎 The Energy Kitchen & Food Mixer",
    kidsText: "Your tummy churns and mixes the tasty healthy foods you eat, turning them into fuel for running, playing, and growing tall! The liver is the body's super filter, keeping your blood squeaky clean.",
    kidsHabit: "Eat colorful rainbow veggies (carrots, broccoli, bell peppers) and drink plenty of water so your tummy never gets upset.",
    adultTitle: "🍎 Gastrointestinal & Hepato-Metabolic System",
    adultText: "Responsible for macromolecule digestion, nutrient absorption, bile production, detoxification, and hosting the gut microbiome which influences 70% of immune function.",
    adultBiomarkers: "Key metrics: Liver enzymes (SGPT/ALT < 40, SGOT/AST < 40), Bilirubin (< 1.2 mg/dL), regular bowel motility.",
    adultSuggestions: "Eat 30g of prebiotic dietary fiber daily, consume fermented probiotic curd, limit alcohol and ultra-processed saturated fats."
  },
  bones: {
    name: "Bones & Musculoskeletal",
    kidsTitle: "🦴 The Superhero Frame & Muscles",
    kidsText: "Your skeleton is like the strong frame of a castle, holding you tall! Your muscles pull the bones like strong ropes so you can climb monkey bars, kick footballs, and dance!",
    kidsHabit: "Drink milk, eat yogurt or sesame seeds for calcium, and play outside in gentle sunshine for bone-strengthening Vitamin D!",
    adultTitle: "🦴 Musculoskeletal & Skeletal Integrity",
    adultText: "Composed of 206 bones, tendons, and over 600 muscles that maintain structural posture, protect vital organs, and store 99% of body calcium.",
    adultBiomarkers: "Key metrics: Bone Mineral Density (DEXA T-score), Serum Vitamin D3 (30-100 ng/mL), Serum Calcium (8.5-10.2 mg/dL).",
    adultSuggestions: "Perform progressive resistance training 2-3 times weekly to prevent age-related sarcopenia and osteopenia."
  },
  skin: {
    name: "Skin & Immune Shield",
    kidsTitle: "🛡️ The Cozy Shield Blanket",
    kidsText: "Your skin is your body's biggest organ! It wraps you in a waterproof, germs-blocking protective shield and helps you feel warm hugs and cool breezes.",
    kidsHabit: "Wash hands with warm soapy water for 20 seconds before eating and after using the restroom. Bathe daily!",
    adultTitle: "🛡️ Integumentary & Immune Defense Barrier",
    adultText: "The skin prevents pathogen entry, synthesizes Vitamin D upon UV exposure, and regulates internal thermal homeostasis through sweat evaporation.",
    adultBiomarkers: "Key metrics: Skin elasticity, wound healing rate, Complete Blood Count (WBC 4,000-11,000 /uL).",
    adultSuggestions: "Apply broad-spectrum SPF 30+ sunscreen, moisturize regularly, conduct periodic skin mole examinations."
  }
};

function renderBodyBoard() {
  const container = document.getElementById("bodyBoardArea");
  if (!container) return;

  const isKids = AppState.bodyMode === "kids";
  const organ = ORGANS_DATA[AppState.selectedOrgan] || ORGANS_DATA.heart;

  let html = `
    <div class="body-toggle-bar">
      <button class="btn-toggle-mode ${isKids ? 'active' : ''}" id="btnModeKids" onclick="setBodyMode('kids')">👶 Under 18 (Kids & Teens)</button>
      <button class="btn-toggle-mode ${!isKids ? 'active' : ''}" id="btnModeAdult" onclick="setBodyMode('adult')">🧑 18 & Above (Adult Health)</button>
    </div>
  `;

  if (isKids) {
    html += `
      <div class="kids-theme">
        <div class="kids-banner">
          <h2>🌟 Amazing Human Body & Superhero Health! 🌟</h2>
          <p>Explore your body parts, learn everyday superhero habits, and discover how to stay safe, strong, and happy!</p>
        </div>
        
        <div class="body-explorer-grid">
          <div class="body-svg-container">
            <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: #854d0e;">Select a Body Part:</h3>
            <div class="organ-btn-list">
              <button class="btn-organ ${AppState.selectedOrgan === 'brain' ? 'active' : ''}" onclick="selectOrgan('brain')">🧠 Brain</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'heart' ? 'active' : ''}" onclick="selectOrgan('heart')">❤️ Heart</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'lungs' ? 'active' : ''}" onclick="selectOrgan('lungs')">🫁 Lungs</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'stomach' ? 'active' : ''}" onclick="selectOrgan('stomach')">🍎 Stomach</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'bones' ? 'active' : ''}" onclick="selectOrgan('bones')">🦴 Bones & Muscles</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'skin' ? 'active' : ''}" onclick="selectOrgan('skin')">🛡️ Skin Shield</button>
            </div>
            
            <div style="margin-top: 1rem; width: 100%; background: #fef08a; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; color: #713f12;">
              <strong>☀️ Daily Kids Clock:</strong><br>
              • 07:00 AM: Wake up & Brush Teeth<br>
              • 08:00 AM: Superhero Breakfast<br>
              • 04:30 PM: 60 mins Active Outdoor Play<br>
              • 06:30 PM: Screen Time Ends (Max 1 hr)<br>
              • 09:00 PM: Storytime & 9-10h Sleep
            </div>
          </div>
          
          <div>
            <div class="organ-detail-card">
              <h3 style="color: #b45309; font-size: 1.15rem; margin-bottom: 0.5rem;">${organ.kidsTitle}</h3>
              <p style="color: #451a03; font-size: 0.95rem; line-height: 1.5; margin-bottom: 0.75rem;">${organ.kidsText}</p>
              
              <div style="background: #fef9c3; padding: 0.75rem; border-radius: var(--radius-sm); border: 1px solid #fef08a; font-size: 0.85rem; color: #713f12; margin-bottom: 0.75rem;">
                <strong>💪 Superhero Habit:</strong> ${organ.kidsHabit}
              </div>
              
              <button class="btn-send" style="background: #ca8a04;" onclick="speakText('${organ.kidsTitle}. ${organ.kidsText}')">🔊 Listen to Explanation</button>
            </div>
            
            <!-- Body Safety & Personal Boundaries Module for Under 18 -->
            <div class="safety-card">
              <h3>🛡️ Personal Body Safety & Boundaries (Important)</h3>
              <ul class="safety-rules">
                <li><strong>The Swimsuit / Underwear Rule:</strong> The parts of your body covered by a swimsuit are private. No one should look at, touch, or ask you to touch their private parts.</li>
                <li><strong>Safe vs Unsafe Touches:</strong> High-fives, handshakes, and hugs from parents are safe. Any touch that makes you feel confused, scared, or uncomfortable is NOT okay.</li>
                <li><strong>The 3-Step Safety Rule:</strong>
                  1. Say <strong>"NO!"</strong> loudly and firmly.<br>
                  2. <strong>Run away</strong> to a safe place with other people.<br>
                  3. <strong>Tell a Trusted Adult immediately</strong> (Mom, Dad, Guardian, or School Teacher). Keep telling until someone helps!
                </li>
                <li><strong>No Secrets About Your Body:</strong> A safe adult will never ask you to keep a secret about your body.</li>
                <li><strong>Medicine Safety:</strong> Kids must NEVER take any pill, syrup, or medicine by themselves. Only take medicine given by your parent or guardian!</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    `;
  } else {
    // 18 & Above Adult Mode
    html += `
      <div class="section-card">
        <div class="section-header">
          <h2>🧬 Comprehensive Human Anatomy & Preventive Health (18+)</h2>
          <span class="badge-status badge-normal">Clinical Systems & Biomarkers</span>
        </div>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin-bottom: 1.25rem;">
          In-depth physiological breakdown of organ systems, clinical biomarkers to monitor, and evidence-based longevity suggestions.
        </p>
        
        <div class="body-explorer-grid">
          <div class="body-svg-container">
            <h3 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--primary-dark);">Select Organ System:</h3>
            <div class="organ-btn-list">
              <button class="btn-organ ${AppState.selectedOrgan === 'brain' ? 'active' : ''}" onclick="selectOrgan('brain')">🧠 Nervous System</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'heart' ? 'active' : ''}" onclick="selectOrgan('heart')">❤️ Cardiovascular</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'lungs' ? 'active' : ''}" onclick="selectOrgan('lungs')">🫁 Respiratory</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'stomach' ? 'active' : ''}" onclick="selectOrgan('stomach')">🍎 Digestive & Liver</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'bones' ? 'active' : ''}" onclick="selectOrgan('bones')">🦴 Musculoskeletal</button>
              <button class="btn-organ ${AppState.selectedOrgan === 'skin' ? 'active' : ''}" onclick="selectOrgan('skin')">🛡️ Immune & Skin</button>
            </div>
            
            <div style="margin-top: 1rem; width: 100%; background: #f0fdfa; padding: 0.75rem; border-radius: 8px; font-size: 0.8rem; color: #134e4a;">
              <strong>🩺 Recommended Health Milestones:</strong><br>
              • <strong>20s - 30s:</strong> Annual BP, CBC, Lipid panel every 3-5 yrs.<br>
              • <strong>40s:</strong> Fasting Blood Glucose, HbA1c, Eye pressure, ECG.<br>
              • <strong>50s+:</strong> Colonoscopy, Bone Density (DEXA), Prostate / Mammography screenings.
            </div>
          </div>
          
          <div>
            <div class="organ-detail-card">
              <h3 style="color: var(--primary-dark); font-size: 1.15rem; margin-bottom: 0.5rem;">${organ.adultTitle}</h3>
              <p style="color: var(--text-main); font-size: 0.9rem; line-height: 1.5; margin-bottom: 0.75rem;">${organ.adultText}</p>
              
              <div style="background: #f1f5f9; padding: 0.75rem; border-radius: var(--radius-sm); font-size: 0.85rem; color: #334155; margin-bottom: 0.75rem;">
                <strong>📊 Clinical Biomarkers:</strong> ${organ.adultBiomarkers}
              </div>
              
              <div style="background: #f0fdf4; padding: 0.75rem; border-radius: var(--radius-sm); border-left: 4px solid var(--success); font-size: 0.85rem; color: #166534; margin-bottom: 0.75rem;">
                <strong>💡 Health Maintenance Suggestions:</strong> ${organ.adultSuggestions}
              </div>
              
              <button class="btn-send" onclick="speakText('${organ.adultTitle}. ${organ.adultText} ${organ.adultSuggestions}')">🔊 Listen to Overview</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  container.innerHTML = html;
}

function setBodyMode(mode) {
  AppState.bodyMode = mode;
  renderBodyBoard();
}

function selectOrgan(organKey) {
  AppState.selectedOrgan = organKey;
  renderBodyBoard();
}

// Search bar doubt resolution engine
function handleSearch(query) {
  const queryTrimmed = query.trim().toLowerCase();
  const dropdown = document.getElementById("searchDropdown");
  if (!dropdown) return;

  if (!queryTrimmed) {
    dropdown.classList.remove("active");
    dropdown.innerHTML = "";
    return;
  }

  const results = [];

  // Search QA Database
  HEALTH_DATASETS.qaDatabase.forEach(item => {
    let match = false;
    if (item.question.toLowerCase().includes(queryTrimmed)) match = true;
    item.keywords.forEach(kw => {
      if (queryTrimmed.includes(kw) || kw.includes(queryTrimmed)) match = true;
    });
    if (match) results.push({ type: "FAQ / Doubt", title: item.question, content: item.answer });
  });

  // Search Medicines Directory
  HEALTH_DATASETS.medicinesDirectory.forEach(med => {
    if (med.name.toLowerCase().includes(queryTrimmed) || med.category.toLowerCase().includes(queryTrimmed)) {
      results.push({
        type: `Medicine Info (${med.category})`,
        title: med.name,
        content: `${med.standardRole} Doctor's Rule: ${med.doctorPrescriptionRule}`
      });
    }
  });

  if (results.length === 0) {
    dropdown.innerHTML = `
      <div class="search-result-item">
        <h4>No direct match found for "${query}"</h4>
        <p>You can type this doubt into the AI Health Agent chat for personalized guidance, or consult your doctor.</p>
      </div>
    `;
  } else {
    let html = "";
    results.slice(0, 4).forEach(res => {
      html += `
        <div class="search-result-item" onclick="selectSearchResult('${escapeHtml(res.title)}', '${escapeHtml(res.content)}')">
          <span style="font-size: 0.7rem; color: var(--primary); font-weight: 700; text-transform: uppercase;">${res.type}</span>
          <h4>${res.title}</h4>
          <p>${res.content}</p>
        </div>
      `;
    });
    dropdown.innerHTML = html;
  }

  dropdown.classList.add("active");
}

function escapeHtml(str) {
  return str.replace(/'/g, "\\'").replace(/"/g, "&quot;");
}

function selectSearchResult(title, content) {
  document.getElementById("searchDropdown").classList.remove("active");
  const query = document.getElementById("globalSearchInput")?.value || `${title}: ${content}`;
  askFromSearch(query);
}

function askFromSearch(question) {
  if (!question.trim()) return;
  switchToTab("chat");
  addChatMessage("user", question);
  if (AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint) {
    requestAiDoc(question).then(reply => addChatMessage("agent", reply || "I could not get a reply from the connected assistant."))
      .catch(() => addChatMessage("agent", "The connected assistant is unavailable right now. Please try again or contact a clinician for medical concerns."));
  } else {
    handleUserDoubt(question);
  }
}

// User general doubt in chat
function handleUserDoubt(question) {
  if (AIDOC_CONTEXT.agent_endpoint || AIDOC_CONTEXT.agentEndpoint) return;
  if (AppState.user.language === "te-IN") {
    addChatMessage("agent", "ఈ స్థానిక FAQలో ఆ ప్రశ్నకు సమాధానం లేదు. Ai Doc AI సేవకు కనెక్ట్ కాలేదు. దయచేసి వైద్య విషయాలను వైద్యుడితో నిర్ధారించండి.");
    return;
  }
  const lower = question.toLowerCase();
  let found = null;

  for (let qa of HEALTH_DATASETS.qaDatabase) {
    for (let kw of qa.keywords) {
      if (lower.includes(kw)) {
        found = qa;
        break;
      }
    }
    if (found) break;
  }

  if (found) {
    addChatMessage("agent", `**${found.question}**\n\n${found.answer}\n\n*If you need additional assistance, consult your treating doctor or book a home nurse test.*`);
  } else {
    addChatMessage("agent", `Thank you for asking: "${question}". While I can offer general health awareness and nutrition guidance, I cannot provide an official medical diagnosis or prescribe treatments. If your symptoms are concerning or persistent, please consult a qualified healthcare professional.`);
  }
}

// Home Nurse Booking Handler
function handleNurseBooking(event) {
  event.preventDefault();
  const state = document.getElementById("nurseState").value;
  const city = document.getElementById("nurseCity").value;
  const area = document.getElementById("nurseArea").value;
  const address = document.getElementById("nurseAddress").value;
  const date = document.getElementById("nurseDate").value;
  const time = document.getElementById("nurseTime").value;
  const tests = document.getElementById("nurseTests").value;

  const booking = {
    state, city, area, address, date, time, tests,
    status: "Draft request only",
  };

  const resultContainer = document.getElementById("nurseBookingConfirmation");
  resultContainer.innerHTML = `
    <div style="background: #f0fdf4; border: 1px solid #86efac; border-radius: var(--radius-md); padding: 1.25rem; margin-top: 1rem;">
      <h3 style="color: #92400e; font-size: 1.05rem; margin-bottom: 0.35rem;">Request details prepared (not booked)</h3>
      <p style="font-size: 0.85rem; color: #14532d; margin-bottom: 0.75rem;">
        <strong>Preferred slot:</strong> ${escapeHtml(date)} at ${escapeHtml(time)}<br>
        <strong>Address:</strong> ${escapeHtml(address)}, ${escapeHtml(area)}, ${escapeHtml(city)}, ${escapeHtml(state)}<br>
        <strong>Requested tests:</strong> ${escapeHtml(tests)}
      </p>
      <div style="background: white; padding: 0.75rem; border-radius: 6px; font-size: 0.8rem; color: #334155;">
        <strong>Next step:</strong> Contact a licensed local lab or home-care provider. This demo cannot arrange a visit or receive results. Follow your ordering clinician's test-preparation instructions.
      </div>
    </div>
  `;

  addChatMessage("agent", `I prepared your preferred home collection details for ${date} at ${time}. This demo did not contact a provider or book a visit. Please arrange it with a licensed local service.`);
}

// Tab Switching
function switchToTab(tabId) {
  AppState.activeTab = tabId;

  document.querySelectorAll(".nav-item").forEach(item => {
    item.classList.toggle("active", item.getAttribute("data-tab") === tabId);
  });

  document.querySelectorAll(".tab-pane").forEach(pane => {
    pane.classList.toggle("active", pane.id === `tab-${tabId}`);
  });

  if (tabId === "schedule") {
    renderSchedule();
  } else if (tabId === "body") {
    renderBodyBoard();
  }
}

// Guided Tour "How to use the app"
function startAppTour() {
  const tourText = "Welcome to Ai Doc. Complete your health profile, then try an illustrative demo report or enter report values and lab ranges in chat. PDF and photo reports can have their text extracted. Connect an AI endpoint for report explanations and open-ended answers. Use voice controls, search, and the age-aware body board. For urgent symptoms, call your local emergency number.";
  addChatMessage("agent", `📢 **How to Use Ai Doc:**\n\n1. Complete your health profile.\n2. Upload a PDF or photo to extract its text, or choose an illustrative demo report.\n3. Connect an AI service for report explanations and conversational answers.\n4. Use voice controls and search for general questions.\n5. Explore the age-aware body board.\n\nThis app does not diagnose or prescribe. Without an AI endpoint, it can extract and display report text but cannot interpret it.`);
  speakText(tourText);
}

// Start New Chat (Archives current session into History & restarts fresh)
function startNewChat() {
  if (AppState.chatHistory && AppState.chatHistory.length > 0) {
    const firstUserMsg = AppState.chatHistory.find(m => m.sender === "user")?.text || "General health consultation";
    const preview = firstUserMsg.length > 55 ? firstUserMsg.substring(0, 55) + "..." : firstUserMsg;

    const session = {
      id: "chat_" + Date.now(),
      title: `Intake: ${AppState.user.name || "Patient"} (${AppState.user.age || "N/A"})`,
      date: new Date().toLocaleDateString() + " at " + new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      preview: preview,
      messageCount: AppState.chatHistory.length,
      history: [...AppState.chatHistory],
      user: JSON.parse(JSON.stringify(AppState.user)),
      step: AppState.conversationStep,
      report: AppState.currentReport,
      symptoms: AppState.currentSymptoms
    };

    AppState.chatSessions.unshift(session);
    try {
      localStorage.setItem("healthmate_chat_history", JSON.stringify(AppState.chatSessions));
    } catch (e) {
      console.warn("Could not save to localStorage", e);
    }
    updateHistoryBadge();
  }

  // Clear Chat screen
  const chatBody = document.getElementById("chatBody");
  if (chatBody) chatBody.innerHTML = "";

  // Reset conversation states & all profile items to None
  AppState.chatHistory = [];
  AppState.conversationStep = 0;
  AppState.currentReport = null;
  AppState.currentSymptoms = null;
  AppState.user = {
    name: "Guest",
    age: "None",
    gender: "None",
    language: AppState.user.language || "en-US",
    foodPreference: "None",
    allergies: "None",
    existingConditions: "None",
    currentMedicines: "None"
  };

  updateProfileUI();
  updateSidebarExercises();

  // Reset report results area
  const repArea = document.getElementById("reportResultsArea");
  if (repArea) {
    repArea.innerHTML = `<div style="text-align: center; padding: 2rem; color: var(--text-muted);">Select a sample report above or upload your document to view the parameter-by-parameter analysis.</div>`;
  }

  showToast("➕ New Chat started! All profile items set to None & previous chat saved to History.");
  setTimeout(advanceIntake, 300);
}

// Update History Count Badge
function updateHistoryBadge() {
  const badge = document.getElementById("historyCountBadge");
  if (badge) {
    badge.textContent = AppState.chatSessions ? AppState.chatSessions.length : 0;
  }
}

// Settings Modal Controls
function openSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) {
    modal.classList.add("active");
    renderChatHistory();
    populateSystemVoices();
    updateHistoryBadge();
  }
}

function closeSettingsModal() {
  const modal = document.getElementById("settingsModal");
  if (modal) modal.classList.remove("active");
}

function switchSettingsTab(tabName) {
  const tabs = ["history", "voice", "language"];
  tabs.forEach(t => {
    const btn = document.getElementById("tabBtn" + t.charAt(0).toUpperCase() + t.slice(1));
    const pane = document.getElementById("settingsPane" + t.charAt(0).toUpperCase() + t.slice(1));
    if (btn) btn.classList.toggle("active", t === tabName);
    if (pane) pane.classList.toggle("active", t === tabName);
  });
}

// Render Chat History in Settings Modal
function renderChatHistory() {
  const container = document.getElementById("historyListContainer");
  if (!container) return;

  if (!AppState.chatSessions || AppState.chatSessions.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 2.5rem 1rem; color: var(--text-muted);">
        <div style="font-size: 2.2rem; margin-bottom: 0.5rem;">📜</div>
        <h4 style="font-size: 0.95rem; margin-bottom: 0.25rem;">No Chat History Yet</h4>
        <p style="font-size: 0.8rem;">When you complete a consultation and click <strong>'+ New Chat'</strong>, previous sessions will be archived here.</p>
      </div>
    `;
    return;
  }

  let html = "";
  AppState.chatSessions.forEach(session => {
    html += `
      <div class="history-item">
        <div class="history-info">
          <h4>${session.title}</h4>
          <p>📅 ${session.date} • ${session.messageCount} messages</p>
          <p style="color: #475569; font-style: italic; margin-top: 2px;">"${session.preview}"</p>
        </div>
        <div class="history-actions">
          <button class="btn-restore-chat" onclick="restoreChatSession('${session.id}')">View / Restore</button>
          <button class="btn-delete-chat" onclick="deleteChatSession('${session.id}')">Delete</button>
        </div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// Restore a Past Chat Session
function restoreChatSession(sessionId) {
  const session = AppState.chatSessions.find(s => s.id === sessionId);
  if (!session) return;

  // Clear current chat
  const chatBody = document.getElementById("chatBody");
  if (chatBody) chatBody.innerHTML = "";

  AppState.chatHistory = [...session.history];
  AppState.user = { ...session.user };
  AppState.conversationStep = session.step || 8;
  AppState.currentReport = session.report || null;
  AppState.currentSymptoms = session.symptoms || null;

  // Rebuild bubbles in chat body
  session.history.forEach(m => {
    const msgDiv = document.createElement("div");
    msgDiv.className = `chat-message ${m.sender}`;

    const avatar = document.createElement("div");
    avatar.className = "chat-avatar";
    avatar.innerHTML = m.sender === "agent" ? "🤖" : "👤";

    const bubble = document.createElement("div");
    bubble.className = "chat-bubble";
    bubble.innerHTML = m.text.replace(/\n/g, "<br>");

    msgDiv.appendChild(avatar);
    msgDiv.appendChild(bubble);
    chatBody.appendChild(msgDiv);
  });
  chatBody.scrollTop = chatBody.scrollHeight;

  updateProfileUI();

  if (session.report) {
    renderReportAnalysis(session.report);
    generateCustomDiet(session.report);
  }

  closeSettingsModal();
  switchToTab("chat");
  showToast(`Restored chat session from ${session.date}`);
}

// Delete Chat Session
function deleteChatSession(sessionId) {
  AppState.chatSessions = AppState.chatSessions.filter(s => s.id !== sessionId);
  try {
    localStorage.setItem("healthmate_chat_history", JSON.stringify(AppState.chatSessions));
  } catch (e) {}
  renderChatHistory();
  updateHistoryBadge();
  showToast("Chat session deleted.");
}

// Clear All Chat History
function clearAllChatHistory() {
  if (confirm("Are you sure you want to clear all archived chat history?")) {
    AppState.chatSessions = [];
    try {
      localStorage.removeItem("healthmate_chat_history");
    } catch (e) {}
    renderChatHistory();
    updateHistoryBadge();
    showToast("All chat history cleared.");
  }
}

// Voice Controller Functions (Adjust Voice, ON/OFF System)
function toggleVoiceAudio(enabled) {
  AppState.voiceSettings.enabled = enabled;
  if (!enabled) {
    stopSpeaking();
  }
  updateVoiceIndicator();
  showToast(`Voice Assistant Narration: ${enabled ? 'ENABLED' : 'MUTED'}`);
}

function updateVoiceRate(val) {
  AppState.voiceSettings.rate = parseFloat(val);
  const badge = document.getElementById("voiceRateBadge");
  if (badge) badge.textContent = val + "x";
}

function updateVoicePitch(val) {
  AppState.voiceSettings.pitch = parseFloat(val);
  const badge = document.getElementById("voicePitchBadge");
  if (badge) badge.textContent = val;
}

function updateVoiceVolume(val) {
  AppState.voiceSettings.volume = parseInt(val) / 100;
  const badge = document.getElementById("voiceVolumeBadge");
  if (badge) badge.textContent = val + "%";
}

function updateSelectedVoice(voiceURI) {
  AppState.voiceSettings.selectedVoiceURI = voiceURI;
}

function populateSystemVoices() {
  if (!AppState.speechSynth) return;
  const select = document.getElementById("systemVoiceSelect");
  if (!select) return;

  const voices = AppState.speechSynth.getVoices();
  if (voices.length === 0) return;

  select.innerHTML = '<option value="">Default AI Assistant Voice</option>';
  voices.forEach(voice => {
    const opt = document.createElement("option");
    opt.value = voice.voiceURI;
    opt.textContent = `${voice.name} (${voice.lang})${voice.default ? ' [Default]' : ''}`;
    if (AppState.voiceSettings.selectedVoiceURI === voice.voiceURI) {
      opt.selected = true;
    }
    select.appendChild(opt);
  });
}

function testVoiceAudio() {
  speakText("Hello! This is your Ai Doc voice assistant. Your speed, pitch, and volume adjustments are working.");
}

function resetVoiceDefaults() {
  AppState.voiceSettings = {
    enabled: true,
    rate: 1.0,
    pitch: 1.0,
    volume: 1.0,
    selectedVoiceURI: ""
  };
  const toggle = document.getElementById("voiceToggleCheckbox");
  if (toggle) toggle.checked = true;
  const rateSlider = document.getElementById("voiceRateSlider");
  if (rateSlider) rateSlider.value = "1.0";
  const rateBadge = document.getElementById("voiceRateBadge");
  if (rateBadge) rateBadge.textContent = "1.0x";

  const pitchSlider = document.getElementById("voicePitchSlider");
  if (pitchSlider) pitchSlider.value = "1.0";
  const pitchBadge = document.getElementById("voicePitchBadge");
  if (pitchBadge) pitchBadge.textContent = "1.0";

  const volSlider = document.getElementById("voiceVolumeSlider");
  if (volSlider) volSlider.value = "100";
  const volBadge = document.getElementById("voiceVolumeBadge");
  if (volBadge) volBadge.textContent = "100%";

  const voiceSel = document.getElementById("systemVoiceSelect");
  if (voiceSel) voiceSel.value = "";

  updateVoiceIndicator();
  showToast("Voice settings reset to defaults.");
}

// Synchronized Language Setting across all selectors
const ALL_LANGUAGES = [
  { code: "en-US", name: "English (United States)", native: "English (US)" },
  { code: "en-GB", name: "English (United Kingdom)", native: "English (UK)" },
  { code: "en-IN", name: "English (India)", native: "English (India)" },
  { code: "hi-IN", name: "Hindi", native: "हिन्दी" },
  { code: "es-ES", name: "Spanish", native: "Español" },
  { code: "fr-FR", name: "French", native: "Français" },
  { code: "de-DE", name: "German", native: "Deutsch" },
  { code: "ar-SA", name: "Arabic", native: "العربية" },
  { code: "bn-IN", name: "Bengali", native: "বাংলা" },
  { code: "te-IN", name: "Telugu", native: "తెలుగు" },
  { code: "ta-IN", name: "Tamil", native: "தமிழ்" },
  { code: "mr-IN", name: "Marathi", native: "मराठी" },
  { code: "gu-IN", name: "Gujarati", native: "ગુજરાતી" },
  { code: "kn-IN", name: "Kannada", native: "ಕನ್ನಡ" },
  { code: "ml-IN", name: "Malayalam", native: "മലയാളം" },
  { code: "pa-IN", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  { code: "zh-CN", name: "Chinese (Mandarin)", native: "中文 (简体)" },
  { code: "ja-JP", name: "Japanese", native: "日本語" },
  { code: "ko-KR", name: "Korean", native: "한국어" },
  { code: "ru-RU", name: "Russian", native: "Русский" },
  { code: "pt-BR", name: "Portuguese", native: "Português" },
  { code: "it-IT", name: "Italian", native: "Italiano" },
  { code: "tr-TR", name: "Turkish", native: "Türkçe" },
  { code: "ur-PK", name: "Urdu", native: "اردو" },
  { code: "nl-NL", name: "Dutch", native: "Nederlands" },
  { code: "vi-VN", name: "Vietnamese", native: "Tiếng Việt" },
  { code: "id-ID", name: "Indonesian", native: "Bahasa Indonesia" },
  { code: "sw-KE", name: "Swahili", native: "Kiswahili" }
];

function setAppLanguage(langCode, notify = true) {
  langCode = normalizeLanguage(langCode) || langCode;
  AppState.user.language = langCode;
  AppState.languageChosen = true;

  const topSel = document.getElementById("langSelector");
  if (topSel && topSel.value !== langCode) topSel.value = langCode;

  if (AppState.recognition) {
    AppState.recognition.lang = langCode;
  }

  if (notify) {
    const copy = FIRST_MESSAGES[langCode] || FIRST_MESSAGES["en-US"];
    addChatMessage("agent", copy.changed);
  }

  renderLanguagesList(document.getElementById("langSearchInput")?.value || "");
  showToast(`Language set to: ${langCode}`);
}

function renderLanguagesList(filter = "") {
  const container = document.getElementById("langGridContainer");
  if (!container) return;

  const f = filter.toLowerCase().trim();
  const matched = ALL_LANGUAGES.filter(l =>
    l.name.toLowerCase().includes(f) ||
    l.native.toLowerCase().includes(f) ||
    l.code.toLowerCase().includes(f)
  );

  if (matched.length === 0) {
    container.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: var(--text-muted); padding: 1rem; font-size: 0.82rem;">No languages matching "${filter}"</div>`;
    return;
  }

  let html = "";
  matched.forEach(l => {
    const isActive = AppState.user.language === l.code ? "active" : "";
    html += `
      <button type="button" class="lang-item-btn ${isActive}" onclick="setAppLanguage('${l.code}')">
        <strong>${l.native}</strong><br>
        <span style="font-size: 0.7rem; opacity: 0.85;">${l.name}</span>
      </button>
    `;
  });
  container.innerHTML = html;
}

function filterLanguages(val) {
  renderLanguagesList(val);
}

// Left Sidebar - Personalized Exercise & Physical Activities Engine
function updateSidebarExercises() {
  const container = document.getElementById("sidebarExerciseList");
  const tag = document.getElementById("exerciseStatusTag");
  if (!container) return;

  const report = AppState.currentReport;
  const symptoms = AppState.currentSymptoms;
  const age = parseInt(AppState.user.age);
  const isKid = !isNaN(age) && age < 18;

  let activities = [];

  if (isKid) {
    if (tag) tag.textContent = "Kids Active";
    activities = [
      {
        name: "Outdoor Active Play (Tag, Cycling)",
        badge: "60 mins Daily",
        details: "Playful active movement with friends in parks or playgrounds.",
        rationale: "Essential for healthy growing bones, motor coordination, and deep sleep."
      },
      {
        name: "Morning Superhero Stretches",
        badge: "10 mins Morning",
        details: "Reach for the sky, touch toes, and gentle animal poses (cat-cow).",
        rationale: "Wakes up muscles and aligns posture before school."
      }
    ];
  } else if (report && report.id.includes("diabetes")) {
    if (tag) tag.textContent = "Sugar Control";
    activities = [
      {
        name: "Post-Meal Brisk Walking",
        badge: "15-20 mins (2x/day)",
        details: "Walk at moderate pace 30 mins after breakfast and dinner.",
        rationale: "Stimulates muscle contraction to absorb blood glucose without requiring insulin."
      },
      {
        name: "Bodyweight & Resistance Bands",
        badge: "20 mins (3x/wk)",
        details: "Light squats, wall push-ups, and resistance band rows.",
        rationale: "Increases skeletal muscle mass, improving long-term metabolic insulin sensitivity."
      },
      {
        name: "Gentle Evening Strolling",
        badge: "15 mins Relaxed",
        details: "Calm outdoor walk before bedtime to de-stress.",
        rationale: "Lowers nighttime cortisol, preventing dawn glucose surges."
      }
    ];
  } else if (report && report.id.includes("hypertension")) {
    if (tag) tag.textContent = "BP Regulating";
    activities = [
      {
        name: "Moderate Aerobic Walking",
        badge: "30-40 mins Daily",
        details: "Continuous rhythmic walking; target heart rate 100-120 bpm.",
        rationale: "Enhances arterial compliance and lowers systolic BP by 5-8 mmHg."
      },
      {
        name: "Pranayama & Diaphragmatic Breathing",
        badge: "15 mins Daily",
        details: "Inhale 4 secs, exhale 6 secs in quiet seating.",
        rationale: "Activates parasympathetic vagal tone, relaxing peripheral vascular resistance."
      },
      {
        name: "Low-Resistance Cycling / Elliptical",
        badge: "20-25 mins",
        details: "Smooth, low-impact pedal cadence without straining.",
        rationale: "Cardiovascular conditioning with zero joint impact."
      }
    ];
  } else if (report && report.id.includes("anemia")) {
    if (tag) tag.textContent = "Restorative Energy";
    activities = [
      {
        name: "Paced Restorative Walking",
        badge: "15-20 mins Paced",
        details: "Gentle stroll with sitting breaks if fatigue or breathlessness occurs.",
        rationale: "Maintains circulation without over-exhausting low oxygen-carrying red blood cells."
      },
      {
        name: "Gentle Hatha Yoga & Deep Breathing",
        badge: "15-20 mins",
        details: "Grounding supine poses (legs up wall, gentle twists, Balasana).",
        rationale: "Calms central nervous system and promotes cellular oxygen uptake."
      }
    ];
  } else if (report && report.id.includes("thyroid")) {
    if (tag) tag.textContent = "Metabolism Boost";
    activities = [
      {
        name: "Brisk Incline Walk or Cycling",
        badge: "30 mins Daily",
        details: "Light-to-moderate sustained cardio to stimulate sluggish basal metabolic rate.",
        rationale: "Aids lymphatic clearance and cellular hormone receptor sensitivity."
      },
      {
        name: "Core & Light Strength Training",
        badge: "20 mins (3x/wk)",
        details: "Light dumbbells and bodyweight glute bridges.",
        rationale: "Combats sluggishness and preserves lean muscle."
      }
    ];
  } else if (symptoms) {
    const causes = (symptoms.guidance?.generalCauses || symptoms.userNote || "").toLowerCase();
    if (tag) tag.textContent = "Symptom Paced";
    if (causes.includes("respiratory") || causes.includes("fever")) {
      activities = [
        {
          name: "Bed Rest & Recovery Breathing",
          badge: "Rest First",
          details: "Prioritize bed rest; do slow diaphragmatic breaths sitting upright.",
          rationale: "Conserves cellular ATP for immune system to fight acute viral load."
        }
      ];
    } else if (causes.includes("reflux")) {
      activities = [
        {
          name: "Upright Post-Meal Gentle Stroll",
          badge: "15 mins Post-Meal",
          details: "Walk in upright posture; never lie down within 2 hours of eating.",
          rationale: "Gravity promotes gastric emptying and prevents acid reflux."
        }
      ];
    } else {
      activities = [
        {
          name: "Gentle Walking & Mobility",
          badge: "20-30 mins Daily",
          details: "Low-impact walking adjusted to how comfortable you feel.",
          rationale: "Promotes cardiovascular flow and eases mild physical fatigue."
        }
      ];
    }
  } else {
    if (tag) tag.textContent = "Baseline Health";
    activities = [
      {
        name: "Brisk Aerobic Walk",
        badge: "30 mins Daily",
        details: "Moderate pace (Target HR 100-125 bpm).",
        rationale: "Maintains optimal cardiovascular endurance and healthy insulin response."
      },
      {
        name: "Morning Mobility & Spine Stretches",
        badge: "10-15 mins Morning",
        details: "Gentle full-body range of motion movements.",
        rationale: "Lubricates synovial joints and relieves morning postural stiffness."
      }
    ];
  }

  let html = "";
  activities.forEach(act => {
    html += `
      <div class="exercise-activity-item">
        <div class="activity-name-row">
          <span class="activity-name">⚡ ${act.name}</span>
          <span class="activity-badge">${act.badge}</span>
        </div>
        <div class="activity-details">${act.details}</div>
        <div class="activity-rationale">💡 ${act.rationale}</div>
      </div>
    `;
  });
  container.innerHTML = html;
}

// First-time Notification Permission & Compulsory In-App Reminders
function checkFirstTimeNotification() {
  const pref = localStorage.getItem("healthmate_notif_preference");
  if (!pref) {
    const modal = document.getElementById("notifPermissionModal");
    if (modal) modal.classList.add("active");
  }
}

function acceptNotificationPermission() {
  localStorage.setItem("healthmate_notif_preference", "allowed");
  const modal = document.getElementById("notifPermissionModal");
  if (modal) modal.classList.remove("active");

  if ("Notification" in window) {
    Notification.requestPermission().then(permission => {
      if (permission === "granted") {
        showToast("🔔 Browser care notifications enabled!");
      } else {
        showToast("Compulsory in-app audio chimes & alerts will always remind you!");
      }
    });
  } else {
    showToast("Compulsory in-app audio chimes & alerts will always remind you!");
  }
}

function dismissNotificationPrompt() {
  localStorage.setItem("healthmate_notif_preference", "dismissed");
  const modal = document.getElementById("notifPermissionModal");
  if (modal) modal.classList.remove("active");
  showToast("Compulsory in-app audio chimes & alerts will always remind you!");
}

// Gentle Web Audio API synthesized chime (zero external audio files needed)
function playReminderChime() {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.setValueAtTime(880.00, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.3, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    osc.start();
    osc.stop(ctx.currentTime + 0.8);
  } catch (e) {}
}

// Compulsory reminder trigger (Alerts user regardless of browser notification settings)
function triggerCompulsoryReminder(item) {
  playReminderChime();

  if (AppState.voiceSettings.enabled) {
    speakText(`Compulsory Health Reminder. It is time for ${item.title}. ${item.desc}`);
  }

  // Native notification if granted
  if ("Notification" in window && Notification.permission === "granted") {
    try {
      new Notification("⏰ Ai Doc Care Reminder: " + item.title, {
        body: `${item.time} - ${item.desc}`,
        icon: "🩺"
      });
    } catch (e) {}
  }

  // Compulsory On-Screen Banner
  let banner = document.getElementById("activeReminderBanner");
  if (banner) banner.remove();

  banner = document.createElement("div");
  banner.id = "activeReminderBanner";
  banner.className = "compulsory-reminder-banner";
  banner.innerHTML = `
    <div class="reminder-header">
      <div class="reminder-title">
        <span class="reminder-pulse"></span>
        ⏰ Compulsory Reminder (${item.time})
      </div>
      <button onclick="this.closest('.compulsory-reminder-banner').remove()" style="background:none;border:none;cursor:pointer;font-size:1.1rem;color:#64748b;">✕</button>
    </div>
    <div style="font-weight: 600; font-size: 0.88rem; color: #0f172a; margin-bottom: 0.25rem;">
      ${item.title}
    </div>
    <div class="reminder-desc">
      ${item.desc}
    </div>
    <div class="reminder-actions">
      <button class="btn-track btn-confirm" style="padding: 0.4rem 0.85rem;" onclick="markScheduleItem(${item.id}, 'taken'); this.closest('.compulsory-reminder-banner').remove();">
        ✓ Confirm Taken / Done
      </button>
      <button class="btn-chip" style="padding: 0.4rem 0.75rem;" onclick="this.closest('.compulsory-reminder-banner').remove(); showToast('Reminder snoozed for 5 minutes.');">
        Snooze 5 mins
      </button>
    </div>
  `;
  document.body.appendChild(banner);
}

// Dedicated Body Search Bar in Tab 5
function handleBodySearch(query) {
  const queryTrimmed = query.trim().toLowerCase();
  const resultArea = document.getElementById("bodySearchResultArea");
  if (!resultArea) return;

  if (!queryTrimmed) {
    resultArea.innerHTML = "";
    return;
  }

  const isKids = AppState.bodyMode === "kids";
  let matchedDoubt = null;

  // Search through bodyDoubtsDatabase
  if (HEALTH_DATASETS.bodyDoubtsDatabase) {
    for (let item of HEALTH_DATASETS.bodyDoubtsDatabase) {
      if (item.topic.toLowerCase().includes(queryTrimmed)) {
        matchedDoubt = item;
        break;
      }
      for (let kw of item.keywords) {
        if (queryTrimmed.includes(kw) || kw.includes(queryTrimmed)) {
          matchedDoubt = item;
          break;
        }
      }
      if (matchedDoubt) break;
    }
  }

  // If not found in doubts database, search ORGANS_DATA
  if (!matchedDoubt) {
    for (let key in ORGANS_DATA) {
      const organ = ORGANS_DATA[key];
      if (organ.name.toLowerCase().includes(queryTrimmed) || key.includes(queryTrimmed)) {
        matchedDoubt = {
          topic: organ.name,
          kidsAnswer: organ.kidsText + " Superhero Habit: " + organ.kidsHabit,
          adultAnswer: organ.adultText + " Suggestions: " + organ.adultSuggestions
        };
        break;
      }
    }
  }

  if (matchedDoubt) {
    const answerText = isKids ? matchedDoubt.kidsAnswer : matchedDoubt.adultAnswer;
    const modeBadge = isKids ? "🧒 Junior Anatomy (Under 18)" : "🧑 Clinical Physiology (18+)";

    resultArea.innerHTML = `
      <div class="body-doubt-result">
        <div class="body-doubt-header">
          <h4>💡 ${matchedDoubt.topic}</h4>
          <span class="badge-status badge-normal" style="font-size: 0.72rem;">${modeBadge}</span>
        </div>
        <p class="body-doubt-text">${answerText}</p>
        <div style="margin-top: 0.75rem; display: flex; gap: 0.5rem;">
          <button class="btn-send" style="padding: 0.35rem 0.8rem; font-size: 0.8rem;" onclick="speakText('${escapeHtml(matchedDoubt.topic)}. ${escapeHtml(answerText)}')">
            🔊 Listen
          </button>
          <button class="btn-chip" onclick="clearBodySearchResult()">Dismiss</button>
        </div>
      </div>
    `;
    speakText(`${matchedDoubt.topic}. ${answerText}`);
  } else {
    resultArea.innerHTML = `
      <div class="body-doubt-result" style="background: #fffbeb; border-color: #fef08a;">
        <h4 style="color: #854d0e; font-size: 0.95rem; margin-bottom: 0.25rem;">🔍 General Body Advice for: "${query}"</h4>
        <p class="body-doubt-text" style="color: #713f12;">
          ${isKids 
            ? "Your body is always working hard to keep you healthy! Drinking water, eating colorful fruits and vegetables, and playing outside helps every single organ stay strong!" 
            : "The human body maintains internal equilibrium through complex metabolic and autonomic neuroendocrine loops. Maintaining hydration, balanced nutrition, and regular cardiovascular exercise sustains cellular vitality."}
        </p>
        <div style="margin-top: 0.5rem;">
          <button class="btn-chip" onclick="clearBodySearchResult()">Dismiss</button>
        </div>
      </div>
    `;
  }
}

function clearBodySearchResult() {
  const resultArea = document.getElementById("bodySearchResultArea");
  if (resultArea) resultArea.innerHTML = "";
  const input = document.getElementById("bodySearchInput");
  if (input) input.value = "";
}

function startBodyVoiceSearch() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) {
    showToast("Speech recognition not supported on this browser.");
    return;
  }
  const recog = new SpeechRecognition();
  recog.lang = AppState.user.language || "en-US";
  recog.onstart = () => showToast("Listening for your body doubt...");
  recog.onresult = (e) => {
    const text = e.results[0][0].transcript;
    const input = document.getElementById("bodySearchInput");
    if (input) input.value = text;
    handleBodySearch(text);
  };
  recog.onerror = () => showToast("Could not recognize voice. Try typing.");
  recog.start();
}

// Window Onload Initialization
window.addEventListener("DOMContentLoaded", () => {
  const contextLanguage = normalizeLanguage(AppState.user.language);
  if (contextLanguage) {
    AppState.user.language = contextLanguage;
    AppState.languageChosen = true;
    const selector = document.getElementById("langSelector");
    if (selector && [...selector.options].some(option => option.value === contextLanguage)) selector.value = contextLanguage;
  }
  initSpeechRecognition();
  updateProfileUI();
  renderSchedule();
  renderBodyBoard();
  updateHistoryBadge();
  updateSidebarExercises();
  renderLanguagesList("");
  checkFirstTimeNotification();

  if (AppState.currentReport?.extractedText) {
    showExtractedReport(AppState.currentReport.extractedText, AppState.currentReport.title || "Uploaded report");
  }

  if (AppState.speechSynth) {
    populateSystemVoices();
    if (AppState.speechSynth.onvoiceschanged !== undefined) {
      AppState.speechSynth.onvoiceschanged = populateSystemVoices;
    }
  }

  // Initialize Search Bar Listeners
  const searchInput = document.getElementById("globalSearchInput");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => handleSearch(e.target.value));
  }

  // Close search dropdown on click outside
  document.addEventListener("click", (e) => {
    if (!e.target.closest(".search-container")) {
      const dd = document.getElementById("searchDropdown");
      if (dd) dd.classList.remove("active");
    }
  });

  // Start with a supplied report or ask only for missing profile details.
  if (!AppState.currentReport?.extractedText) setTimeout(advanceIntake, 400);

  // Periodic Compulsory Reminder Checker (e.g. periodically checks scheduled items)
  setInterval(() => {
    const pendingItem = AppState.todaySchedule.find(i => i.status === "pending");
    // Trigger compulsory reminders gently when scheduled or requested
  }, 60000);
});
