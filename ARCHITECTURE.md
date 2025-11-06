# Vajra System Architecture - Mermaid Diagrams

## High-Level System Architecture

```mermaid
graph TB
    subgraph "Frontend Layer - Next.js 16"
        UI[Dashboard/UI Components]
        Pages[Pages:<br/>Dashboard<br/>Threat Feed<br/>Crawler<br/>AI Assistant<br/>Settings<br/>About]
        Components[React Components:<br/>Charts<br/>Threat Cards<br/>Chat Interface<br/>Forms]
        UI --> Pages
        Pages --> Components
    end

    subgraph "Backend Layer - FastAPI + Python 3.13"
        API[API Routes<br/>main.py]
        API --> Stats[/api/stats]
        API --> Threats[/api/threats]
        API --> Search[/api/search]
        API --> Charts[/api/charts]
        API --> CrawlerEP[/api/crawler]
        API --> Export[/api/export]
        API --> ChatEP[/api/ai/chat]
        API --> ForecastEP[/api/ai/forecast]
        API --> AnalyzeEP[/analyze/*]
    end

    subgraph "AI/ML Inference Core"
        GNN[Graph Neural Network<br/>GNN Model<br/>92.3% Accuracy]
        LSTM[LSTM Temporal Forecaster<br/>88.7% Accuracy]
        NLP[BERT NLP Analyzer<br/>HuggingFace]
        Anomaly[Isolation Forest<br/>Anomaly Detector]
        XAI[Explainable AI<br/>SHAP/LIME]
        
        AnalyzeEP --> GNN
        AnalyzeEP --> LSTM
        AnalyzeEP --> NLP
        AnalyzeEP --> Anomaly
        AnalyzeEP --> XAI
    end

    subgraph "Crawler System"
        Orchestrator[Crawler Orchestrator<br/>crawler_orchestrator.py]
        NVD[NVD Crawler]
        CISA[CISA KEV Crawler]
        GitHub[GitHub Security Crawler]
        Reddit[Reddit /r/netsec Crawler]
        ExploitDB[Exploit-DB Crawler]
        AbuseCH[Abuse.ch Crawlers]
        MalwareBz[MalwareBazaar Crawler]
        
        CrawlerEP --> Orchestrator
        Orchestrator --> NVD
        Orchestrator --> CISA
        Orchestrator --> GitHub
        Orchestrator --> Reddit
        Orchestrator --> ExploitDB
        Orchestrator --> AbuseCH
        Orchestrator --> MalwareBz
    end

    subgraph "AI Chat Service"
        ChatHandler[Chat Handler<br/>LLM Integration]
        LLM[Large Language Model<br/>via REST API]
        PromptEngine[Security-Focused<br/>Prompt Engine]
        
        ChatEP --> ChatHandler
        ChatHandler --> PromptEngine
        PromptEngine --> LLM
        LLM --> ChatHandler
    end

    subgraph "Data Layer"
        Neo4j[(Neo4j Graph DB<br/>Optional)]
        JSON[JSON File Storage<br/>threats_persistent.json]
        Memory[In-Memory<br/>Simulation]
        
        Orchestrator --> Neo4j
        Orchestrator --> JSON
        Orchestrator --> Memory
        API --> Neo4j
        API --> JSON
        API --> Memory
    end

    subgraph "ML Models Storage"
        Models[Pre-trained Models:<br/>gnn_model.pt<br/>lstm_model.pt<br/>anomaly_detector.joblib<br/>BERT Cache]
        
        GNN --> Models
        LSTM --> Models
        NLP --> Models
        Anomaly --> Models
    end

    subgraph "External Services"
        OSINTSources[OSINT Sources:<br/>nvd.nist.gov<br/>cisa.gov/kev<br/>github.com/security<br/>reddit.com/r/netsec<br/>exploit-db.com<br/>abuse.ch<br/>malwarebazaar.abuse.ch]
    end

    Components -->|HTTP/REST API| API
    OSINTSources -->|HTTPS| Orchestrator
```

