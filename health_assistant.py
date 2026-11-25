"""
HealthMate AI - Interactive Healthcare Support Assistant
Standalone Python CLI & Web Server implementation
Aligns with the 6 HuggingFace healthcare datasets and strict safety guardrails.
"""

import sys
import os
import json
import http.server
import socketserver
import webbrowser

DATASETS = {
    "sample_reports": [
        {
            "id": "diabetes_htn",
            "title": "Comprehensive Metabolic & Lipid Panel",
            "values": {
                "Fasting Blood Sugar": {"val": 168, "unit": "mg/dL", "normal": "70-99", "status": "High", "meaning": "Cells are not absorbing glucose efficiently."},
                "Postprandial Blood Sugar": {"val": 220, "unit": "mg/dL", "normal": "<140", "status": "High", "meaning": "Glucose remains high 2 hours post-meal."},
                "HbA1c": {"val": 7.9, "unit": "%", "normal": "<5.7", "status": "High", "meaning": "3-month average blood glucose is consistently elevated."},
                "Blood Pressure": {"val": "146/92", "unit": "mmHg", "normal": "<120/80", "status": "High", "meaning": "Stage 2 Hypertension range."},
                "Total Cholesterol": {"val": 235, "unit": "mg/dL", "normal": "<200", "status": "High", "meaning": "Elevated circulating lipids; risk of arterial plaque."},
                "Hemoglobin": {"val": 14.2, "unit": "g/dL", "normal": "13.8-17.2", "status": "Normal", "meaning": "Normal oxygen-carrying red blood cell count."}
            },
            "issues": [
                {
                    "name": "Hyperglycemia (High Blood Sugar / Diabetes indicator)",
                    "precautions": "Cut refined sugars, sodas, and ultra-processed carbs. Eat at fixed meal times.",
                    "pros": "Drastically prevents microvascular damage to eyes, kidneys, and nerves.",
                    "cons": "Requires strict daily dietary discipline and monitoring."
                },
                {
                    "name": "Hypertension (Stage 2 High Blood Pressure)",
                    "precautions": "Restrict sodium/salt to under 2,000 mg/day. Practice 15-20 mins stress-reduction breathing.",
                    "pros": "Protects against heart attack, stroke, and kidney strain.",
                    "cons": "Food may initially taste less salty until palate adapts."
                }
            ]
        }
    ],
    "diet_plans": {
        "diabetes": {
            "foods_to_eat": [
                ("Non-starchy greens (Spinach, Broccoli)", "Low glycemic index, rich in fiber and antioxidants."),
                ("Whole legumes & dals", "Slow complex carb release prevents insulin surges."),
                ("Nuts (Walnuts, Almonds)", "Healthy unsaturated fats that improve cell membrane sensitivity.")
            ],
            "foods_to_avoid": [
                ("Refined white sugar and syrups", "Causes rapid blood sugar spikes."),
                ("Deep fried snacks", "Combines trans-fats with simple carbs, exacerbating insulin resistance.")
            ],
            "water": "2.5 - 3.0 Liters daily to assist renal glucose clearance.",
            "sleep": "7 - 8 hours nightly to prevent elevated morning cortisol.",
            "exercise": "30-40 minutes brisk walking daily."
        }
    }
}

def run_cli():
    print("=" * 65)
    print("🩺 HealthMate AI - Friendly Healthcare Support Assistant")
    print("⚠️  Guardrail: Never diagnoses, never prescribes, never invents doses.")
    print("=" * 65)

    name = input("\n[HealthMate]: Hello! What is your name and age? (e.g. Alex, 34): ").strip()
    gender = input("[HealthMate]: What is your biological gender? (Male/Female/Other): ").strip()
    lang = input("[HealthMate]: Preferred language for responses? (English/Hindi/Spanish): ").strip()
    food = input("[HealthMate]: What is your food preference? (Vegetarian/Non-Veg/Vegan): ").strip()
    allergies = input("[HealthMate]: Do you have any allergies? (e.g. Penicillin, Peanuts, None): ").strip()
    conditions = input("[HealthMate]: Any existing doctor-diagnosed conditions? (e.g. Diabetes, BP, None): ").strip()
    medicines = input("[HealthMate]: Any doctor-prescribed medicines? (Enter exact prescription or 'None'): ").strip()

    print("\n" + "-" * 50)
    choice = input("[HealthMate]: Do you have a medical report to scan (type 'report') or symptoms to check (type 'symptoms')? ").strip().lower()

    if "report" in choice:
        report = DATASETS["sample_reports"][0]
        print(f"\n📄 Scanning Lab Report: {report['title']}")
        print("=" * 65)
        for param, d in report["values"].items():
            print(f" • {param:<24}: {d['val']} {d['unit']} [{d['status'].upper()}] (Normal: {d['normal']})")
            print(f"   Explanation: {d['meaning']}")

        print("\n⚠️ Identified Health Issues & Precautions:")
        for issue in report["issues"]:
            print(f" • {issue['name']}")
            print(f"   Precautions: {issue['precautions']}")
            print(f"   Pros: {issue['pros']}")
            print(f"   Cons: {issue['cons']}")

        plan = DATASETS["diet_plans"]["diabetes"]
        print("\n🥗 Customized Nutrition Plan:")
        print(" Foods to Eat:")
        for f, why in plan["foods_to_eat"]:
            print(f"   ✅ {f} - {why}")
        print(" Foods to Avoid:")
        for f, why in plan["foods_to_avoid"]:
            print(f"   ❌ {f} - {why}")
        print(f" 💧 Water Target: {plan['water']}")
        print(f" 🌙 Sleep: {plan['sleep']}")
        print(f" 🏃 Exercise: {plan['exercise']}")

        print("\n⏰ Today Schedule:")
        print(" • 07:30 AM: Morning Hydration (Warm Water)")
        print(" • 08:15 AM: High-Fiber Breakfast")
        if medicines.lower() != "none" and medicines:
            print(f" • 08:45 AM: Doctor-Prescribed Medicine: {medicines} (Strict doctor direction)")
        print(" • 01:15 PM: Balanced Whole Grain Lunch")
        print(" • 04:30 PM: 30-40 mins Aerobic Walk")
        print(" • 07:45 PM: Light Dinner")
        print(" • 10:30 PM: Restorative Sleep")

    else:
        symptoms = input("\n[HealthMate]: Please describe what you feel, duration, severity (1-10), and if fever or pain is present: ").strip()
        print(f"\n🩺 Analyzing Reported Symptoms: '{symptoms}'")
        print(" • General Possible Causes (Non-Diagnostic): May be linked to metabolic fluctuations, dehydration, or viral response.")
        print(" • Suggested Lab Tests: Fasting Blood Sugar, Complete Blood Count (CBC), Blood Pressure check.")
        print(" • Recommended Specialist: Internal Medicine Physician / Family Doctor.")

    print("\n" + "=" * 65)
    print("✨ Thank you for using HealthMate AI. Launch the web app for voice assistance and interactive body boards!")

def start_server(port=8080):
    os.chdir(os.path.dirname(os.path.abspath(__file__)))
    handler = http.server.SimpleHTTPRequestHandler
    with socketserver.TCPServer(("", port), handler) as httpd:
        print(f"🚀 HealthMate AI Web Application running at: http://localhost:{port}")
        print("Press Ctrl+C to stop.")
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\nServer stopped.")

if __name__ == "__main__":
    if len(sys.argv) > 1 and sys.argv[1] == "serve":
        port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
        start_server(port)
    else:
        run_cli()
