# 🚨 SnapFix: AI-Powered Civic Tech Command Center

![SnapFix Dashboard](./assets/snapfix-dashboard.png)

> **Snap a photo, let AI detect the hazard, and auto-dispatch official complaints to the Government.**

Cities across developing regions are facing extreme infrastructural breakdowns—from open garbage dumps and severe waterlogging to frequent power grid failures. **SnapFix** is an AI-powered geospatial platform built to bridge the gap between citizens and municipal authorities by turning unverified complaints into actionable, AI-verified, and auto-dispatched civic data.

---

## ✨ Key Features

* 👁️ **Vision-First AI Verification:** Powered by Gemini 1.5 Flash Vision API. It strictly analyzes image pixels to verify real-world hazards and ignores misleading text, preventing spam.
* ⚡ **Action Engine 2.0:** Doesn't just map problems—it solves them. Automatically drafts professional legal grievances and tags specific municipal authorities on X (Twitter).
* 📡 **Global Crisis Radar:** A geospatial dashboard using Leaflet and Esri imagery to highlight high-vulnerability infrastructure hotspots globally.
* 📱 **SMS Deep-Link Fallback:** Generates exact GPS coordinates and short-codes for offline SMS dispatch in low-connectivity (Tier-2/Tier-3) regions.
* 🎮 **Civic Karma (Gamification):** Rewards users with "Hero Points" via smooth GSAP micro-interactions for escalating verified issues.

---

## 🛠️ Tech Stack

* **Frontend:** Next.js, React, Tailwind CSS
* **Mapping:** React-Leaflet, Esri Satellite Tiles, OpenStreetMap (Nominatim API)
* **AI & Backend:** Gemini 1.5 Flash Vision API
* **Animations:** GSAP (GreenSock)

---

## 🚀 How It Works

1. **Snap & Upload:** A citizen uploads a photo of a local civic issue (pothole, garbage dump, broken streetlight).
2. **AI Assessment:** The Gemini Vision API processes the image, authenticates the hazard, and predicts an ETA for resolution.
3. **Geospatial Mapping:** The issue is plotted accurately on the global radar map.
4. **Auto-Dispatch:** The user clicks to auto-tweet or email the drafted grievance directly to the responsible local authority, earning Civic Points in the process.

---

## 💻 Local Setup & Installation

If you want to run SnapFix locally, follow these steps:

**1. Clone the repository**
```bash
git clone [https://github.com/LIYAQAT1101/SnapFix.git](https://github.com/LIYAQAT1101/SnapFix.git)
cd SnapFix