## Data Flow Architecture

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Crawler
    participant DataLayer
    participant MLModels
    participant LLMService

    Note over User,LLMService: Threat Intelligence Collection Flow
    User->>Frontend: Navigate to Crawler Page
    User->>Frontend: Start Crawler (Date Range)
    Frontend->>Backend: POST /api/crawler/start
    Backend->>Crawler: Execute Crawler Orchestrator
    Crawler->>OSINT Sources: Fetch Threat Data
    OSINT Sources-->>Crawler: Threat Records
    Crawler->>DataLayer: Store Normalized Data
    DataLayer-->>Crawler: Storage Confirmation
    Crawler-->>Backend: Crawler Results
    Backend-->>Frontend: Real-time Logs & Stats
    Frontend-->>User: Display Crawler Progress

    Note over User,LLMService: Threat Analysis Flow
    User->>Frontend: View Threat Details
    Frontend->>Backend: GET /api/threats/{id}
    Backend->>DataLayer: Query Threat Data
    DataLayer-->>Backend: Threat Object
    Backend->>MLModels: Analyze Threat (Optional)
    MLModels-->>Backend: AI Analysis Results
    Backend-->>Frontend: Enriched Threat Data
    Frontend-->>User: Display Threat Card

    Note over User,LLMService: AI Chat Flow
    User->>Frontend: Ask Security Question
    Frontend->>Backend: POST /api/ai/chat
    Backend->>LLMService: Send Query with Context
    LLMService-->>Backend: AI Response
    Backend-->>Frontend: Formatted Answer
    Frontend-->>User: Display Chat Response

    Note over User,LLMService: Forecasting Flow
    User->>Frontend: View Dashboard
    Frontend->>Backend: GET /api/ai/forecast
    Backend->>DataLayer: Get Historical Threat Data
    DataLayer-->>Backend: Time-Series Signals
    Backend->>MLModels: Run LSTM Forecast
    MLModels-->>Backend: 7-Day Prediction
    Backend-->>Frontend: Forecast Data
    Frontend-->>User: Display Forecast Chart
```

## Component Architecture

```mermaid
graph LR
    subgraph "Frontend Components Structure"
        A[app/page.tsx<br/>Dashboard] --> B[components/dashboard/<br/>Stats Cards<br/>Charts]
        C[app/threats/page.tsx<br/>Threat Feed] --> D[components/threats/<br/>Threat Card<br/>Detail Modal]
        E[app/crawler/page.tsx<br/>Crawler] --> F[components/crawler/<br/>Logs Display<br/>Controls]
        G[app/ai/page.tsx<br/>AI Assistant] --> H[components/ai/<br/>Chat Interface]
        I[app/settings/page.tsx] --> J[components/settings/]
        K[app/about/page.tsx] --> L[components/about/]
        
        M[lib/api.ts<br/>API Client] --> A
        M --> C
        M --> E
        M --> G
    end

    subgraph "Backend Structure"
        N[main.py<br/>FastAPI App] --> O[data_layer/<br/>Neo4j Connector<br/>Vector DB<br/>Time-Series DB]
        N --> P[inference_core/<br/>GNN<br/>LSTM<br/>NLP<br/>Anomaly<br/>XAI]
        N --> Q[scripts/<br/>Crawler Orchestrator]
        
        R[models/<br/>Pre-trained Models] --> P
        S[data/<br/>JSON Storage] --> O
    end
