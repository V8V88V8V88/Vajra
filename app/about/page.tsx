"use client"

export default function About() {
  return (
    <div className="p-8 max-w-3xl mx-auto space-y-6 text-foreground">
      <h1 className="text-4xl font-bold mb-4">About This Project</h1>
      <section className="space-y-4">
        <p>
          <span className="font-semibold">Developed by:</span> Vaibhav Pratap Singh & Suryansh Sharma<br/>
          <span className="font-semibold">Year:</span> 4th Year (Minor Project, Joint Submission)
        </p>
        <p>
          This AI-powered Cyber Threat Forecaster is a joined minor project by Vaibhav Pratap Singh and Suryansh Sharma, designed to enhance cyber threat intelligence through automation, machine learning, and an interactive dashboard. The aim is to streamline the process of monitoring, analyzing, and forecasting various cyber threats in real time.
        </p>
      </section>
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold mb-2">How It Works</h2>
        <ol className="list-decimal list-inside space-y-2">
          <li><span className="font-semibold">Data Crawling:</span> The system crawls and collects cyber threat intelligence and news from diverse sources all over the world, including open-source intelligence (OSINT) feeds and security blogs.</li>
          <li><span className="font-semibold">Sourcing & Aggregation:</span> The collected raw information is sourced and normalized for further processing.</li>
          <li><span className="font-semibold">AI Pipelines:</span> The sourced data is routed through AI pipelines. These use NLP and advanced algorithms to classify, assess, and extract actionable threat insights.</li>
          <li><span className="font-semibold">Database Storage:</span> The filtered intelligence and results are then securely stored in a database.</li>
          <li><span className="font-semibold">Backend Processing:</span> The backend handles all core logic, serving the curated insights and statistics to the frontend, while ensuring data integrity, fast access, and security.</li>
          <li><span className="font-semibold">Frontend Visualization:</span> The frontend dashboard presents threat trends, stats, charts, and detailed views, making complex threat intelligence accessible and actionable.</li>
        </ol>
      </section>
      <section>
        <p className="text-muted-foreground mt-6">
          This project is a demonstration of end-to-end engineering: full-stack data flow from real-world crawling to sophisticated AI processing and UX-focused visualization.
        </p>
      </section>
    </div>
  );
}
