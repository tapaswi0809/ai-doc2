// Curated datasets aligned with Hugging Face repositories:
// 1. AnubhutiBhardwaj/medical-reports-demo
// 2. dux-tecblic/symptom-disease-dataset
// 3. nutrition-assistant-team/nutrition-food-label
// 4. jason1966/aakashjoshi123_exercise-and-fitness-metrics-dataset
// 5. sksayril/medicine-information
// 6. Karmukilan/Medical_Question_answering_Dataset

const HEALTH_DATASETS = {
  // 1. Medical Reports Demo Dataset
  sampleReports: [
    {
      id: "report_diabetes_htn",
      title: "Comprehensive Metabolic & Lipid Panel (Sample 1)",
      patientType: "Adult Male, 52 yrs",
      summary: "Elevated Fasting Blood Sugar, High Blood Pressure, and Borderline Cholesterol.",
      values: [
        { parameter: "Fasting Blood Sugar (Glucose)", value: 168, unit: "mg/dL", normalRange: "70 - 99", status: "High", explanation: "Your fasting blood sugar is higher than normal. Your cells are not absorbing sugar effectively, which can indicate diabetes or impaired glucose tolerance." },
        { parameter: "Postprandial Blood Sugar (PP)", value: 220, unit: "mg/dL", normalRange: "< 140", status: "High", explanation: "Your 2-hour post meal blood sugar is significantly high, meaning sugar stays in your bloodstream longer after meals." },
        { parameter: "HbA1c (Glycated Hemoglobin)", value: 7.9, unit: "%", normalRange: "< 5.7", status: "High", explanation: "This shows your average blood sugar over the last 3 months. A value of 7.9% shows persistent high blood sugar." },
        { parameter: "Blood Pressure (Systolic)", value: 146, unit: "mmHg", normalRange: "90 - 120", status: "High", explanation: "The pressure when your heart pumps is elevated (Stage 2 Hypertension range)." },
        { parameter: "Blood Pressure (Diastolic)", value: 92, unit: "mmHg", normalRange: "60 - 80", status: "High", explanation: "The pressure when your heart relaxes between beats is elevated." },
        { parameter: "Total Cholesterol", value: 235, unit: "mg/dL", normalRange: "< 200", status: "High", explanation: "Total fat molecules in blood are elevated, which can gradually build up in artery walls." },
        { parameter: "HDL ('Good') Cholesterol", value: 38, unit: "mg/dL", normalRange: "> 40", status: "Low", explanation: "Good cholesterol helps clear bad fats; your level is slightly low." },
        { parameter: "LDL ('Bad') Cholesterol", value: 154, unit: "mg/dL", normalRange: "< 100", status: "High", explanation: "Bad cholesterol carries fat deposits to blood vessels and is currently elevated." },
        { parameter: "Triglycerides", value: 210, unit: "mg/dL", normalRange: "< 150", status: "High", explanation: "Blood fats from unused calories are high." },
        { parameter: "Hemoglobin", value: 14.2, unit: "g/dL", normalRange: "13.8 - 17.2", status: "Normal", explanation: "Oxygen-carrying capacity of red blood cells is healthy and within normal limits." },
        { parameter: "Serum Creatinine", value: 1.0, unit: "mg/dL", normalRange: "0.7 - 1.3", status: "Normal", explanation: "Kidney filtration function is normal." }
      ],
      issues: [
        {
          name: "Elevated Blood Glucose (Hyperglycemia / Diabetes indicator)",
          precautions: "Reduce refined carbohydrates and sugary beverages. Eat at consistent times. Monitor blood sugar regularly as advised by your doctor.",
          pros: "Early lifestyle and dietary changes significantly reduce the risk of long-term nerve, eye, and kidney complications.",
          cons: "Requires disciplined daily meal habits, periodic finger-prick checks, and adherence to doctor-prescribed medications."
        },
        {
          name: "High Blood Pressure (Hypertension Stage 2)",
          precautions: "Limit daily sodium/salt intake to under 1 teaspoon (2,000 mg). Practice deep breathing or meditation to manage stress. Engage in daily light aerobic walking.",
          pros: "Lowering blood pressure relieves strain on the heart, drastically lowering risks of heart attacks and strokes.",
          cons: "Sudden dietary salt reductions may make food taste plain initially; consistency is essential."
        },
        {
          name: "Dyslipidemia (Elevated Bad Cholesterol & Triglycerides)",
          precautions: "Avoid deep-fried items, trans-fats, and red meat. Incorporate soluble fiber (oats, flaxseeds, legumes) and omega-3 rich foods.",
          pros: "Improves arterial flexibility, enhances stamina, and prevents plaque formation.",
          cons: "Requires dietary vigilance when dining out or eating packaged foods."
        }
      ]
    },
    {
      id: "report_anemia_normal_vitals",
      title: "Complete Blood Count & Iron Panel (Sample 2)",
      patientType: "Young Adult Female, 24 yrs",
      summary: "Low Hemoglobin and Ferritin (Iron Deficiency Anemia), normal sugar and blood pressure.",
      values: [
        { parameter: "Hemoglobin", value: 9.2, unit: "g/dL", normalRange: "12.1 - 15.1", status: "Low", explanation: "Your red blood cell count or hemoglobin is lower than normal, which explains feelings of fatigue, cold hands, or low energy." },
        { parameter: "RBC Count", value: 3.4, unit: "million/uL", normalRange: "4.0 - 5.2", status: "Low", explanation: "Fewer red blood cells available to carry oxygen to your brain and muscles." },
        { parameter: "Serum Ferritin (Iron Stores)", value: 11, unit: "ng/mL", normalRange: "15 - 150", status: "Low", explanation: "Your body's stored iron reserves are depleted." },
        { parameter: "Fasting Blood Sugar", value: 88, unit: "mg/dL", normalRange: "70 - 99", status: "Normal", explanation: "Fasting glucose is perfectly balanced." },
        { parameter: "Blood Pressure (Systolic)", value: 112, unit: "mmHg", normalRange: "90 - 120", status: "Normal", explanation: "Heart pumping pressure is ideal." },
        { parameter: "Blood Pressure (Diastolic)", value: 74, unit: "mmHg", normalRange: "60 - 80", status: "Normal", explanation: "Heart resting pressure is optimal." },
        { parameter: "Total Cholesterol", value: 165, unit: "mg/dL", normalRange: "< 200", status: "Normal", explanation: "Circulating cholesterol levels are healthy." }
      ],
      issues: [
        {
          name: "Iron Deficiency Anemia (Low Hemoglobin)",
          precautions: "Incorporate iron-dense foods along with Vitamin C (lemon juice, oranges) to enhance absorption. Avoid drinking black tea or coffee right with iron-rich meals.",
          pros: "Restoring iron stores eliminates fatigue, boosts mental focus, strengthens hair and nails.",
          cons: "Iron replenishment takes 6 to 12 weeks of steady nutrition."
        }
      ]
    },
    {
      id: "report_thyroid_metabolic",
      title: "Thyroid & Lipid Screening (Sample 3)",
      patientType: "Adult Female, 38 yrs",
      summary: "Elevated TSH (Hypothyroidism profile) with sluggish metabolism.",
      values: [
        { parameter: "TSH (Thyroid Stimulating Hormone)", value: 8.4, unit: "uIU/mL", normalRange: "0.4 - 4.2", status: "High", explanation: "High TSH indicates your pituitary gland is working extra hard because your thyroid gland is producing less active thyroid hormone." },
        { parameter: "Free T4 (Thyroxine)", value: 0.72, unit: "ng/dL", normalRange: "0.8 - 1.8", status: "Low", explanation: "Slightly low active hormone, which can cause slow metabolism, weight gain, or dry skin." },
        { parameter: "Fasting Blood Sugar", value: 95, unit: "mg/dL", normalRange: "70 - 99", status: "Normal", explanation: "Blood sugar is within normal parameters." },
        { parameter: "Total Cholesterol", value: 218, unit: "mg/dL", normalRange: "< 200", status: "High", explanation: "Thyroid underactivity often leads to slightly higher circulating cholesterol." },
        { parameter: "Blood Pressure", value: "118 / 78", unit: "mmHg", normalRange: "120/80", status: "Normal", explanation: "Blood pressure is healthy and normal." }
      ],
      issues: [
        {
          name: "Underactive Thyroid (Hypothyroidism tendency)",
          precautions: "Consult an endocrinologist for confirmation. Ensure adequate dietary selenium, zinc, and iodized salt. Never take calcium or iron supplements at the same hour as thyroid medication.",
          pros: "Correct management restores energy, stabilizes mood, and regulates body temperature.",
          cons: "Requires daily morning routine discipline and periodic blood test monitoring."
        }
      ]
    }
  ],

  // 2. Symptom Disease Dataset & Diagnostic Guidance
  symptomsDatabase: [
    {
      symptom: "Chest pain or pressure radiating to arm, neck or jaw",
      severity: "EMERGENCY",
      warningSign: true,
      generalCauses: "May indicate Acute Myocardial Infarction (Heart Attack), Angina Pectoris, or severe cardiac ischemia.",
      suggestedTests: "Immediate 12-lead ECG, Troponin-I / Troponin-T cardiac enzyme blood test, Echocardiogram.",
      recommendedSpecialist: "Emergency Cardiologist / Emergency Department.",
      actionUrgency: "ACT NOW: Immediate emergency hospital transfer or ambulance call required. Do not wait or drive yourself."
    },
    {
      symptom: "Sudden facial drooping, arm weakness, or slurred speech (FAST)",
      severity: "EMERGENCY",
      warningSign: true,
      generalCauses: "Hallmark signs of Acute Ischemic Stroke or Transient Ischemic Attack (TIA).",
      suggestedTests: "Emergency Non-contrast Brain CT scan, Brain MRI, Carotid Doppler ultrasound.",
      recommendedSpecialist: "Emergency Neurologist / Stroke Care Unit.",
      actionUrgency: "ACT NOW: Call an ambulance immediately. Every minute saved preserves brain cells."
    },
    {
      symptom: "Severe shortness of breath or difficulty breathing at rest",
      severity: "EMERGENCY",
      warningSign: true,
      generalCauses: "May stem from severe asthma exacerbation, pulmonary edema, pulmonary embolism, pneumonia, or acute heart strain.",
      suggestedTests: "Pulse Oximetry (SpO2), Chest X-Ray / CT Thorax, Arterial Blood Gas (ABG), D-Dimer.",
      recommendedSpecialist: "Pulmonologist / Emergency Care Physician.",
      actionUrgency: "ACT NOW: Seek immediate emergency room evaluation and oxygen assessment."
    },
    {
      symptom: "Fainting (Syncope) or sudden loss of consciousness",
      severity: "EMERGENCY",
      warningSign: true,
      generalCauses: "Severe orthostatic drop, cardiac arrhythmia, sudden blood pressure crash, severe dehydration, or neurological episode.",
      suggestedTests: "ECG, Holter monitoring, Blood pressure lying and standing, Blood glucose test, Hemoglobin.",
      recommendedSpecialist: "Cardiologist / General Physician.",
      actionUrgency: "ACT NOW: Lay flat with legs elevated. If unresponsive or recurring, call an ambulance immediately."
    },
    {
      symptom: "Frequent urination, excessive unquenchable thirst, and sudden unexplained weight loss",
      severity: "MODERATE",
      warningSign: false,
      generalCauses: "Commonly associated with elevated blood glucose levels (Type 1 or Type 2 Diabetes Mellitus) or urinary tract irritation.",
      suggestedTests: "Fasting Blood Sugar (FBS), Postprandial Blood Sugar (PPBS), HbA1c test, Urine Routine & Microscopic analysis.",
      recommendedSpecialist: "Endocrinologist or Internal Medicine Physician.",
      actionUrgency: "Schedule an outpatient clinical consultation and lab testing within 24 to 48 hours."
    },
    {
      symptom: "Persistent throbbing headache with neck stiffness and sensitivity to light",
      severity: "HIGH",
      warningSign: false,
      generalCauses: "Can range from severe Migraine, tension cluster headaches, sinus pressure, to systemic or meningeal irritation.",
      suggestedTests: "Blood Pressure check, Ophthalmoscopy (fundus examination), Neurological evaluation, Brain CT if accompanied by high fever.",
      recommendedSpecialist: "Neurologist or General Physician.",
      actionUrgency: "Visit an outpatient clinic promptly. If fever, neck rigidity or vomiting is present, seek immediate urgent care."
    },
    {
      symptom: "Fatigue, feeling cold easily, pale skin, brittle nails and dizziness on standing",
      severity: "MILD_TO_MODERATE",
      warningSign: false,
      generalCauses: "Frequently linked to nutritional iron deficiency, low hemoglobin (anemia), Vitamin B12 deficiency, or thyroid underactivity.",
      suggestedTests: "Complete Blood Count (CBC / Hemogram), Serum Ferritin, Serum Iron & TIBC, Vitamin B12, TSH.",
      recommendedSpecialist: "General Physician / Hematologist.",
      actionUrgency: "Schedule routine diagnostic blood tests and consult a primary care doctor."
    },
    {
      symptom: "Burning sensation in upper chest/throat after eating (heartburn), acid regurgitation",
      severity: "MILD",
      warningSign: false,
      generalCauses: "Gastroesophageal Reflux Disease (GERD), acid hypersecretion, gastritis, or dietary triggers.",
      suggestedTests: "Clinical assessment, H. Pylori stool/breath test, Upper GI Endoscopy if chronic or unresponsive.",
      recommendedSpecialist: "Gastroenterologist or Family Physician.",
      actionUrgency: "Adopt upright post-meal posture, avoid late-night heavy meals, and consult your doctor."
    },
    {
      symptom: "High fever (above 101 F) with body aches, chills, and productive cough",
      severity: "MODERATE",
      warningSign: false,
      generalCauses: "Acute viral respiratory illness (Influenza), bacterial bronchitis, or early respiratory tract infection.",
      suggestedTests: "CBC with Differential, Rapid Viral Panel, Chest X-ray if cough exceeds 5 days or phlegm is discolored.",
      recommendedSpecialist: "General Physician / Pulmonologist.",
      actionUrgency: "Stay well hydrated, rest in bed, monitor temperature, and see a doctor for prescription medication."
    }
  ],

  // 3. Nutrition Food Label & Dietary Plan Dataset
  nutritionPlans: {
    diabetes: {
      conditionName: "Elevated Blood Sugar / Diabetes Management",
      foodsToEat: [
        { name: "Non-Starchy Vegetables (Spinach, Broccoli, Bitter Gourd, Bell Peppers)", whyNeeded: "Rich in micronutrients, antioxidants, and low in glycemic load, preventing glucose spikes." },
        { name: "Whole Pulses & Legumes (Lentils, Chickpeas, Moong Dal)", whyNeeded: "High soluble fiber and plant protein content slows down carbohydrate digestion and absorption." },
        { name: "Whole Grains (Steel-cut Oats, Quinoa, Brown Rice, Millets like Ragi)", whyNeeded: "Low glycemic index provides sustained energy without sharp insulin surges." },
        { name: "Healthy Fats & Nuts (Almonds, Walnuts, Chia seeds, Extra Virgin Olive Oil)", whyNeeded: "Improves insulin sensitivity and provides satiety while protecting vascular lining." },
        { name: "Lean Proteins (Tofu, Paneer, Egg whites, Grilled chicken/fish if non-veg)", whyNeeded: "Stabilizes postprandial glucose curves and maintains lean muscle mass." }
      ],
      foodsToAvoid: [
        { name: "Refined White Sugar & Sweetened Drinks (Soda, Packed Juices, Sweet Tea)", whyNeeded: "Rapidly absorbed free sugars trigger steep hyperglycemia spikes." },
        { name: "Refined Flour Products (White Bread, Pastries, Biscuits, Bakery items)", whyNeeded: "Stripped of dietary fiber, rapidly turning into simple glucose in the gut." },
        { name: "Deep-Fried Snacks (Samosas, French Fries, Pakoras)", whyNeeded: "High trans-fats combined with refined carbs increase insulin resistance." },
        { name: "High-Sugar Fruits in excess (Mangoes, Grapes, Dried Raisins, Candied fruits)", whyNeeded: "Concentrated fructose content can elevate blood sugar if eaten in large portions." }
      ],
      waterGuidance: "Drink 2.5 to 3.0 Liters of pure water throughout the day. Ample hydration helps kidneys flush excess circulating glucose via urine.",
      sleepGuidance: "Aim for 7 to 8 hours of restful sleep every night. Sleep deprivation elevates cortisol, triggering hepatic glucose release."
    },
    hypertension: {
      conditionName: "High Blood Pressure (DASH Dietary Approach)",
      foodsToEat: [
        { name: "Potassium-Rich Foods (Bananas, Coconut Water, Sweet Potatoes, Spinach)", whyNeeded: "Potassium helps vascular muscle cells relax and promotes sodium excretion through kidneys." },
        { name: "Magnesium-Rich Seeds & Nuts (Pumpkin seeds, Flaxseeds, Almonds)", whyNeeded: "Magnesium acts as a natural calcium-channel regulator, supporting smooth blood flow." },
        { name: "Nitrate-Rich Beets & Pomegranate", whyNeeded: "Dietary nitrates convert into nitric oxide in the body, widening blood vessels." },
        { name: "Low-Fat Dairy (Plain Yogurt, Skim Milk, Buttermilk without salt)", whyNeeded: "Rich in bioavailable calcium and bioactive peptides that naturally support BP control." },
        { name: "Garlic & Culinary Herbs", whyNeeded: "Contains allicin which supports arterial elasticity and replaces added salt for flavor." }
      ],
      foodsToAvoid: [
        { name: "Table Salt & High-Sodium Seasonings (Soy sauce, MSG, Pickles, Papads)", whyNeeded: "Excess sodium pulls fluid into blood vessels, dramatically raising intravascular pressure." },
        { name: "Processed & Cured Meats (Bacon, Sausages, Canned Soups)", whyNeeded: "Extremely high sodium preservatives and saturated fats harden artery walls." },
        { name: "Excess Caffeine & Energy Drinks", whyNeeded: "Causes acute vasoconstriction, inducing transient blood pressure spikes." },
        { name: "Alcohol & Smoking", whyNeeded: "Damages arterial endothelium and impairs autonomic blood pressure regulation." }
      ],
      waterGuidance: "Drink 2.2 to 2.8 Liters of water daily. Avoid gulping large volumes at once; sip evenly throughout waking hours.",
      sleepGuidance: "Ensure 7 to 9 hours of undisturbed sleep in a dark, quiet room. Nocturnal dip in blood pressure allows cardiovascular recovery."
    },
    anemia: {
      conditionName: "Iron Deficiency / Low Hemoglobin Recovery",
      foodsToEat: [
        { name: "Iron-Rich Greens (Spinach, Fenugreek, Moringa / Drumstick leaves)", whyNeeded: "Provides plant-based non-heme iron essential for hemoglobin synthesis." },
        { name: "Vitamin C Boosters (Lemon juice, Amla / Indian Gooseberry, Oranges, Bell peppers)", whyNeeded: "Vitamin C converts non-heme ferric iron into absorbable ferrous iron in the stomach." },
        { name: "Beetroot, Pomegranate, and Black Dates", whyNeeded: "Supports erythropoiesis (red blood cell production) and replenishes cellular vitality." },
        { name: "Legumes, Black Chana, Rajma, and Jaggery in moderation", whyNeeded: "Traditional, nutrient-dense iron and mineral sources." },
        { name: "Liver, Eggs, and Lean Poultry (for non-vegetarians)", whyNeeded: "Provides high-bioavailability heme iron directly utilized by bone marrow." }
      ],
      foodsToAvoid: [
        { name: "Black Tea & Coffee with Meals", whyNeeded: "Tannins and polyphenols bind to dietary iron in the intestine, blocking up to 60% of absorption." },
        { name: "Calcium Supplements or High Calcium Milk immediately with iron foods", whyNeeded: "Calcium competes directly with iron for mucosal transport channels." },
        { name: "Excess Bran / Phytates without soaking", whyNeeded: "Unsoaked grains contain phytates that bind minerals; always soak legumes before cooking." }
      ],
      waterGuidance: "Maintain 2.5 Liters of water daily. Good hydration supports healthy blood volume and fluid distribution.",
      sleepGuidance: "Prioritize 8 hours of restorative sleep to combat daytime fatigue and support cellular recovery."
    },
    generalWellness: {
      conditionName: "Balanced Wholesome Health Maintenance",
      foodsToEat: [
        { name: "Rainbow Plate of Colorful Seasonal Vegetables and Fruits", whyNeeded: "Provides diverse phytonutrients, antioxidants, and dietary fiber." },
        { name: "Sprouted Legumes & Whole Grains", whyNeeded: "Sprouting enhances enzyme activity and nutrient bioavailability." },
        { name: "Hydrating Cucumbers, Melons, and Fresh Greens", whyNeeded: "Maintains optimal cellular hydration and gastrointestinal motility." },
        { name: "Probiotic Curd / Fermented Foods", whyNeeded: "Nurtures the gut microbiome, strengthening immunity and mood regulation." }
      ],
      foodsToAvoid: [
        { name: "Ultra-Processed Snack Foods & Hydrogenated Oils", whyNeeded: "Promotes systemic low-grade inflammation and oxidative cellular stress." },
        { name: "Excessive Refined Sugar", whyNeeded: "Disrupts insulin sensitivity and energy levels." }
      ],
      waterGuidance: "2.5 to 3.0 Liters daily (approx. 8 to 10 glasses).",
      sleepGuidance: "7 to 8 hours consistent sleep schedule."
    }
  },

  // 4. Exercise and Fitness Metrics Dataset
  fitnessMetrics: {
    walking: { name: "Brisk Aerobic Walking", duration: "30 - 45 mins", targetHeartRate: "100 - 125 bpm", calories: "150 - 220 kcal", recommendation: "Ideal for cardiovascular endurance, blood sugar regulation, and gentle joint movement." },
    yoga: { name: "Gentle Hatha Yoga & Pranayama", duration: "25 - 35 mins", targetHeartRate: "80 - 105 bpm", calories: "90 - 140 kcal", recommendation: "Reduces arterial stiffness, lowers cortisol, improves lung capacity and spine flexibility." },
    strength: { name: "Bodyweight Strength & Resistance Bands", duration: "20 - 30 mins", targetHeartRate: "110 - 135 bpm", calories: "130 - 190 kcal", recommendation: "Preserves lean skeletal muscle, stimulates glucose uptake independently of insulin, and builds bone density." },
    cycling: { name: "Low-Impact Cycling / Stationary Bike", duration: "30 mins", targetHeartRate: "110 - 130 bpm", calories: "180 - 240 kcal", recommendation: "Excellent low-impact cardiovascular workout without knee impact." },
    kidsPlay: { name: "Outdoor Active Play (Tag, Skipping, Cycling, Ball Games)", duration: "60 mins daily", targetHeartRate: "Playful active", calories: "200 - 300 kcal", recommendation: "Essential for bone growth, coordination, mental wellness, and sound sleep." }
  },

  // 5. Medicine Information Dataset (Strict prescription rule: never invent dosage)
  medicinesDirectory: [
    { name: "Metformin", category: "Oral Antidiabetic", standardRole: "Helps insulin work better and decreases glucose production by the liver.", doctorPrescriptionRule: "Take strictly as prescribed by your doctor, usually with or immediately after meals to avoid stomach upset. Never alter doses on your own.", precautions: "Avoid excessive alcohol. Stay hydrated. Report unusual fatigue or muscle aches to your doctor." },
    { name: "Amlodipine", category: "Calcium Channel Blocker (Antihypertensive)", standardRole: "Relaxes blood vessel walls so blood flows more easily, lowering blood pressure.", doctorPrescriptionRule: "Take once daily at the exact time advised by your doctor, with or without food. Do not stop abruptly.", precautions: "Avoid grapefruit juice. If mild ankle swelling occurs, mention it to your physician." },
    { name: "Telmisartan", category: "Angiotensin Receptor Blocker (Antihypertensive)", standardRole: "Blocks blood vessel constricting hormone, protecting heart and kidneys.", doctorPrescriptionRule: "Follow doctor's prescription strictly. Take regularly at the same hour each morning or evening.", precautions: "Avoid potassium salt substitutes without consulting your physician." },
    { name: "Atorvastatin", category: "Lipid-Lowering Statin", standardRole: "Reduces liver production of LDL bad cholesterol and stabilizes plaque.", doctorPrescriptionRule: "Take as directed by doctor, commonly in the evening with water.", precautions: "Report unexplained muscle soreness or weakness immediately to your doctor." },
    { name: "Levothyroxine", category: "Thyroid Hormone Supplement", standardRole: "Replaces missing thyroid hormone to normalize metabolism and energy.", doctorPrescriptionRule: "Take strictly on an empty stomach in the morning with a full glass of water, at least 30-60 minutes before breakfast.", precautions: "Do NOT take iron, calcium, or antacid supplements within 4 hours of this tablet." },
    { name: "Iron & Folic Acid (Ferrous Ascorbate)", category: "Hematological Supplement", standardRole: "Replenishes hemoglobin and iron stores in bone marrow.", doctorPrescriptionRule: "Take exactly as prescribed, ideally with Vitamin C (lemon water or orange juice). Avoid taking with milk, tea, or coffee.", precautions: "May darken stool color (normal and harmless). If nausea occurs, take with light food." }
  ],

  // 6. Medical Question Answering Dataset (Common FAQs)
  qaDatabase: [
    { question: "How do I use this app?", keywords: ["how to use", "guide", "help", "tutorial", "start", "voice"], answer: "HealthMate AI guides you through 5 simple steps: 1) Complete your short health profile (name, age, preferences, medications), 2) Upload your medical test report or type your symptoms, 3) Review clear explanations of your health parameters (Sugar, BP, Hemoglobin, etc.), 4) Follow your customized diet and Today Schedule, and 5) Use the Voice Assistant or Search Bar anytime for instant doubts or home nurse booking!" },
    { question: "What is a normal fasting blood sugar level?", keywords: ["sugar", "glucose", "fasting", "diabetes", "range"], answer: "For adults, normal fasting blood sugar (measured after an 8 to 12 hour fast) is typically between 70 and 99 mg/dL. A level between 100 and 125 mg/dL indicates impaired fasting glucose (prediabetes), and 126 mg/dL or higher on two separate tests indicates diabetes." },
    { question: "What is healthy blood pressure?", keywords: ["bp", "blood pressure", "hypertension", "systolic", "diastolic"], answer: "A healthy resting blood pressure for adults is generally below 120/80 mmHg (systolic under 120 and diastolic under 80). Consistently reading 130-139 / 80-89 mmHg is Stage 1 Hypertension, and 140/90 mmHg or above is Stage 2 Hypertension." },
    { question: "Why is my hemoglobin low and what should I do?", keywords: ["hemoglobin", "hb", "anemia", "iron", "fatigue"], answer: "Low hemoglobin means your blood has fewer red cells to deliver oxygen, causing fatigue, dizziness, or weakness. Common causes include iron deficiency, low Vitamin B12, or heavy menstrual flow. Eat iron-rich foods (spinach, beetroot, lentils, dates) paired with Vitamin C, and consult your doctor for diagnostic evaluation." },
    { question: "Can I stop my blood pressure medicine if my reading is normal today?", keywords: ["stop medicine", "bp medicine", "skip tablet", "normal bp"], answer: "No, never stop or adjust blood pressure medication on your own! A normal reading means your medication is working effectively. Stopping abruptly can cause dangerous rebound spikes in blood pressure. Always consult your prescribing doctor before any changes." },
    { question: "When should I call an ambulance or go to the ER immediately?", keywords: ["emergency", "ambulance", "chest pain", "hospital", "red flag", "warning signs"], answer: "Seek immediate emergency medical help if you or someone experiences: crushing chest pain or pressure radiating to the arm/jaw, sudden difficulty breathing, sudden face drooping or arm weakness or speech slurring (stroke signs), loss of consciousness/fainting, or uncontrolled heavy bleeding." },
    { question: "How does the home nurse booking work?", keywords: ["nurse", "home nurse", "sample collection", "blood test at home", "book nurse"], answer: "You can book a verified, licensed healthcare nurse right inside the app! Enter your city, address, and preferred time slot. The nurse visits your doorstep to safely draw blood or urine samples and record vitals. Once the lab processes your results, they automatically appear in your app with plain-language explanations." },
    { question: "How should children stay healthy and safe?", keywords: ["kids", "child", "under 18", "habits", "safety", "screen time"], answer: "Children thrive with: 1) Eating fresh fruits, vegetables, and drinking plenty of water, 2) Limiting screen time to under 1-2 hours daily, 3) 60 minutes of fun outdoor active play, 4) 9 to 11 hours of restful sleep, and 5) Understanding body safety—knowing the swimsuit rule, respecting personal boundaries, and speaking to a trusted adult if anyone ever makes them feel uncomfortable." }
  ],

  // Hospital Database for Emergency Guidance
  emergencyHospitals: [
    { name: "City Care Super-Specialty Hospital & Trauma Center", distance: "1.2 km away", emergencyNumber: "+1 (800) 555-0199 / 108", address: "402 Medical Center Boulevard", erWaitTime: "Immediate Triage", ambulanceReady: true },
    { name: "Metro Heart & Vascular Emergency Institute", distance: "2.8 km away", emergencyNumber: "+1 (800) 555-0188 / 108", address: "15 Lifeline Road, Central District", erWaitTime: "Under 10 mins", ambulanceReady: true },
    { name: "St. Jude General Hospital 24/7 ER", distance: "3.5 km away", emergencyNumber: "+1 (800) 555-0177 / 108", address: "88 Avenue of Health", erWaitTime: "Under 15 mins", ambulanceReady: true }
  ],

  // 7. Interactive Body Doubts & Explanations Database (for Kids & Adults)
  bodyDoubtsDatabase: [
    {
      topic: "Heart & Pulse",
      keywords: ["heart", "pulse", "beat", "pump", "heartbeat", "blood vessel", "circulation"],
      kidsAnswer: "Your heart is a tireless superhero pump! It beats about 100,000 times every day, pumping blood full of oxygen and nutrients through special tubes called blood vessels to give your muscles energy to run, jump, and play!",
      adultAnswer: "The human heart contracts cyclically (~60-100 bpm at rest) via the cardiac conduction system (SA node to AV node). It circulates roughly 5 liters of blood per minute through systemic and pulmonary vascular beds, regulating tissue oxygen delivery and arterial hemodynamics."
    },
    {
      topic: "Sneezing & Coughing",
      keywords: ["sneeze", "sneezing", "cough", "coughing", "nose tickle", "dust", "allergy"],
      kidsAnswer: "A sneeze is your body's super-fast air cannon! When tickly dust or germs get inside your nose, your brain commands your chest muscles to blast them out at up to 100 miles per hour! Always cover your mouth with your elbow!",
      adultAnswer: "Sneezing (sternutatory reflex) is an involuntary protective airway mechanism triggered by irritation of the nasal mucosa, mediated by the trigeminal nerve. Coughing clears the tracheobronchial tree via vagal afferents to preserve airway patency."
    },
    {
      topic: "Brain, Dreams & Thinking",
      keywords: ["brain", "dream", "dreams", "memory", "headache", "think", "thinking", "sleep"],
      kidsAnswer: "Your brain is the master superhero computer of your body! It has billions of tiny nerve cells sending messages faster than lightning. When you sleep, your brain replays memories and paints fun dreams while organizing everything you learned!",
      adultAnswer: "The central brain contains ~86 billion neurons connected through trillions of synaptic junctions. REM sleep facilitates memory consolidation and neuroplastic pruning, while the glymphatic system clears metabolic toxins like beta-amyloid."
    },
    {
      topic: "Lungs & Yawning",
      keywords: ["lungs", "breathe", "breathing", "yawn", "yawning", "air", "oxygen", "hiccup"],
      kidsAnswer: "Your lungs take in fresh oxygen from the air so your whole body can stay alive and energetic! Yawning cools down your hard-working brain and brings in a nice deep breath when you're tired or ready to recharge.",
      adultAnswer: "The respiratory system relies on diaphragmatic and intercostal contractions to create negative intrathoracic pressure. Alveolar-capillary diffusion facilitates PaO2 and PaCO2 exchange. Yawning is believed to regulate cerebral temperature and maintain alveolar surfactant distribution."
    },
    {
      topic: "Stomach, Hunger & Rumbling",
      keywords: ["stomach", "tummy", "digestion", "rumble", "growl", "hunger", "hungry", "gut", "intestine"],
      kidsAnswer: "When your tummy makes a funny rumbling growl, it's called borborygmi! It means your stomach and intestines are squeezing and churning air and digestive juices to get ready for your next healthy meal!",
      adultAnswer: "Gastric rumbling reflects peristaltic migrating motor complexes (MMC) sweeping residual chyme and gas through the gastrointestinal tract during fasting states, mediated by motilin and the enteric nervous system."
    },
    {
      topic: "Bones, Muscles & Cracking",
      keywords: ["bones", "skeleton", "crack", "cracking", "muscles", "cramp", "growth", "joints"],
      kidsAnswer: "You have 206 bones in your body! When you hear your knuckles crack, it's just tiny gas bubbles popping safely inside your joints, like bubble wrap. Your muscles pull on your bones like puppet strings so you can run and dance!",
      adultAnswer: "Skeletal structure provides biomechanical scaffolding and mineral reservoir (calcium/phosphate). Joint cracking (cavitation) occurs when synovial fluid pressure drops, creating microscopic gas cavities. Muscle cramps frequently stem from electrolyte imbalances (Mg/K/Ca) or local fatigue."
    },
    {
      topic: "Kidneys & Hydration",
      keywords: ["kidney", "kidneys", "urine", "pee", "water", "hydration", "filtration"],
      kidsAnswer: "Your two kidneys look like big red beans and act like water purification filters! They clean your blood every minute, washing out waste into your pee. Drinking plenty of fresh water keeps your kidneys super happy and sparkling clean!",
      adultAnswer: "Paired kidneys contain ~1 million nephrons each, filtering approximately 180 liters of blood per day (GFR > 90 mL/min/1.73m2). They regulate fluid balance, blood pressure (renin-angiotensin-aldosterone system), acid-base equilibrium, and erythropoietin secretion."
    },
    {
      topic: "Liver Superpowers",
      keywords: ["liver", "detox", "filter", "bile", "metabolism"],
      kidsAnswer: "The liver is your body's master chemical factory! It can even regrow if part of it is damaged. It helps break down the food you eat, stores energy for when you play, and sweeps away bad stuff.",
      adultAnswer: "The liver carries out over 500 vital functions: Phase I and Phase II enzymatic xenobiotic biotransformation, bile acid synthesis, glycogen storage, lipid metabolism, and plasma protein synthesis (including albumin and clotting factors)."
    },
    {
      topic: "Skin, Sweating & Goosebumps",
      keywords: ["skin", "sweat", "sweating", "goosebumps", "scab", "healing"],
      kidsAnswer: "Your skin protects you like a waterproof coat! When you get hot, your skin makes tiny drops of sweat that evaporate and cool you down like a personal air conditioner. When you're cold, tiny muscles pull your hair up, making goosebumps!",
      adultAnswer: "The integumentary system consists of epidermis, dermis, and hypodermis. Eccrine sweat glands secrete hypotonic fluid for thermoregulation. Pilomotor reflex (goosebumps) contracts arrector pili muscles via sympathetic stimulation."
    },
    {
      topic: "Immunity & White Blood Cells",
      keywords: ["immune", "immunity", "white blood cells", "fever", "infection", "vaccine", "germs"],
      kidsAnswer: "Your white blood cells are superhero guards! When a germ tries to make you sick, these brave cells surround it, fight it, and make special shields called antibodies so that germ can never hurt you again! A mild fever is your body turning up the heat to melt germs away!",
      adultAnswer: "The immune system divides into innate (neutrophils, macrophages, complement) and adaptive branches (B cells, CD4+ and CD8+ T cells). Fevers are driven by endogenous pyrogens (IL-1, TNF-alpha) shifting the hypothalamic set-point to suppress viral/bacterial replication."
    }
  ]
};

// Export for browser global or module environment
if (typeof window !== "undefined") {
  window.HEALTH_DATASETS = HEALTH_DATASETS;
}
if (typeof module !== "undefined" && module.exports) {
  module.exports = HEALTH_DATASETS;
}
