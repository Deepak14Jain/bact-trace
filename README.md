# Bact-Trace 🦠
> **The Offline AI Lab for the Last Mile.**

![Build Status](https://img.shields.io/badge/build-passing-brightgreen) ![Azure](https://img.shields.io/badge/cloud-Azure-blue) ![License](https://img.shields.io/badge/license-MIT-green)

## 🚨 The Problem
Antimicrobial Resistance (AMR) is the "Silent Pandemic," projected to kill 10 million people by 2050. Rural doctors lack the diagnostic tools to differentiate between **Viral** and **Bacterial** infections, leading to massive antibiotic misuse.

## 💡 The Solution
Bact-Trace is a multimodal, offline-first AI diagnostic tool that runs on a standard smartphone:
1.  **Audio Analysis:** Uses **Azure OpenAI** to detect respiratory biomarkers (wheezing/crackles) from cough sounds.
2.  **Visual Analysis:** Uses **Azure AI Vision** to detect throat inflammation and exudates.
3.  **Geospatial Tracking:** Syncs outbreak data to a Spring Boot backend when connectivity is restored.

## 🏗️ Architecture
![Architecture Diagram](./docs/architecture.png)

* **Brain:** Python (FastAPI) + Azure OpenAI + Librosa
* **Body:** Java (Spring Boot) + Azure SQL
* **Edge:** Dockerized Microservices

## 🚀 Getting Started

### Prerequisites
* Docker & Docker Compose
* Azure OpenAI API Key

### Installation
```bash
git clone [https://github.com/TeamBioSentinel/bact-trace.git](https://github.com/TeamBioSentinel/bact-trace.git)
cd bact-trace
# Create your .env file
cp .env.example .env
# Launch
docker-compose up --build