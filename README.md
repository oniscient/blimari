# Blimari 🎯

> **AI-Powered Learning Platform**  
> *Turn any learning goal into a structured path in minutes*

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14+-black.svg)](https://nextjs.org/)

## 🌟 **What is Blimari?**

Blimari is the simplest way to learn anything online. Just tell us what you want to learn, answer 3 quick questions, and get a complete learning path with curated content, progress tracking, and personalized quizzes – all powered by AI and enhanced with cultural intelligence.

**No more overwhelming course catalogs. No more random YouTube videos. Just focused, personalized learning paths that adapt to who you are.**

---

## ✨ **Key Features**

### 🤖 **AI-Powered Content Curation**
- **Instant Path Creation** – Turn any topic into a structured learning journey
- **Multi-Source Discovery** – Aggregates best content from YouTube, Medium, GitHub, and more
- **Quality Filtering** – AI evaluates content for accuracy and educational value
- **Intelligent Sequencing** – Optimal learning progression based on difficulty and dependencies

### 🎯 **Cultural Intelligence**
- **Invisible Personalization** – Content ranking and language adaptation based on your preferences
- **Relevant Examples** – AI uses examples that resonate with your interests and background
- **Optimized Communication** – Adapts technical level and explanation style to match your profile
- **Cultural Context** – Enhances learning without changing the clean interface

### 📚 **Streamlined Learning Experience**
- **Clean Interface** – Minimal design focused on learning, not distractions
- **Progress Tracking** – Visual progress with locked/unlocked content progression
- **Embedded Players** – Watch videos and read articles without leaving the platform
- **Automatic Sync** – Progress saved in real-time across all devices

### 🎮 **Mastery Validation**
- **AI-Generated Quizzes** – Custom assessments based on your specific learning path
- **Personalized Questions** – Quiz content adapted to your profile and interests
- **Custom Badges** – Unique achievements for each completed learning path
- **Skill Validation** – Prove your knowledge with meaningful assessments

---

## 🛠️ **Technology Stack**

### **Frontend**
- **Next.js 14**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

### **Backend**
- **Node.js + Fastify**
- **PostgreSQL**
- **Redis**
- **Prisma**

### **AI & Intelligence**
- **Google Gemini** – Question generation and content analysis
- **Custom ML** – Content quality scoring and sequence optimization

### **Infrastructure**
- **Docker**
- **Kubernetes**
- **AWS**
- **GitHub Actions**

---

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- Docker (optional)

### **1. Clone the Repository**
```bash
git clone https://github.com/your-username/blimari.git
cd blimari
````

### **2. Install Dependencies**

```bash
npm install
```

### **3. Environment Setup**

Create a `.env.local` file in the root directory:

```env
# ==============================================
# BLIMARI - AI-POWERED LEARNING PLATFORM
# ==============================================

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/blimari"
REDIS_URL="redis://localhost:6379"

# AI Services
GEMINI_API_KEY="your_google_gemini_api_key"
OPENAI_API_KEY="your_openai_api_key"

# Content Sources
YOUTUBE_API_KEY="your_youtube_data_api_v3_key"
GITHUB_TOKEN="your_github_personal_access_token"

# Authentication
JWT_SECRET="your_jwt_secret_256_bit_key"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your_nextauth_secret"

# External APIs (Optional)
MEDIUM_RSS_FEEDS="https://medium.com/feed/@username"
DEV_TO_API_KEY="your_dev_to_api_key"
```

### **4. Database Setup**

```bash
npx prisma migrate dev
npm run db:seed   # optional
```

### **5. Start Development Server**

```bash
npm run dev
```

* Frontend: [http://localhost:3000](http://localhost:3000)
* API: [http://localhost:8000](http://localhost:8000)

### **6. Run with Docker**

```bash
docker-compose up -d
```

---

## 📁 **Project Structure**

```
blimari/
├── src/
│   ├── app/                  # Next.js App Router
│   ├── components/           # UI components
│   ├── lib/                  # Utilities & integrations
│   └── types/                # TypeScript definitions
├── api/                      # Backend services
├── docs/                     # Documentation
└── README.md
```

---

## 🎨 **Design Philosophy**

Minimalist, distraction-free, with AI and personalization running invisibly in the background.

---

## 🧪 **Testing**

```bash
npm test
npm run test:coverage
```

---

## 🚀 **Deployment**

```bash
npm run build
npm run deploy:production
```

Supports **auto-scaling** with Kubernetes HPA configuration.

---

## 📄 **License**

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 🙏 **Acknowledgments**

* **Google** for Gemini API access
* **Open Source Community** for tools and libraries
* **Educational Researchers** who provided insights into learning design
* **Beta Testers** who helped validate the experience

---

## 🔗 **Links & Resources**

* 🌐 **Live Demo**: [blimari.space](https://blimari.space)
* 🎥 **Demo Video**: [Watch on YouTube](https://youtu.be/k145dw0TcKc)
* 📧 **Contact**: [hello@blimari.space](mailto:hello@blimari.space)

