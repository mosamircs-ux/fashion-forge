# 🧵 Fashion Forge: Bespoke Atelier Network

Fashion Forge is an AI-powered fashion platform connecting customers, boutique designers, local ateliers, fabric suppliers, and delivery couriers in Cairo, Egypt. By co-creating garments with Gemini AI, customers can experience a seamless custom tailoring process from initial design to doorstep delivery.

---

## ✨ Core Features

*   **🤖 AI Creative Studio**: Co-create garments and generate stunning fashion blueprints dynamically with Gemini AI.
*   **🧍 Virtual Try-On (AR Fit Suit)**: Visualize custom styles on personalized virtual models/avatars.
*   **🏪 Atelier Marketplace**: Buy custom designer templates, source luxury fabrics (like Egyptian long-staple cotton, Mediterranean flax linen, or pure mulberry silk), and hire professional tailors.
*   **🗺️ Interactive Cairo Supply Chain Map**: Track boutique designers, fabric suppliers, tailor ateliers, and active courier routes.
*   **📏 Bespoke Order Wizard**: Custom-tailor your fit with step-by-step measurements, collar styles, and personalized monogram embroidery.
*   **📄 Escrow Invoice PDF Generator**: Instantly download high-quality, printer-friendly PDF summaries for bespoke commissions.
*   **🎭 Multi-Persona Role Switcher**: Instant dashboard switching between **Customer**, **Tailor**, **Supplier**, and **Delivery Courier** roles.

---

## 📸 App Interface Walkthrough

Below are the interface screenshots showing the features of **Fashion Forge** in action:

| **1. AI Design Studio (Create blueprints)** | **2. Virtual Try-On (Customize avatar)** |
|:---:|:---:|
| ![AI Design Studio](screenshots/Screenshot%202026-06-23%20130049.png) | ![Virtual Try-On](screenshots/Screenshot%202026-06-23%20130124.png) |
| Generate custom design outlines | Try on customized attire on virtual fit model |

| **3. Customization Details** | **4. Interactive Cairo Map** |
|:---:|:---:|
| ![Customization Options](screenshots/Screenshot%202026-06-23%20130147.png) | ![Interactive Cairo Map](screenshots/Screenshot%202026-06-23%20130203.png) |
| Personalize collars, sleeves, and colors | Map boutique locations and manufacturing hubs |

| **5. Atelier Marketplace** | **6. Bespoke Order Wizard** |
|:---:|:---:|
| ![Atelier Marketplace](screenshots/Screenshot%202026-06-23%20130218.png) | ![Bespoke Order Wizard](screenshots/Screenshot%202026-06-23%20130233.png) |
| Shop custom designer items and fabric rolls | Select fits, fabrics, and measurement inputs |

| **7. Multi-Persona Role Switcher** | **8. Generative Fabric Selector** |
|:---:|:---:|
| ![Role Switcher](screenshots/Screenshot%202026-06-23%20130255.png) | ![Generative Fabric Selector](screenshots/Screenshot%202026-06-23%20130323.png) |
| Swap between Customer, Tailor, Supplier, Delivery | Choose premium Egyptian cotton, silk, and linens |

| **9. Escrow Billing & Invoice PDF** | **10. Tailor Courier Delivery Flow** |
|:---:|:---:|
| ![Bespoke Summary & PDF](screenshots/Screenshot%202026-06-23%20130341.png) | ![Tailor & Courier Map](screenshots/Screenshot%202026-06-23%20130358.png) |
| Download official bespoke order summary PDFs | Courier route details and real-time delivery status |

---

## 🛠️ Tech Stack & Technologies

*   **Frontend**: React (TypeScript), Vite, Tailwind CSS, Lucide React (Icons)
*   **AI Integration**: Google Gemini API via custom endpoints
*   **Utilities**: `jspdf` (for PDF billing generation)
*   **Maps**: Custom leaf/vector Cairo map engine using local geolocation coordinates

---

## 🚀 Run Locally

**Prerequisites:** Node.js (v18+)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment Variables:**
   Set the `GEMINI_API_KEY` in `.env.local` to your Google AI Studio Gemini API key:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

3. **Run the local development server:**
   ```bash
   npm run dev
   ```
