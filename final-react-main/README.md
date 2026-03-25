Sentinel IoT Datacenter Supervision Platform

An industrial-style IoT monitoring platform designed to supervise datacenter environmental conditions in real-time.
This project simulates a real-world industrial supervision system using a Virtual Datacenter powered by real-time data generation.

---

🚀 Project Overview

Sentinel is a full-stack IoT supervision platform that:

- Monitors environmental sensor data in real-time
- Detects anomalies based on normalized thresholds
- Displays multi-level system status (Datacenter → Zones → Nodes)
- Generates automatic alerts
- Sends email notifications on critical events
- Uses WebSockets (Socket.IO) for real-time dashboard updates

---

 🏗 Architecture

Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- Socket.IO
- Nodemailer (Email alerts)

Frontend
- React (Vite)
- TypeScript
- TailwindCSS / ShadCN UI
- React Query
- Socket.IO Client

---

🏢 Datacenter Structure

The system supports multiple datacenters but currently includes:

✅ Virtual DC – RealTime Lab
- Main monitored datacenter
- Generates realistic real-time sensor data
- Contains multiple zones and ESP32 nodes
- Fully supervised with alerts and status propagation

✅ Tunis North Hub
- Example datacenter
- Static / demonstration only

---

📊 Features

Real-Time Monitoring
- Temperature
- Humidity
- Gas / Smoke
- Pressure
- Vibrations

Multi-Level Status System
- Node Status (Normal / Warning / Critical)
- Zone Status
- Datacenter Global Status

Automatic Alert System
- Threshold-based anomaly detection
- Real-time alert UI
- Email notification on critical events

Authentication
- Email verification required
- Domain-restricted registration (@ooredoo.tn)
- Special exception for testing email

---

📧 Email Alerts

Critical alerts automatically trigger email notifications to:

- Admin
- Configured alert email
- System supervisors



```bash
git clone https://github.com/YOUR_USERNAME/final-react.git
cd final-react
