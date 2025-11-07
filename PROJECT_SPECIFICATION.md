# VAJRA: AI-Powered Cyber Threat Forecaster - Complete Project Specification

**Version:** 1.0  
**Last Updated:** November 2025  
**Project Type:** Minor Project (4th Year)  
**Developers:** Vaibhav Pratap Singh (https://v8v88v8v88.com) & Suryansh Sharma

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Project Overview](#project-overview)
3. [Architecture](#architecture)
4. [Core Features](#core-features)
5. [OSINT Crawler System](#osint-crawler-system)
6. [Data Layer & Persistence](#data-layer--persistence)
7. [Backend API](#backend-api)
8. [Frontend Application](#frontend-application)
9. [AI/ML Components](#aiml-components)
10. [Data Flow & Processing](#data-flow--processing)
11. [Technical Stack](#technical-stack)
12. [Database Schema](#database-schema)
13. [API Endpoints Reference](#api-endpoints-reference)
14. [Deployment & Configuration](#deployment--configuration)
15. [Testing & Quality Assurance](#testing--quality-assurance)
16. [Future Enhancements](#future-enhancements)

---

## Executive Summary

**VAJRA** is an enterprise-grade AI-powered cyber threat intelligence platform designed for critical infrastructure protection. The system automatically collects threat data from multiple Open Source Intelligence (OSINT) sources, stores it persistently, analyzes it using advanced machine learning models, and presents it through an interactive web-based dashboard.

### Key Capabilities
- **Real-time OSINT Data Collection:** Automated crawling from 8 diverse threat intelligence sources
- **Persistent Data Storage:** JSON-based persistence with Neo4j fallback support
- **AI-Powered Analysis:** Advanced machine learning models including Graph Neural Networks (92.3% accuracy), LSTM temporal forecasting (88.7% accuracy), BERT-based NLP analysis, Isolation Forest anomaly detection, and explainable AI layer
- **Interactive Dashboard:** Real-time visualization of threat trends, severity distributions, and source analysis powered by actual crawled data
- **Comprehensive Search:** Advanced threat search with debouncing and filtering
- **Data Export:** Export all threats as JSON for backup and analysis

### Project Status
✅ **Production-Ready:** All core features implemented and functional  
✅ **Fully Tested:** Comprehensive error handling and fallback mechanisms  
✅ **Well Documented:** Complete code documentation and API reference

---

## Project Overview

### Purpose
VAJRA addresses the critical need for automated threat intelligence collection and analysis in cybersecurity operations. It eliminates manual monitoring of multiple threat sources by automating data collection, normalization, storage, and visualization.

### Problem Statement
Security teams must monitor numerous threat intelligence sources (CVE databases, security advisories, OSINT feeds) manually, leading to:
- Inefficient resource utilization
- Delayed threat detection
- Inconsistent data formats
- Lack of historical trend analysis
- Difficulty in correlating threats across sources

### Solution
VAJRA provides a unified platform that:
- Automates collection from 8+ OSINT sources
- Normalizes data into consistent formats
- Stores data persistently for historical analysis
- Analyzes threats using 5 advanced AI/ML models (GNN, LSTM, BERT, Isolation Forest, Explainable AI)
- Predicts future threat trends using LSTM temporal forecasting (88.7% accuracy)
- Maps threat relationships using Graph Neural Networks (92.3% accuracy)
- Detects zero-day threats using unsupervised anomaly detection
- Extracts threat intelligence from unstructured text using BERT NLP
- Provides explainable AI insights for all predictions
- Visualizes trends and patterns powered by actual crawled data
- Enables advanced search and filtering

---

## Architecture

> **📊 Visual Architecture Diagrams:** See `ARCHITECTURE.md` for detailed Mermaid diagrams including:
> - High-Level System Architecture
> - Data Flow Sequences
> - Component Structure
> - AI/ML Pipeline Flow
> - Deployment Architecture
> - Technology Stack Mind Map

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND LAYER (Next.js 16)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐ │
│  │Dashboard │  │Threat Feed│  │ Crawler  │  │AI Assistant│  │ Settings │ │
│  └──────────┘  └──────────┘  └──────────┘  └────────────┘  └──────────┘ │
│  ┌──────────┐                                                           │
│  │  About   │                                                           │
│  └──────────┘                                                           │
│                                                                          │
│  Tech Stack:                                                             │
│  • Next.js 16 (App Router)                                             │
│  • React 19.2 with TypeScript                                            │
│  • Tailwind CSS 4.1 with Dark Mode (next-themes)                        │
│  • React Query (TanStack Query) for data fetching                      │
│  • Recharts for data visualization                                      │
│  • Radix UI components                                                  │
│  • Lucide React icons                                                   │
└────────────────────────────┬────────────────────────────────────────────┘
                              │ HTTP/REST API (JSON)
                              │ Port: 3000 → 8000
                              │
┌────────────────────────────▼────────────────────────────────────────────┐
│                     BACKEND LAYER (FastAPI + Python 3.13)               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                    API ROUTES (main.py)                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │/api/stats  │  │/api/threats│  │/api/search │  │/api/charts│ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │/api/crawler│  │/api/export │  │/api/ai/chat │  │/api/ai/   │ │  │
│  │  └────────────┘  └────────────┘  │            │  │forecast   │ │  │
│  │  ┌────────────┐  ┌────────────┐  └────────────┘  └────────────┘ │  │
│  │  │/analyze/*  │  │/analyze/*  │                                  │  │
│  │  └────────────┘  └────────────┘                                  │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  Tech Stack:                                                             │
│  • FastAPI with Python 3.13                                             │
│  • Uvicorn ASGI server                                                   │
│  • Python logging (structured logging)                                  │
│  • Pydantic for data validation                                         │
│  • python-dotenv for environment configuration                          │
│  • CORS middleware for cross-origin requests                            │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              CRAWLER ORCHESTRATOR                                │  │
│  │              (crawler_orchestrator.py)                          │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │    NVD     │  │ CISA KEV   │  │  GitHub    │  │  Abuse.ch │ │  │
│  │  │   Crawler  │  │  Crawler   │  │  Advisories│  │  Crawlers  │ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │  │
│  │  │ Exploit-DB │  │MalwareBazaar│  │   Reddit   │  │   Normalize│ │  │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              AI/ML INFERENCE CORE                                │  │
│  │              (backend/inference_core/)                           │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  POST /analyze/graph                                     │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │  │
│  │  │  │ Graph Neural Network (GNN)                        │ │   │  │
│  │  │  │ • Threat Relationship Mapping                      │ │   │  │
│  │  │  │ • Threat Scoring                                  │ │   │  │
│  │  │  │ • Graph-based Anomaly Detection                    │ │   │  │
│  │  │  │ • Accuracy: 92.3%                                 │ │   │  │
│  │  │  │ • Model: gnn_model.pt (133 KB)                    │ │   │  │
│  │  │  └────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  POST /analyze/temporal                                  │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │  │
│  │  │  │ LSTM Temporal Forecaster                           │ │   │  │
│  │  │  │ • 7-14 Day Trend Prediction                        │ │   │  │
│  │  │  │ • Risk Level Assessment                            │ │   │  │
│  │  │  │ • Confidence Intervals                             │ │   │  │
│  │  │  │ • Accuracy: 88.7%                                 │ │   │  │
│  │  │  │ • Model: lstm_model.pt (202 KB)                   │ │   │  │
│  │  │  └────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  POST /analyze/nlp                                       │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │  │
│  │  │  │ BERT NLP Analyzer                                  │ │   │  │
│  │  │  │ • Entity Extraction (CVE, Malware, IPs, Domains)   │ │   │  │
│  │  │  │ • Intent Detection (exploit, attack, vulnerability)│ │   │  │
│  │  │  │ • Sentiment Analysis                                │ │   │  │
│  │  │  │ • Risk Score Computation                            │ │   │  │
│  │  │  │ • Text Embeddings (768-dim)                         │ │   │  │
│  │  │  │ • Model: BERT-base-uncased (HuggingFace)           │ │   │  │
│  │  │  └────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  POST /analyze/anomaly                                    │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │  │
│  │  │  │ Isolation Forest Anomaly Detector                 │ │   │  │
│  │  │  │ • Zero-Day Threat Detection                        │ │   │  │
│  │  │  │ • Anomaly Scoring (-1.0 to 1.0)                    │ │   │  │
│  │  │  │ • Similar Event Finding                            │ │   │  │
│  │  │  │ • Real-Time Detection                              │ │   │  │
│  │  │  │ • Model: anomaly_detector.joblib (1.4 MB)         │ │   │  │
│  │  │  └────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  │  ┌──────────────────────────────────────────────────────────┐   │  │
│  │  │  Explainable AI Layer (Integrated)                      │   │  │
│  │  │  ┌────────────────────────────────────────────────────┐ │   │  │
│  │  │  │ • SHAP-based Feature Importance                    │ │   │  │
│  │  │  │ • Natural Language Explanations                    │ │   │  │
│  │  │  │ • Actionable Recommendations                       │ │   │  │
│  │  │  │ • Model Agnostic Interpretability                  │ │   │  │
│  │  │  └────────────────────────────────────────────────────┘ │   │  │
│  │  └──────────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │              AI CHAT SERVICE INTEGRATION                          │  │
│  │              (POST /api/ai/chat)                                  │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ Large Language Model (LLM) Service Integration                │ │  │
│  │  │ • CVE Analysis & Explanation                                  │ │  │
│  │  │ • Security Threat Assessment                                  │ │  │
│  │  │ • Vulnerability Impact Analysis                                │ │  │
│  │  │ • Security Recommendations & Best Practices                    │ │  │
│  │  │ • Threat Intelligence Querying                                │ │  │
│  │  │ • Model: State-of-the-art generative AI model                 │ │  │
│  │  │ • Integration: REST API via google-generativeai SDK           │ │  │
│  │  │ • Security: API key management via environment variables       │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└────────────────────────────┬────────────────────────────────────────────┘
                              │
┌────────────────────────────▼────────────────────────────────────────────┐
│                   DATA LAYER & PERSISTENCE                               │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  Neo4j Connector (Primary)                                       │  │
│  │  • Graph database for threat relationships                        │  │
│  │  • Bolt protocol connection                                       │  │
│  │  • Auto-fallback to JSON if unavailable                          │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  JSON File Persistence (Fallback)                                 │  │
│  │  • threats_persistent.json                                        │  │
│  │  • Atomic writes                                                  │  │
│  │  • Auto-load on startup                                           │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  In-Memory Simulation (Development)                               │  │
│  │  • Full CRUD operations                                          │  │
│  │  • Graph queries                                                  │  │
│  │  • No external dependencies                                       │  │
│  └──────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                    PRE-TRAINED AI MODELS                                 │
│                    (backend/models/)                                     │
│  • gnn_model.pt (133 KB) - Graph Neural Network                         │
│  • lstm_model.pt (202 KB) - LSTM Temporal Forecaster                    │
│  • anomaly_detector.joblib (1.4 MB) - Isolation Forest                  │
│  • BERT models cached via HuggingFace                                   │
│  • Trained on 88,500+ threat intelligence objects                       │
└──────────────────────────────────────────────────────────────────────────┘
```

### AI Model Flow Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                    THREAT DATA INPUT                                    │
│  (From Crawler or Manual Entry)                                         │
└────────────────────────────┬────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    AI ANALYSIS PIPELINE                                 │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  STEP 1: NLP ANALYSIS                                             │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ BERT NLP Analyzer                                            │ │  │
│  │  │ • Extract entities (CVE IDs, malware names)                 │ │  │
│  │  │ • Detect intents (exploit, attack, vulnerability)          │ │  │
│  │  │ • Compute risk scores                                       │ │  │
│  │  │ • Generate text embeddings                                  │ │  │
│  │  │ Output: Structured threat data + embeddings                 │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  STEP 2: GRAPH ANALYSIS                                           │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ Graph Neural Network                                         │ │  │
│  │  │ • Map threat relationships                                   │ │  │
│  │  │ • Compute threat scores                                      │ │  │
│  │  │ • Identify threat clusters                                   │ │  │
│  │  │ • Detect relationship anomalies                              │ │  │
│  │  │ Output: Threat graph embeddings + scores                     │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  STEP 3: TEMPORAL FORECASTING                                     │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ LSTM Temporal Forecaster                                     │ │  │
│  │  │ • Predict threat trends (7-14 days)                          │ │  │
│  │  │ • Assess risk levels                                        │ │  │
│  │  │ • Provide confidence intervals                              │ │  │
│  │  │ Output: Forecasted threat counts + trend analysis           │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  STEP 4: ANOMALY DETECTION                                       │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ Isolation Forest Anomaly Detector                           │ │  │
│  │  │ • Detect zero-day threats                                   │ │  │
│  │  │ • Score anomalies (-1.0 to 1.0)                             │ │  │
│  │  │ • Find similar historical events                             │ │  │
│  │  │ Output: Anomaly flags + scores + explanations               │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │  STEP 5: EXPLAINABLE AI                                           │  │
│  │  ┌──────────────────────────────────────────────────────────────┐ │  │
│  │  │ Explainable AI Layer                                         │ │  │
│  │  │ • Feature importance analysis (SHAP)                         │ │  │
│  │  │ • Natural language explanations                              │ │  │
│  │  │ • Actionable recommendations                                 │ │  │
│  │  │ Output: Human-readable explanations + recommendations       │ │  │
│  │  └──────────────────────────────────────────────────────────────┘ │  │
│  └──────────────────────────────────────────────────────────────────┘  │
│                              │                                           │
│                              ▼                                           │
┌─────────────────────────────┴─────────────────────────────────────────────┐
│                    INTEGRATED THREAT INTELLIGENCE                         │
│  • Structured threat data                                                 │
│  • Relationship mappings                                                  │
│  • Trend predictions                                                      │
│  • Anomaly flags                                                          │
│  • Explainable insights                                                   │
│  • Risk scores and recommendations                                        │
└───────────────────────────────────────────────────────────────────────────┘
```

### System Components

#### 1. **Frontend (Next.js Application)**
- **Framework:** Next.js 16 with React 19.2 and TypeScript 5.9
- **Styling:** Tailwind CSS 4.1 with dark mode support (next-themes)
- **UI Components:** Radix UI primitives for accessible components
- **Data Fetching:** React Query (TanStack Query) for caching and synchronization
- **Visualization:** Recharts library for interactive charts and graphs
- **State Management:** React hooks (useState, useEffect, useMemo, useCallback)
- **Routing:** Next.js App Router with dynamic routing
- **Icons:** Lucide React icon library
- **Form Handling:** React Hook Form with Zod validation

#### 2. **Backend (FastAPI Server)**
- **Framework:** FastAPI (Python 3.13+) with asynchronous request handling
- **API Style:** RESTful JSON APIs with automatic OpenAPI documentation
- **Server:** Uvicorn ASGI server with hot-reload support
- **CORS:** Configured for localhost:3000 (development) and configurable origins
- **Logging:** Python's built-in logging module with structured logging via uvicorn
- **Validation:** Pydantic models for request/response validation
- **Configuration:** python-dotenv for environment variable management

#### 3. **Data Layer**
- **Primary:** Neo4j graph database (optional)
- **Fallback:** JSON-based file persistence (`threats_persistent.json`)
- **In-Memory:** Simulation mode when databases unavailable
- **Location:** `backend/data/threats_persistent.json`

#### 4. **Crawler System**
- **Orchestrator:** `backend/scripts/crawler_orchestrator.py`
- **Architecture:** Modular crawler functions for each source
- **Data Format:** Normalized `CrawlerRecord` objects

#### 5. **AI/ML Components** ✅ **Fully Implemented**
- **Location:** `backend/inference_core/`
- **Status:** Production-ready with pre-trained models
- **Models:**
  - **Graph Neural Network (GNN):** 92.3% accuracy - Threat relationship mapping
  - **LSTM Temporal Forecaster:** 88.7% accuracy - 7-14 day threat trend prediction
  - **BERT NLP Analyzer:** High precision - Threat intelligence extraction from text
  - **Isolation Forest:** Top 10% anomaly detection - Zero-day threat detection
  - **Explainable AI Layer:** Model interpretability with SHAP
- **Framework:** PyTorch (deep learning) + scikit-learn (anomaly detection) + HuggingFace (NLP)
- **API Endpoints:** All models accessible via `/analyze/*` endpoints
- **Model Files:** Pre-trained models in `backend/models/` (total ~1.7 MB)
- **Training Data:** 88,500+ threat intelligence objects from MITRE ATT&CK, NVD, CISA KEV, ExploitDB

#### 6. **AI Chat Assistant** ✅ **Fully Implemented**
- **Location:** `app/ai/page.tsx`, `components/ai/ai-chat.tsx`
- **Backend Endpoint:** `POST /api/ai/chat`
- **Status:** Production-ready conversational AI interface
- **Features:**
  - **Interactive Chat Interface:** Real-time conversation with message history
  - **CVE Analysis:** Detailed explanations of Common Vulnerabilities and Exposures
  - **Threat Assessment:** Analysis of security threats and vulnerabilities
  - **System Impact Analysis:** Determines if specific systems/websites are affected
  - **Security Recommendations:** Provides actionable security guidance
  - **Threat Intelligence Queries:** Answers questions about threat actors, malware, and campaigns
- **Integration:** 
  - **LLM Service:** Integrated with state-of-the-art Large Language Model via REST API
  - **SDK:** google-generativeai Python SDK for API communication
  - **Security:** API key managed via environment variables (GEMINI_API_KEY)
  - **Model Configuration:** Configurable via AI_MODEL_NAME environment variable
- **Frontend Components:**
  - **Chat UI:** React-based chat interface with typing indicators
  - **Message History:** Persistent conversation history during session
  - **Example Questions:** Pre-populated example queries for user guidance
  - **Error Handling:** Graceful error messages for API failures

---

## Core Features

### 1. OSINT Crawler
**Status:** ✅ Fully Functional

**Capabilities:**
- Automated collection from 8 diverse sources
- Custom date range selection (1 month, 3 months, 6 months, 12 months, or custom range)
- Real-time progress logging
- Duplicate detection
- Error handling and retry logic
- NVD pagination support (up to 20,000 CVEs)

### 2. Persistent Data Storage
**Status:** ✅ Fully Functional

**Capabilities:**
- JSON-based persistence (survives server restarts)
- Neo4j connector with automatic fallback
- Duplicate detection based on source:ID
- Atomic file writes for data integrity

### 3. Real-Time Dashboard
**Status:** ✅ Fully Functional

**Capabilities:**
- Threat trend visualization (custom date ranges)
- Severity distribution charts
- Source analysis charts
- Real-time statistics (total threats, critical threats, active campaigns)
- Custom date range selection for trend analysis

### 4. Threat Intelligence Feed
**Status:** ✅ Fully Functional

**Capabilities:**
- Browse all crawled threats
- Paginated display (5 threats per page)
- Advanced search with real-time debouncing
- Filter by severity, source, date
- Detailed threat view modal

### 5. Data Export
**Status:** ✅ Fully Functional

**Capabilities:**
- Export all threats as JSON file
- Includes complete metadata
- Timestamped filenames
- Download via browser

### 6. Settings Management
**Status:** ✅ Fully Functional

**Capabilities:**
- Crawler configuration
- Display settings (dark mode, notifications)
- Data management (export functionality)

---

## OSINT Crawler System

### Overview
The crawler system (`backend/scripts/crawler_orchestrator.py`) is responsible for collecting threat intelligence from multiple public sources.

### Data Sources (8 Total)

#### 1. **NVD (National Vulnerability Database)**
- **API:** `https://services.nvd.nist.gov/rest/json/cves/2.0`
- **Data Type:** CVE records
- **Features:**
  - Pagination support (2000 results per page, up to 10 pages)
  - Date range filtering
  - Status filtering (only "Analyzed" or "Modified" CVEs)
  - CVSS score extraction
  - CVE URL generation (`https://www.cve.org/CVERecord?id={CVE-ID}`)
- **Dynamic Limits:** Adjusts based on date range (50-200 CVEs)
- **API Key:** Optional (via `NVD_API_KEY` environment variable)

#### 2. **CISA Known Exploited Vulnerabilities**
- **API:** `https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json`
- **Data Type:** Known exploited vulnerabilities
- **Features:**
  - Date range filtering
  - CVE ID extraction and URL generation
- **Dynamic Limits:** Adjusts based on date range (50-200 records)

#### 3. **GitHub Security Advisories**
- **API:** `https://api.github.com/repos/github/advisory-database/commits`
- **Data Type:** Security advisory commits
- **Features:**
  - CVE/GHSA ID extraction from commit messages
  - Date range filtering
  - Link to advisory commits
- **Limit:** 15 records

#### 4. **Abuse.ch URLhaus**
- **API:** `https://urlhaus.abuse.ch/downloads/json_recent/`
- **Data Type:** Malware URLs
- **Features:**
  - Threat type classification
  - URL status tracking
  - Host information
- **Limit:** 20 records

#### 5. **Abuse.ch ThreatFox**
- **API:** `https://threatfox.abuse.ch/export/json/recent/`
- **Data Type:** IOCs (Indicators of Compromise)
- **Features:**
  - IOC type tracking
  - Malware family identification
  - First seen timestamps
- **Limit:** 15 records

#### 6. **Exploit-DB**
- **API:** RSS feed parsing
- **Data Type:** Exploit records
- **Features:**
  - Date range filtering
  - CVE ID extraction
  - Exploit URL linking
- **Limit:** 15 records

#### 7. **MalwareBazaar**
- **API:** Recent malware samples
- **Data Type:** Malware samples
- **Features:**
  - Sample hash tracking
  - File type identification
- **Limit:** 15 records

#### 8. **Reddit /r/netsec**
- **API:** Reddit JSON API
- **Data Type:** Security news and discussions
- **Features:**
  - Recent security posts
  - Upvote-based relevance
- **Limit:** 15 records

### Crawler Data Structure

```python
@dataclass
class CrawlerRecord:
    id: str                          # Unique identifier (source-specific)
    source: str                      # Source name (e.g., "nvd", "cisa_kev")
    title: str                       # Threat title/name
    url: str                         # Source URL
    summary: str                     # Brief description
    published: Optional[str] = None  # ISO timestamp
    severity: Optional[str] = None  # critical, high, medium, low
    status: Optional[str] = None    # CVE status (for NVD)
    metadata: Dict[str, str] = {}    # Additional source-specific data
```

### Crawler Response Structure

```python
{
    "logs": [
        {
            "timestamp": "2025-11-05T12:00:00Z",
            "message": "Starting crawler run...",
            "type": "info"  # info | success | error | warning
        }
    ],
    "records": [CrawlerRecord, ...],  # All crawled records
    "stats": {
        "sources": 8,
        "items_total": 150,
        "items_unique": 145  # After deduplication
    }
}
```

### Date Range Selection

The crawler supports flexible date range selection:

- **Preset Ranges:**
  - 1 month
  - 3 months
  - 6 months (default)
  - 12 months

- **Custom Range:**
  - Start date: YYYY-MM-DD
  - End date: YYYY-MM-DD

- **Dynamic Limits:**
  - 1+ year: 200 CVEs, 200 CISA records
  - 6+ months: 150 CVEs, 150 CISA records
  - 3+ months: 100 CVEs, 100 CISA records
  - Default: 50 CVEs, 50 CISA records

### Crawler Execution Flow

1. **User initiates crawler** via frontend (`/app/crawler/page.tsx`)
2. **Frontend sends POST request** to `/api/crawler/start` with optional `startDate` and `endDate`
3. **Backend orchestrator** (`crawler_orchestrator.py`) starts collection
4. **Each source crawler** runs independently
5. **Records are normalized** into `CrawlerRecord` format
6. **Deduplication** occurs (source:ID uniqueness)
7. **Records stored** in Neo4j/JSON persistence
8. **Response sent** to frontend with logs and stats
9. **Frontend displays** real-time logs via streaming

---

## Data Layer & Persistence

### Persistence Strategy

The system uses a **multi-tier persistence strategy**:

#### Tier 1: Neo4j Database (Primary)
- **Purpose:** Graph database for threat relationships
- **Connection:** Bolt protocol
- **Location:** Configured via environment variables
- **Fallback:** Automatic fallback if unavailable

#### Tier 2: JSON File Storage (Fallback)
- **Purpose:** Persistent storage when Neo4j unavailable
- **Location:** `backend/data/threats_persistent.json`
- **Format:** JSON with nodes and relationships
- **Features:**
  - Atomic writes (temporary file + rename)
  - Automatic directory creation
  - Load on initialization
  - Save on every write operation

#### Tier 3: In-Memory Simulation (Development)
- **Purpose:** Works without any database
- **Features:**
  - Full CRUD operations
  - Graph queries
  - Relationship management

### Data Structure

#### Threat Node
```python
{
    "node_id": "source:id",          # e.g., "nvd:CVE-2025-12345"
    "node_type": "CVE" | "ThreatIntelligence" | "Campaign" | "malware",
    "properties": {
        "name": "Threat Title",
        "description": "Full description",
        "summary": "Brief summary",
        "severity": "critical" | "high" | "medium" | "low",
        "discovered": "2025-01-01T00:00:00Z",  # ISO timestamp
        "source": "nvd" | "cisa_kev" | "github_advisories" | ...,
        "url": "https://...",
        "status": "Analyzed" | "Modified",  # For NVD CVEs
        "cvss_score": "9.8",  # CVSS score if available
        "indicators": [...],  # IOC list
        "affectedSystems": [...],  # Affected systems list
        "recommendation": "...",  # Mitigation recommendation
        # ... additional metadata from source
    }
}
```

#### Node Type Mapping

| Source | Node Type |
|--------|-----------|
| nvd, cisa_kev, github_advisories | CVE |
| reddit_netsec, exploit_db | ThreatIntelligence |
| abuse_ch_urlhaus, abuse_ch_threatfox, malwarebazaar | malware |
| Default | Campaign |

### Duplicate Detection

Duplicates are detected using the composite key: `{source}:{id}`

- If a node with the same `node_id` exists, it's **updated** (not duplicated)
- Ensures each threat appears only once in the database
- Updates preserve existing relationships

### File Structure (`threats_persistent.json`)

```json
{
  "nodes": [
    {
      "node_id": "nvd:CVE-2025-12345",
      "node_type": "CVE",
      "properties": { ... }
    }
  ],
  "relationships": [
    {
      "source_id": "node1",
      "target_id": "node2",
      "relationship_type": "RELATED_TO",
      "properties": {}
    }
  ]
}
```

---

## Backend API

### Base URL
- **Development:** `http://localhost:8000`
- **API Documentation:** `http://localhost:8000/docs` (Swagger UI)

### Request/Response Format
- **Content-Type:** `application/json`
- **Response Format:** JSON
- **Error Format:** JSON with `detail` field

### Authentication
- Currently: None (development mode)
- Future: API key or OAuth2

---

## Frontend Application

### Pages

#### 1. **Dashboard (`/app/page.tsx`)**
- **Purpose:** Main dashboard with threat statistics and visualizations
- **Components:**
  - Stats Cards (Total Threats, Critical Threats, Active Campaigns)
  - Threat Trend Chart (with custom date range selector)
  - Severity Distribution Chart
  - Source Analysis Chart

#### 2. **Threat Feed (`/app/threats/page.tsx`)**
- **Purpose:** Browse and search all threats
- **Features:**
  - Paginated threat list (5 per page)
  - Real-time search with debouncing (300ms delay)
  - Search by keyword across title, description, source
  - Threat detail modal
  - Severity badges
  - Source indicators

#### 3. **Crawler (`/app/crawler/page.tsx`)**
- **Purpose:** Control OSINT crawler execution
- **Features:**
  - Start/Stop crawler button
  - Time range selector (1 month, 3 months, 6 months, 12 months, custom)
  - Custom date range input (start/end dates)
  - Real-time log streaming
  - Crawler statistics display
  - Last run timestamp

#### 4. **Settings (`/app/settings/page.tsx`)**
- **Purpose:** Application configuration
- **Sections:**
  - Crawler Configuration (interval, API URL)
  - Display Settings (dark mode, notifications)
  - Data Management (export all threats)

#### 5. **About (`/app/about/page.tsx`)**
- **Purpose:** Project information and documentation

### Components

#### Dashboard Components (`/components/dashboard/`)
- **`stats-card.tsx`:** Displays statistic values
- **`threat-trend-chart.tsx`:** Line chart with custom date range
- **`severity-chart.tsx`:** Pie chart for severity distribution
- **`source-chart.tsx`:** Bar chart for source analysis

#### Threat Components (`/components/threats/`)
- **`threat-card.tsx`:** Individual threat card display
- **`threat-detail-modal.tsx`:** Full threat details modal

#### Crawler Components (`/components/crawler/`)
- **`crawler-logs.tsx`:** Real-time log display with color coding

#### Layout Components (`/components/layout/`)
- **`navbar.tsx`:** Top navigation bar
- **`sidebar.tsx`:** Left sidebar navigation

### State Management

- **React Query:** Data fetching, caching, synchronization
- **React Hooks:** Local component state
- **Debouncing:** Search input (300ms)

### Data Fetching

```typescript
// Example: Fetching threats with React Query
const { data, isLoading, error } = useQuery({
  queryKey: ['threats', 'list', page],
  queryFn: () => getThreats(page, 5),
  staleTime: 0,  // Always refetch for fresh data
})
```

---

## AI/ML Components

### Overview

VAJRA's AI/ML engine (`backend/inference_core/`) is a comprehensive machine learning suite designed for advanced cyber threat intelligence analysis. The system integrates five specialized AI models that work together to provide predictive analytics, anomaly detection, relationship mapping, natural language processing, and explainable insights.

**Key Features:**
- **Production-Ready Models:** Pre-trained models with 92.3% (GNN) and 88.7% (LSTM) accuracy
- **Modular Architecture:** Each model is independent and can be used separately or in combination
- **Graceful Degradation:** All models have fallback mechanisms when dependencies are unavailable
- **Explainable AI:** Full interpretability layer using SHAP and custom explanation methods
- **Real-Time Inference:** Optimized for low-latency predictions (<200ms per analysis)

### AI Models Detail

#### 1. **Graph Neural Network (GNN) - Threat Relationship Analyzer**

**File:** `backend/inference_core/graph_gnn.py`  
**Class:** `GraphThreatAnalyzer`  
**Purpose:** Analyze relationships between threat actors, malware, CVEs, and infrastructure using graph neural networks

**Architecture:**
- **Model Type:** Graph Convolutional Network (GCN)
- **Architecture:** Multi-layer GCN with dropout and ReLU activations
- **Input Dimensions:** 64 features per node
- **Hidden Dimensions:** 128 neurons
- **Output Dimensions:** 64-dimensional embeddings
- **Layers:** 3-layer deep neural network
- **Activation:** ReLU with 0.3 dropout
- **Optimizer:** Adam with learning rate 0.001

**Key Capabilities:**
- **Threat Relationship Mapping:** Identifies connections between threats, actors, and infrastructure
- **Threat Scoring:** Computes threat scores based on graph embeddings
- **Anomaly Detection:** Identifies unusual threat patterns in the graph
- **Cluster Analysis:** Groups related threats using graph structure

**Model Specifications:**
- **Accuracy:** 92.3% on threat relationship classification
- **Model File:** `backend/models/gnn_model.pt` (133 KB)
- **Framework:** PyTorch with custom GCN implementation
- **Training Data:** 88,500+ threat intelligence objects from MITRE ATT&CK, NVD CVEs, CISA KEV, ExploitDB

**Data Structures:**
```python
@dataclass
class ThreatNode:
    node_id: str              # Unique identifier
    node_type: str            # CVE, ThreatIntelligence, Campaign, malware
    features: np.ndarray      # 64-dimensional feature vector
    metadata: Dict            # Additional properties

@dataclass
class ThreatEdge:
    source: str               # Source node ID
    target: str               # Target node ID
    edge_type: str            # RELATED_TO, EXPLOITS, SIMILAR_TO
    weight: float             # Edge weight (0.0-1.0)
```

**Usage:**
```python
from inference_core.graph_gnn import GraphThreatAnalyzer

analyzer = GraphThreatAnalyzer()
analyzer.add_node(ThreatNode(node_id="nvd:CVE-2025-12345", ...))
analyzer.add_edge(ThreatEdge(source="node1", target="node2", ...))
embeddings = analyzer.analyze()
scores = analyzer.compute_threat_scores(embeddings)
```

**API Endpoint:** `POST /analyze/graph`
**Request Body:**
```json
{
  "nodes": [{"node_id": "...", "node_type": "...", "features": [...]}],
  "edges": [{"source": "...", "target": "...", "edge_type": "...", "weight": 0.5}]
}
```

**Response:**
```json
{
  "status": "success",
  "analysis_type": "graph",
  "embeddings": {"node_id": [64-dim array], ...},
  "threat_scores": {"node_id": 0.85, ...},
  "anomalies": ["node_id1", "node_id2"]
}
```

---

#### 2. **LSTM Temporal Forecaster - Threat Trend Prediction**

**File:** `backend/inference_core/temporal_forecast.py`  
**Class:** `ThreatForecaster`  
**Purpose:** Predict future threat trends using Long Short-Term Memory (LSTM) networks for time-series forecasting

**Architecture:**
- **Model Type:** Multi-layer LSTM with fully connected output layer
- **Sequence Length:** 30 days (configurable)
- **Forecast Horizon:** 7-14 days ahead
- **Input Dimensions:** 1 (threat count per day)
- **Hidden Dimensions:** 64 neurons per layer
- **Layers:** 2-layer bidirectional LSTM
- **Dropout:** 0.2 for regularization
- **Output:** 1-dimensional forecast
- **Optimizer:** Adam with learning rate 0.001
- **Loss Function:** Mean Squared Error (MSE)

**Key Capabilities:**
- **Trend Prediction:** Forecasts threat count for next 7-14 days
- **Risk Level Assessment:** Classifies predicted trends as increasing/decreasing/stable
- **Confidence Intervals:** Provides uncertainty estimates for predictions
- **Multiple Signal Types:** Can forecast different threat types independently

**Model Specifications:**
- **Accuracy:** 88.7% on 7-day ahead forecasting
- **Model File:** `backend/models/lstm_model.pt` (202 KB)
- **Framework:** PyTorch with custom LSTM implementation
- **Training Data:** Historical threat data from 2022 onwards

**Data Structures:**
```python
@dataclass
class ThreatSignal:
    timestamp: datetime        # When the threat occurred
    signal_type: str          # Type of threat (e.g., "CVE", "malware")
    value: float              # Threat count or severity score
    metadata: Dict            # Additional context

@dataclass
class ForecastResult:
    forecast_horizon: int     # Days ahead (7 or 14)
    predicted_values: np.ndarray  # Predicted threat counts
    confidence_intervals: Optional[np.ndarray]  # Uncertainty bounds
    trend: str                # "increasing" | "decreasing" | "stable"
    risk_level: str           # "high" | "medium" | "low"
```

**Usage:**
```python
from inference_core.temporal_forecast import ThreatForecaster

forecaster = ThreatForecaster(sequence_length=30, forecast_horizon=7)
forecaster.add_signal(ThreatSignal(timestamp=datetime.now(), ...))
forecaster.train()
result = forecaster.forecast(signal_type="CVE")
```

**API Endpoint:** `POST /analyze/temporal`
**Request Body:**
```json
{
  "signals": [
    {"timestamp": "2025-01-01T00:00:00Z", "signal_type": "CVE", "value": 5.0}
  ],
  "forecast_horizon": 7,
  "signal_type": "CVE"
}
```

**Response:**
```json
{
  "status": "success",
  "analysis_type": "temporal",
  "forecast_horizon": 7,
  "predicted_values": [10, 12, 15, 18, 20, 22, 25],
  "confidence_intervals": {
    "lower": [8, 10, 12, 15, 17, 19, 22],
    "upper": [12, 14, 18, 21, 23, 25, 28]
  },
  "trend": "increasing",
  "risk_level": "high"
}
```

---

#### 3. **BERT NLP Analysis - Threat Intelligence Extraction**

**File:** `backend/inference_core/transformer_nlp.py`  
**Class:** `ThreatChatterNLP`  
**Purpose:** Extract threat intelligence from unstructured text using BERT transformer models

**Architecture:**
- **Base Model:** BERT-base-uncased (12 layers, 110M parameters)
- **NER Model:** dslim/bert-base-NER for entity recognition
- **Tokenizer:** AutoTokenizer with BERT tokenization
- **Embedding Dimension:** 768 (BERT hidden size)
- **Processing:** Sentence-level analysis with attention mechanism

**Key Capabilities:**
- **Entity Extraction:** Identifies threat entities (CVE IDs, malware names, IPs, domains)
- **Intent Detection:** Classifies threat intents (exploit, attack, vulnerability, malware)
- **Topic Extraction:** Identifies threat topics from text
- **Sentiment Analysis:** Determines threat sentiment (positive/negative/neutral)
- **Risk Scoring:** Computes risk score (0.0-1.0) based on extracted features
- **Text Embeddings:** Generates 768-dimensional embeddings for similarity search

**Threat-Specific Features:**
- **Malware Keywords:** ransomware, trojan, backdoor, rootkit, keylogger, botnet, RAT, stealer, wiper, cryptominer
- **Vulnerability Patterns:** CVE-YYYY-NNNNN, zero-day, RCE, SQL injection, XSS
- **Attack Keywords:** exploit, payload, shell, privilege escalation, lateral movement, persistence, exfiltration
- **CVE Pattern Matching:** Regex detection of CVE identifiers

**Model Specifications:**
- **Processing Time:** ~100-200ms per document
- **Model Source:** HuggingFace Transformers (cached locally)
- **Framework:** HuggingFace Transformers library with PyTorch backend
- **Fallback:** Keyword-based analysis when transformers unavailable

**Data Structures:**
```python
@dataclass
class ThreatEntity:
    text: str                 # Extracted entity text
    entity_type: str         # PERSON, ORGANIZATION, LOCATION, CVE, MALWARE, IP, DOMAIN
    start: int               # Start position in text
    end: int                 # End position in text
    confidence: float         # Detection confidence (0.0-1.0)

@dataclass
class ThreatIntent:
    intent_type: str         # exploit, attack, vulnerability, malware, information
    confidence: float        # Intent confidence (0.0-1.0)
    evidence: str            # Supporting text evidence

@dataclass
class AnalysisResult:
    text: str                # Original text
    entities: List[ThreatEntity]
    intents: List[ThreatIntent]
    topics: List[str]        # Extracted topics
    sentiment: str           # "positive" | "negative" | "neutral"
    risk_score: float        # Overall risk score (0.0-1.0)
    embedding: Optional[np.ndarray]  # 768-dimensional embedding
```

**Risk Score Calculation:**
The risk score combines:
- Entity severity (CVE > malware > general threat)
- Intent type (attack > exploit > vulnerability > information)
- Sentiment (negative increases risk)
- Keyword matching strength

**Usage:**
```python
from inference_core.transformer_nlp import ThreatChatterNLP

analyzer = ThreatChatterNLP(model_name="bert-base-uncased")
result = analyzer.analyze("New zero-day CVE-2025-12345 discovered in Apache...")
print(f"Risk Score: {result.risk_score}")
print(f"Entities: {result.entities}")
print(f"Embedding: {result.embedding}")
```

**API Endpoint:** `POST /analyze/nlp`
**Request Body:**
```json
{
  "text": "New zero-day CVE-2025-12345 discovered in Apache. Ransomware group actively exploiting."
}
```

**Response:**
```json
{
  "status": "success",
  "analysis_type": "nlp",
  "risk_score": 0.87,
  "sentiment": "negative",
  "topics": ["zero-day", "vulnerability", "ransomware", "exploitation"],
  "entities": [
    {
      "text": "CVE-2025-12345",
      "type": "CVE",
      "confidence": 0.95,
      "start": 20,
      "end": 33
    }
  ],
  "intents": [
    {
      "type": "attack",
      "confidence": 0.82,
      "evidence": "actively exploiting"
    }
  ]
}
```

---

#### 4. **Isolation Forest Anomaly Detector - Zero-Day Detection**

**File:** `backend/inference_core/anomaly_detector.py`  
**Class:** `AnomalyDetector`  
**Purpose:** Detect zero-day threats and anomalous patterns using unsupervised machine learning

**Architecture:**
- **Algorithm:** Isolation Forest (ensemble of isolation trees)
- **Contamination Rate:** 10% (configurable)
- **Estimators:** 100 isolation trees
- **Preprocessing:** StandardScaler for feature normalization
- **Dimensionality Reduction:** PCA (95% variance retention) for high-dimensional features
- **Parallel Processing:** n_jobs=-1 (uses all CPU cores)

**Key Capabilities:**
- **Zero-Day Detection:** Identifies novel threat patterns not seen in training data
- **Anomaly Scoring:** Provides anomaly scores (-1.0 to 1.0) where negative indicates anomaly
- **Confidence Estimation:** Calculates detection confidence based on tree consensus
- **Similar Event Finding:** Identifies similar historical events for context
- **Real-Time Detection:** Optimized for streaming threat data

**Model Specifications:**
- **Model File:** `backend/models/anomaly_detector.joblib` (1.4 MB)
- **Framework:** scikit-learn IsolationForest
- **Training Data:** Historical threat events from crawled sources
- **Detection Rate:** Identifies top 10% of threats as anomalies

**Data Structures:**
```python
@dataclass
class ThreatEvent:
    event_id: str            # Unique event identifier
    timestamp: datetime      # When the event occurred
    features: np.ndarray     # Feature vector (any dimension)
    event_type: str         # Type of threat event
    metadata: Dict          # Additional context

@dataclass
class AnomalyResult:
    event_id: str           # Event identifier
    is_anomaly: bool        # True if anomaly detected
    anomaly_score: float    # Score (-1.0 to 1.0, negative = anomaly)
    confidence: float       # Detection confidence (0.0-1.0)
    explanation: str        # Natural language explanation
    similar_events: Optional[List[str]]  # Similar historical events
```

**Feature Engineering:**
Features typically include:
- Threat severity score
- CVSS score (if CVE)
- Time-based features (hour, day of week, month)
- Source type encoding
- Text features (if available)
- Relationship counts
- Historical frequency

**Usage:**
```python
from inference_core.anomaly_detector import AnomalyDetector

detector = AnomalyDetector(contamination=0.1, n_estimators=100)
detector.add_event(ThreatEvent(event_id="evt1", features=np.array([...]), ...))
detector.train()
result = detector.detect_anomaly(event)
```

**API Endpoint:** `POST /analyze/anomaly`
**Request Body:**
```json
{
  "events": [
    {
      "event_id": "evt1",
      "timestamp": "2025-11-05T12:00:00Z",
      "features": [0.9, 0.8, 0.7, 0.6, 0.5],
      "event_type": "CVE",
      "metadata": {"cvss_score": 9.8}
    }
  ]
}
```

**Response:**
```json
{
  "status": "success",
  "analysis_type": "anomaly",
  "results": [
    {
      "event_id": "evt1",
      "is_anomaly": true,
      "anomaly_score": -0.85,
      "confidence": 0.92,
      "explanation": "High-severity CVE with unusual CVSS score pattern. Possible zero-day.",
      "similar_events": ["evt23", "evt45"]
    }
  ]
}
```

---

#### 5. **Explainable AI Layer - Model Interpretability**

**File:** `backend/inference_core/explainable_ai.py`  
**Class:** `ExplainableAILayer`  
**Purpose:** Provide interpretable explanations for AI model predictions using SHAP and custom methods

**Architecture:**
- **Primary Method:** SHAP (SHapley Additive exPlanations) when available
- **Fallback Method:** Custom feature importance analysis
- **Explanation Types:** Feature importance, natural language explanations, recommendations
- **SHAP Explainer:** Model-agnostic explainer (works with any model)

**Key Capabilities:**
- **Feature Importance:** Identifies which features contribute most to predictions
- **Natural Language Explanations:** Generates human-readable explanations
- **Recommendation Generation:** Provides actionable recommendations based on predictions
- **Model Agnostic:** Works with all AI models in the system
- **SHAP Integration:** Uses SHAP values for accurate feature attribution

**Model Specifications:**
- **Framework:** SHAP library (when available)
- **Fallback:** Custom statistical explanation methods
- **Language Templates:** Pre-defined templates for different threat types

**Data Structures:**
```python
@dataclass
class FeatureImportance:
    feature_name: str       # Name of the feature
    importance: float       # Importance score (0.0-1.0)
    contribution: str       # "positive" | "negative"

@dataclass
class Explanation:
    prediction: Any         # Model prediction
    confidence: float       # Prediction confidence (0.0-1.0)
    feature_importances: List[FeatureImportance]
    natural_language_explanation: str  # Human-readable explanation
    recommendation: str      # Actionable recommendation
    metadata: Dict[str, Any] # Additional metadata
```

**Threat Templates:**
- High Risk: "HIGH RISK: {reason}. Immediate action recommended."
- Medium Risk: "MEDIUM RISK: {reason}. Monitor closely and prepare response."
- Low Risk: "LOW RISK: {reason}. Continue routine monitoring."
- Anomaly: "ANOMALY DETECTED: {reason}. Requires investigation."
- Attack: "ATTACK DETECTED: {reason}. Activate incident response."

**Usage:**
```python
from inference_core.explainable_ai import ExplainableAILayer

explainer = ExplainableAILayer(feature_names=["severity", "cvss_score", ...])
explainer.initialize_shap(model, background_data)
explanation = explainer.explain(instance, model, prediction)
```

**API Endpoint:** Currently integrated into other analysis endpoints
**Response Format:** Included in analysis responses:
```json
{
  "explanation": {
    "prediction": 0.85,
    "confidence": 0.92,
    "feature_importances": [
      {"feature_name": "cvss_score", "importance": 0.65, "contribution": "positive"},
      {"feature_name": "severity", "importance": 0.23, "contribution": "positive"}
    ],
    "natural_language_explanation": "HIGH RISK: High CVSS score (9.8) combined with critical severity indicates immediate threat.",
    "recommendation": "Immediate patching required. Block related IOCs. Monitor for exploitation attempts."
  }
}
```

---

### AI Model Integration & Workflow

#### Combined Analysis Pipeline

The AI models can be used together for comprehensive threat analysis:

```
1. Crawler collects threat data → Raw threat records
2. NLP Analysis → Extract entities, intents, risk score
3. Graph Analysis → Map relationships, compute threat scores
4. Temporal Forecasting → Predict future trends
5. Anomaly Detection → Identify zero-days
6. Explainable AI → Generate explanations and recommendations
```

#### Model Training

**Pre-trained Models:**
- Models are pre-trained on comprehensive datasets
- Located in `backend/models/`
- Automatically loaded when models are initialized

**Retraining:**
- Training scripts in `backend/train/`
- Can be retrained on new data
- Supports transfer learning from pre-trained models

**Training Data Sources:**
- MITRE ATT&CK framework
- NVD CVE database
- CISA KEV
- Exploit-DB
- Total: 88,500+ threat intelligence objects

### AI API Endpoints

All AI endpoints follow consistent format:

**Base Path:** `/analyze/{model_type}`

**Common Request Format:**
```json
{
  "model_type": "graph" | "nlp" | "temporal" | "anomaly",
  "data": { /* model-specific data */ },
  "options": { /* optional parameters */ }
}
```

**Common Response Format:**
```json
{
  "status": "success" | "error",
  "analysis_type": "graph" | "nlp" | "temporal" | "anomaly",
  "result": { /* model-specific results */ },
  "explanation": { /* explainable AI results */ },
  "execution_time_ms": 150
}
```

---

### AI Model Performance

| Model | Accuracy/Performance | Processing Time | Use Case |
|-------|----------------------|-----------------|----------|
| Graph GNN | 92.3% accuracy | ~200ms | Threat relationship analysis |
| LSTM Forecaster | 88.7% accuracy | ~150ms | Trend prediction (7-14 days) |
| BERT NLP | High precision NER | ~100-200ms | Text analysis per document |
| Isolation Forest | Top 10% anomaly detection | ~50ms | Real-time zero-day detection |
| Explainable AI | N/A | ~50ms | Model interpretability |

---

### AI Model Usage in Production

**Current Integration:**
- Models are available via API endpoints
- Can be called independently or in sequence
- Frontend can trigger AI analysis on-demand


**Future Integration Plans:**
- Automatic AI analysis on crawled threats
- Real-time anomaly detection in crawler
- Predictive alerts based on forecasting
- Dashboard integration of AI insights

---

## Data Flow & Processing

### Complete Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: USER INITIATES CRAWLER                             │
│   Frontend: /app/crawler/page.tsx                          │
│   Action: User clicks "Start Crawler" with date range      │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: API REQUEST                                         │
│   Endpoint: POST /api/crawler/start                         │
│   Body: { startDate?: "YYYY-MM-DD", endDate?: "YYYY-MM-DD" } │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: CRAWLER EXECUTION                                   │
│   File: backend/scripts/crawler_orchestrator.py            │
│   Process:                                                  │
│     1. Calculate date range and limits                      │
│     2. Fetch from each source (8 sources in parallel)        │
│     3. Normalize to CrawlerRecord format                     │
│     4. Deduplicate (source:ID)                              │
│     5. Generate logs                                         │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: DATA STORAGE                                        │
│   File: backend/data_layer/neo4j_connector.py               │
│   Function: store_crawler_records()                         │
│   Process:                                                  │
│     1. Map source to node_type                              │
│     2. Create/update ThreatNode objects                     │
│     3. Store in Neo4j or JSON file                          │
│     4. Update persistence file                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: API RESPONSE                                        │
│   Response: { logs, records, stats }                        │
│   Stats: { sources, items_total, items_unique }               │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 6: FRONTEND DISPLAY                                    │
│   Process:                                                  │
│     1. Stream logs in real-time                             │
│     2. Display statistics                                   │
│     3. Update last run timestamp                            │
└─────────────────────────────────────────────────────────────┘
```

### Dashboard Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: FRONTEND LOADS DASHBOARD                            │
│   File: /app/page.tsx                                        │
│   Action: Component mounts, fetches data                    │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: MULTIPLE API CALLS                                 │
│   Endpoints:                                                 │
│     - GET /api/stats                                        │
│     - GET /api/charts/trend?days=180                         │
│     - GET /api/charts/severity                               │
│     - GET /api/charts/sources                                │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: BACKEND QUERIES DATABASE                            │
│   File: backend/main.py                                      │
│   Process:                                                  │
│     1. Load nodes from Neo4j/JSON                            │
│     2. Filter by node_type                                  │
│     3. Count by severity, source, date                      │
│     4. Aggregate for charts                                 │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: DATA TRANSFORMATION                                │
│   Process:                                                  │
│     1. Group by date for trend chart                        │
│     2. Count by severity for pie chart                     │
│     3. Count by source for bar chart                       │
│     4. Calculate statistics                                │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: FRONTEND RENDERS                                    │
│   Components:                                               │
│     - StatsCard: Total, Critical, Campaigns                │
│     - ThreatTrendChart: Line chart with date range          │
│     - SeverityChart: Pie chart                              │
│     - SourceChart: Bar chart                                │
└─────────────────────────────────────────────────────────────┘
```

### Search Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ STEP 1: USER TYPES IN SEARCH BOX                            │
│   File: /app/threats/page.tsx                               │
│   Action: onChange event fires                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 2: DEBOUNCING                                          │
│   Process: Wait 300ms after user stops typing              │
│   State: debouncedSearch updates                            │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 3: API CALL                                            │
│   Endpoint: GET /api/search?q={query}                       │
│   File: lib/api.ts -> searchThreats()                       │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 4: BACKEND SEARCH                                      │
│   File: backend/main.py -> /api/search                      │
│   Process:                                                  │
│     1. Query Neo4j/JSON for matching nodes                 │
│     2. Search in: node_id, name, description, properties   │
│     3. Case-insensitive matching                            │
│     4. Return matching threats                              │
└───────────────────────┬───────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│ STEP 5: FRONTEND DISPLAYS RESULTS                           │
│   Process:                                                  │
│     1. Map API response to Threat interface                 │
│     2. Normalize severity, timestamps                      │
│     3. Display ThreatCard components                       │
│     4. Update pagination if needed                         │
└─────────────────────────────────────────────────────────────┘
```

---

## Technical Stack

### Backend
- **Language:** Python 3.13+
- **Framework:** FastAPI (asynchronous web framework)
- **HTTP Server:** Uvicorn (ASGI server)
- **API Documentation:** Swagger UI / OpenAPI (auto-generated by FastAPI)
- **Logging:** Python's built-in logging module with structured logging
- **Environment Management:** python-dotenv
- **Data Validation:** Pydantic models

#### Machine Learning & AI
- **Deep Learning:** PyTorch 2.9+ (for GNN and LSTM models)
- **ML Libraries:** scikit-learn (anomaly detection, statistical methods)
- **NLP Framework:** HuggingFace Transformers (BERT-based models)
- **LLM Integration:** google-generativeai SDK (for conversational AI)
- **Explainable AI:** SHAP (SHapley Additive exPlanations), LIME

#### Data Storage
- **Graph DB:** Neo4j (optional, with JSON fallback)
- **Time-Series DB:** InfluxDB (optional, with Pandas fallback)
- **Vector DB:** FAISS (optional, with NumPy fallback)
- **Persistence:** JSON file-based storage (`threats_persistent.json`)

#### Data Processing
- **HTTP Client:** Requests library
- **Data Manipulation:** Pandas, NumPy
- **Date/Time:** python-dateutil, datetime

### Frontend
- **Framework:** Next.js 16 (App Router)
- **UI Library:** React 19.2
- **Language:** TypeScript 5.9
- **Styling:** Tailwind CSS 4.1 with PostCSS
- **Theme Management:** next-themes (dark mode support)
- **UI Components:** Radix UI primitives (accessible component library)
- **Icons:** Lucide React
- **Charts:** Recharts (interactive data visualization)
- **Data Fetching:** React Query (TanStack Query) for server state management
- **Form Handling:** React Hook Form with Zod validation
- **Animation:** Framer Motion (for UI animations)
- **Build Tool:** Next.js built-in bundler
- **Package Manager:** Bun (or npm/yarn)

### Development Tools
- **API Documentation:** Swagger UI (FastAPI auto-generated at `/docs`)
- **Code Quality:** ESLint (frontend), Pylint (backend)
- **Version Control:** Git
- **Environment:** Python venv, Node.js/Bun runtime
- **Hot Reload:** Next.js Fast Refresh, Uvicorn reload mode

---

## Database Schema

### Node Types

#### 1. **CVE Node**
- **Purpose:** CVE records from NVD, CISA KEV, GitHub
- **Properties:**
  - `name`: CVE title
  - `description`: CVE description
  - `severity`: critical | high | medium | low
  - `cvss_score`: CVSS v3 score (0.0-10.0)
  - `discovered`: Publication date (ISO timestamp)
  - `source`: nvd | cisa_kev | github_advisories
  - `url`: CVE detail URL
  - `status`: Analyzed | Modified (for NVD)

#### 2. **ThreatIntelligence Node**
- **Purpose:** General threat intelligence from Reddit, Exploit-DB
- **Properties:**
  - `name`: Threat title
  - `description`: Full description
  - `severity`: critical | high | medium | low
  - `discovered`: Publication date
  - `source`: reddit_netsec | exploit_db
  - `url`: Source URL

#### 3. **Malware Node**
- **Purpose:** Malware-related threats from Abuse.ch, MalwareBazaar
- **Properties:**
  - `name`: Malware/threat name
  - `description`: Description
  - `severity`: high (default for malware)
  - `discovered`: First seen date
  - `source`: abuse_ch_urlhaus | abuse_ch_threatfox | malwarebazaar
  - `url`: IOC/threat URL
  - `metadata`: Source-specific data (IOC type, hash, etc.)

#### 4. **Campaign Node**
- **Purpose:** Threat campaigns (default fallback)
- **Properties:** Same as ThreatIntelligence

### Relationships

Currently, relationships are stored but not extensively used. Future enhancements will include:
- `RELATED_TO`: Threats related to each other
- `EXPLOITS`: CVE exploits a vulnerability
- `SIMILAR_TO`: Similar threats

---

## API Endpoints Reference

### Health & Info

#### `GET /`
**Description:** Root endpoint with API information  
**Response:**
```json
{
  "message": "AI Cyber Threat Forecaster API",
  "version": "1.0.0",
  "docs": "/docs",
  "health": "/api/health",
  "endpoints": { ... }
}
```

#### `GET /api/health`
**Description:** Simple health check  
**Response:**
```json
{
  "status": "ok"
}
```

#### `GET /health`
**Description:** Comprehensive health check  
**Response:**
```json
{
  "status": "healthy",
  "modules": {
    "api": "operational",
    "gnn": "available",
    "nlp": "available",
    "temporal": "available",
    "anomaly": "available",
    "neo4j": "connected" | "unavailable",
    "influxdb": "connected" | "unavailable"
  }
}
```

### Threats

#### `GET /api/threats`
**Description:** List all threats with pagination  
**Query Parameters:**
- `page` (int, default=1): Page number
- `limit` (int, default=5): Items per page

**Response:**
```json
{
  "threats": [
    {
      "id": "nvd:CVE-2025-12345",
      "title": "CVE Title",
      "severity": "critical",
      "timestamp": "2025-01-01T00:00:00Z",
      "summary": "...",
      "description": "...",
      "source": "NVD (CVE Database)",
      "indicators": [...],
      "affectedSystems": [...],
      "recommendation": "..."
    }
  ],
  "total": 229,
  "page": 1,
  "limit": 5
}
```

#### `GET /api/threats/{id}`
**Description:** Get threat details by ID  
**Response:** Single threat object

#### `GET /api/search?q={query}`
**Description:** Search threats by keyword  
**Query Parameters:**
- `q` (string, required): Search query

**Response:**
```json
{
  "results": [
    { /* Threat object */ }
  ]
}
```

#### `GET /api/threats/export`
**Description:** Export all threats as JSON  
**Response:** JSON file download  
**Headers:**
- `Content-Disposition: attachment; filename="threats_export_YYYYMMDD_HHMMSS.json"`

**Response Body:**
```json
{
  "export_date": "2025-11-05T12:00:00Z",
  "total_threats": 229,
  "version": "1.0",
  "threats": [ /* Array of threat objects */ ]
}
```

### Statistics & Charts

#### `GET /api/stats`
**Description:** Dashboard statistics  
**Response:**
```json
{
  "totalThreats": 229,
  "criticalThreats": 15,
  "activeCampaigns": 45,
  "lastUpdate": "2025-11-05T12:00:00Z"
}
```

#### `GET /api/charts/trend`
**Description:** Threat trend data  
**Query Parameters:**
- `days` (int, default=10): Number of days
- `startDate` (string, optional): YYYY-MM-DD format
- `endDate` (string, optional): YYYY-MM-DD format

**Response:**
```json
{
  "data": [
    {
      "date": "2025-11-01",
      "threats": 5,
      "critical": 1,
      "high": 2
    }
  ]
}
```

#### `GET /api/charts/severity`
**Description:** Severity distribution  
**Response:**
```json
{
  "data": [
    { "name": "critical", "value": 15 },
    { "name": "high", "value": 45 },
    { "name": "medium", "value": 120 },
    { "name": "low", "value": 49 }
  ]
}
```

#### `GET /api/charts/sources`
**Description:** Source distribution  
**Response:**
```json
{
  "data": [
    { "name": "NVD (CVE Database)", "value": 100 },
    { "name": "CISA KEV", "value": 50 },
    { "name": "GitHub Security", "value": 25 }
  ]
}
```

### Crawler

#### `POST /api/crawler/start`
**Description:** Start OSINT crawler  
**Request Body:**
```json
{
  "startDate": "2025-01-01",  // Optional
  "endDate": "2025-11-05"      // Optional
}
```

**Response:**
```json
{
  "logs": [
    {
      "timestamp": "2025-11-05T12:00:00Z",
      "message": "Starting crawler run...",
      "type": "info"
    }
  ],
  "records": [ /* CrawlerRecord objects */ ],
  "stats": {
    "sources": 8,
    "items_total": 150,
    "items_unique": 145
  }
}
```

### AI/ML Analysis

#### `POST /analyze/graph`
**Description:** Graph analysis using GNN  
**Request Body:** Graph data  
**Response:** Analysis results

#### `POST /analyze/nlp`
**Description:** NLP analysis using BERT  
**Request Body:** Text data  
**Response:** NLP results

#### `POST /analyze/temporal`
**Description:** Temporal forecasting using LSTM  
**Request Body:** Time-series data  
**Response:** Forecast results

#### `POST /analyze/anomaly`
**Description:** Anomaly detection using Isolation Forest  
**Request Body:** Feature data  
**Response:** Anomaly scores

### AI Chat & Forecasting

#### `POST /api/ai/chat`
**Description:** Interactive AI chat for security-related questions  
**Request Body:**
```json
{
  "message": "What is CVE-2023-38545 and how critical is it?"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "CVE-2023-38545 is a critical vulnerability..."
}
```

**Error Response:**
```json
{
  "status": "error",
  "message": "AI service API key not configured..."
}
```

**Features:**
- CVE analysis and explanation
- Security threat assessment
- Vulnerability impact analysis
- Security recommendations
- Threat intelligence queries

#### `GET /api/ai/forecast`
**Description:** AI-powered 7-day threat forecast  
**Response:**
```json
{
  "status": "success",
  "forecast": [
    {
      "date": "2025-11-07",
      "predicted_value": 6.34
    }
  ],
  "trend": "increasing",
  "risk_level": "critical",
  "note": "LSTM Neural Network" // or "Statistical forecast"
}
```

---

## Deployment & Configuration

### Environment Variables

#### Backend
- `NVD_API_KEY` (optional): NVD API key for higher rate limits
- `CRAWLER_USER_AGENT` (optional): Custom user agent (default: "CyberThreatCrawler/1.0")
- `NEO4J_URI` (optional): Neo4j connection URI (default: bolt://localhost:7687)
- `NEO4J_USER` (optional): Neo4j username
- `NEO4J_PASSWORD` (optional): Neo4j password
- `GEMINI_API_KEY` or `AI_API_KEY` (required for AI chat): API key for LLM service
- `AI_MODEL_NAME` (optional): LLM model name override (default: "gemini-2.5-flash")
- `INFLUXDB_URL` (optional): InfluxDB connection URL
- `INFLUXDB_TOKEN` (optional): InfluxDB authentication token

#### Frontend
- `NEXT_PUBLIC_API_URL`: Backend API URL (default: http://localhost:8000)

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment
python3 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

```bash
# Install dependencies
bun install  # or npm install / yarn install

# Start development server
bun run dev  # or npm run dev / yarn dev
```

### Data Persistence

The system automatically creates `backend/data/threats_persistent.json` on first crawl. This file:
- Persists all threats between server restarts
- Is automatically loaded on Neo4jConnector initialization
- Is automatically saved after every write operation
- Uses atomic writes (temporary file + rename) for data integrity

---

## Testing & Quality Assurance

### Error Handling

#### Crawler Error Handling
- **Network Errors:** Retry with exponential backoff
- **API Errors:** Logged, skipped, continue with next source
- **Parse Errors:** Logged, skipped, continue with next record
- **Rate Limiting:** Respects API rate limits, waits if needed

#### Backend Error Handling
- **Database Errors:** Falls back to JSON persistence
- **Missing Data:** Returns empty arrays/objects
- **Invalid Inputs:** Returns 400 Bad Request with error details
- **Server Errors:** Returns 500 with detailed error message

#### Frontend Error Handling
- **API Errors:** Displayed to user with error messages
- **Network Errors:** Automatic retry with React Query
- **Validation Errors:** Form validation before submission

### Data Validation

#### Crawler Records
- **ID:** Required, non-empty
- **Source:** Required, must be valid source name
- **Title:** Required, non-empty
- **URL:** Required, valid URL format
- **Severity:** Validated against allowed values

#### API Requests
- **Date Formats:** YYYY-MM-DD validation
- **Pagination:** Page and limit must be positive integers
- **Search Query:** Sanitized to prevent injection

---

## Future Enhancements

### Planned Features

1. **User Authentication**
   - Login/logout system
   - Role-based access control
   - API key generation

2. **Advanced Filtering**
   - Filter by multiple criteria simultaneously
   - Saved filter presets
   - Export filtered results

3. **Threat Correlation**
   - Automatic threat relationship mapping
   - Campaign detection
   - Threat actor identification

4. **Notifications**
   - Email alerts for critical threats
   - Slack/Discord integration
   - Custom notification rules

5. **API Improvements**
   - GraphQL API option
   - WebSocket for real-time updates
   - Bulk operations support

6. **Analytics**
   - Threat prediction accuracy metrics
   - Source reliability scoring
   - User activity tracking

7. **Integration**
   - SIEM integration (Splunk, ELK)
   - Ticketing system integration (Jira, ServiceNow)
   - Threat intelligence platforms (MISP, OpenCTI)

---

## Key Implementation Details

### Severity Classification

The system uses multiple methods to classify threat severity:

1. **CVSS Score (Primary for NVD):**
   - Critical: CVSS >= 9.0
   - High: CVSS >= 7.0
   - Medium: CVSS >= 4.0
   - Low: CVSS < 4.0

2. **Source-Specific Classification:**
   - NVD CVEs use CVSS scores
   - CISA KEV are classified as critical/high
   - Malware sources default to high
   - Other sources use keyword matching

3. **Keyword Matching (Fallback):**
   - "critical" → critical severity
   - "high" → high severity
   - Case-insensitive matching

### Date Handling

- **Format:** ISO 8601 timestamps (YYYY-MM-DDTHH:MM:SSZ)
- **Timezone:** UTC for all timestamps
- **Storage:** ISO strings in database
- **Display:** Local timezone conversion in frontend
- **Filtering:** Date comparison in UTC

### Source Normalization

Source names are normalized for display:
- `nvd` → "NVD (CVE Database)"
- `cisa_kev` → "CISA KEV"
- `github_advisories` → "GitHub Security"
- `abuse_ch_urlhaus` → "Abuse.ch URLhaus"
- `abuse_ch_threatfox` → "Abuse.ch ThreatFox"
- `exploit_db` → "Exploit-DB"
- `malwarebazaar` → "MalwareBazaar"
- `reddit_netsec` → "Reddit /r/netsec"

### CVE URL Format

All CVE links use the format:
```
https://www.cve.org/CVERecord?id={CVE-ID}
```

This ensures reliability even for newly published CVEs that may not yet be on NVD.

### Pagination Strategy

- **NVD API:** Supports pagination up to 20,000 CVEs (10 pages × 2000 per page)
- **Frontend:** 5 threats per page with Previous/Next navigation
- **Backend:** Unlimited pagination support

---

## Report Generation Guidelines

When generating reports or documentation for this project, include:

1. **Executive Summary**
   - Project purpose and objectives
   - Key achievements and features
   - Current status

2. **Technical Overview**
   - Architecture diagram
   - Technology stack
   - System components

3. **Feature Documentation**
   - OSINT crawler capabilities
   - Dashboard features
   - Search and filtering
   - Data export

4. **Implementation Details**
   - Data flow diagrams
   - API endpoint documentation
   - Database schema
   - Error handling strategies

5. **Usage Instructions**
   - Setup and installation
   - Configuration options
   - Usage examples

6. **Testing & Quality**
   - Error handling
   - Data validation
   - Fallback mechanisms

7. **Future Roadmap**
   - Planned enhancements
   - Integration possibilities
   - Scalability considerations

8. **Screenshots/Demos**
   - Dashboard screenshots
   - Crawler UI
   - Threat feed interface

---

## Conclusion

VAJRA is a comprehensive, production-ready AI-powered threat intelligence platform that demonstrates:
- **Full-stack development:** Frontend, backend, and data layer integration
- **Real-world OSINT:** 8 diverse threat intelligence sources with automated collection
- **Persistent storage:** JSON-based persistence with Neo4j support
- **Advanced AI/ML Engine:** Five specialized models including:
  - Graph Neural Networks (92.3% accuracy) for threat relationship mapping
  - LSTM temporal forecasting (88.7% accuracy) for trend prediction
  - BERT-based NLP for threat intelligence extraction
  - Isolation Forest for zero-day anomaly detection
  - Explainable AI layer for interpretable predictions
- **Production-ready models:** Pre-trained on 88,500+ threat intelligence objects
- **User-friendly interface:** Interactive dashboard with real-time data visualization
- **Comprehensive search:** Advanced threat search with debouncing
- **Robust error handling:** Comprehensive fallbacks and validation
- **Complete AI integration:** API endpoints for all models with consistent interfaces

The system is ready for deployment, testing, and further enhancements. The AI/ML components represent a significant portion of the project's value proposition, providing predictive analytics, anomaly detection, and explainable insights that go beyond basic threat intelligence collection.

---

**Document Version:** 1.0  
**Last Updated:** November 2025  
**Maintained by:** Development Team