```

## AI/ML Pipeline Architecture

```mermaid
flowchart TD
    Start[Threat Data Input] --> NLP[NLP Analysis<br/>BERT Model]
    NLP --> Extract[Entity Extraction:<br/>CVE IDs<br/>Malware Names<br/>IPs/Domains<br/>Risk Scores]
    
    Extract --> Graph[Graph Analysis<br/>GNN Model]
    Graph --> Relations[Threat Relationships:<br/>Threat Scores<br/>Graph Embeddings<br/>Clusters]
    
    Relations --> Temporal[Temporal Forecasting<br/>LSTM Model]
    Temporal --> Forecast[7-14 Day Predictions:<br/>Trend Analysis<br/>Risk Levels<br/>Confidence Intervals]
    
    Forecast --> Anomaly[Anomaly Detection<br/>Isolation Forest]
    Anomaly --> ZeroDay[Zero-Day Detection:<br/>Anomaly Scores<br/>Similar Events]
    
    ZeroDay --> XAI[Explainable AI Layer<br/>SHAP/LIME]
    XAI --> Explainer[Model Interpretability:<br/>Feature Importance<br/>Natural Language Explanations<br/>Actionable Recommendations]
    
    Explainer --> Output[Integrated Threat Intelligence]
    
    style NLP fill:#e1f5ff
    style Graph fill:#e1f5ff
    style Temporal fill:#e1f5ff
    style Anomaly fill:#e1f5ff
    style XAI fill:#e1f5ff
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        Browser[Web Browser<br/>http://localhost:3000]
    end

    subgraph "Frontend Server"
        NextJS[Next.js Dev Server<br/>Port 3000]
        NextJS --> Browser
    end

    subgraph "Backend Server"
        FastAPI[FastAPI + Uvicorn<br/>Port 8000]
        FastAPI --> Python[Python 3.13<br/>Virtual Environment]
        Python --> PyTorch[PyTorch 2.9]
        Python --> Models[ML Models<br/>backend/models/]
    end

    subgraph "Data Storage"
        Neo4j[(Neo4j<br/>Optional)]
        JSONFile[threats_persistent.json<br/>File System]
        FastAPI --> Neo4j
        FastAPI --> JSONFile
    end

    subgraph "External APIs"
        LLM[LLM Service API<br/>REST API]
        OSINT[OSINT Sources<br/>HTTPS]
        FastAPI --> LLM
        FastAPI --> OSINT
    end

    Browser <-->|HTTP/REST| NextJS
    NextJS <-->|HTTP/REST| FastAPI
```

## Technology Stack Diagram

```mermaid
mindmap
  root((Vajra<br/>Tech Stack))
    Frontend
      Next.js 16
      React 19.2
      TypeScript 5.9
      Tailwind CSS 4.1
      Radix UI
      React Query
      Recharts
      Lucide Icons
    Backend
      FastAPI
      Python 3.13
      Uvicorn
      Pydantic
      python-dotenv
      Python Logging
    ML/AI
      PyTorch 2.9
      scikit-learn
      HuggingFace
      google-generativeai
      SHAP/LIME
    Data
      Neo4j
      JSON Files
      FAISS
      Pandas
      NumPy
    Services
      LLM API
      OSINT Sources
      NVD API
```

## System Integration Flow

```mermaid
flowchart LR
    Start([User Action]) --> Frontend{Frontend<br/>Component}
    
    Frontend -->|Dashboard| Stats[Stats API]
    Frontend -->|Threat Feed| Threats[Threats API]
    Frontend -->|Crawler| Crawler[Crawler API]
    Frontend -->|AI Chat| Chat[Chat API]
    Frontend -->|Charts| Charts[Charts API]
    
    Stats --> Backend[FastAPI Backend]
    Threats --> Backend
    Crawler --> Backend
    Chat --> Backend
    Charts --> Backend
    
    Backend -->|Crawling| OSINT[OSINT Sources]
    Backend -->|Storage| DB[(Data Storage)]
    Backend -->|Analysis| ML[ML Models]
    Backend -->|Chat| LLM[LLM Service]
    
    OSINT -->|Data| Backend
    DB -->|Query| Backend
    ML -->|Results| Backend
    LLM -->|Response| Backend
    
    Backend -->|JSON| Frontend
    Frontend -->|Display| End([User Interface])
    
    style Backend fill:#f9f,stroke:#333,stroke-width:4px
    style ML fill:#bbf,stroke:#333,stroke-width:2px
    style LLM fill:#bfb,stroke:#333,stroke-width:2px
```

