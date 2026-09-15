# 🖨️ Thakre Printing Press

> Quality Printing & Designing Services in Goregaon, Gondia

A modern, full-featured business website with an integrated CMS admin panel — built for **Thakre Printing Press** to showcase services, manage content, and capture customer enquiries.

---

## ✨ Features

### 🌐 Public Website
- **Home** — Hero section, featured services, testimonials, and call-to-action
- **Services** — Complete catalog with individual detail pages
- **Gallery** — Categorized portfolio showcasing print work
- **Forms** — Downloadable government and business forms
- **About** — Company story, mission, and team
- **FAQ** — Frequently asked questions
- **Quote** — Multi-step quote request form with validation
- **Contact** — Contact details, location map, and enquiry form
- **Privacy & Terms** — Legal pages
- **WhatsApp Button** — Floating quick-connect button

### 🔐 Admin CMS Panel (`/admin`)
- **Dashboard** — Overview with key metrics and quick actions
- **Business Profile** — Edit company name, description, contact info
- **Branding** — Manage logos, colors, and visual identity
- **Opening Hours** — Configure business hours per day
- **Location** — Set Google Maps embed and address
- **Social Media** — Manage social links
- **Homepage CMS** — Edit hero, sections, and call-to-action content
- **Services CRUD** — Create, edit, delete, and reorder services
- **Gallery CRUD** — Upload, categorize, and manage portfolio items
- **Forms Catalog** — Manage downloadable forms
- **About Editor** — Edit about page content
- **FAQ Manager** — Add, edit, and reorder FAQs
- **Enquiries** — View and manage customer enquiries/leads
- **Analytics** — Website visit and engagement tracking
- **User Management** — Role-based access (Owner, Admin)
- **Activity Logs** — Append-only audit trail
- **Settings** — System-level configurations

### 🌍 Multilingual Support
- English 🇬🇧
- Hindi 🇮🇳
- Marathi 🇮🇳

---

## 🛠️ Tech Stack

| Layer        | Technology                                              |
| ------------ | ------------------------------------------------------- |
| **Frontend** | React 19, React Router 7, Vite 8                       |
| **Styling**  | Vanilla CSS with custom properties                      |
| **Backend**  | Firebase (Firestore, Authentication)                    |
| **Forms**    | React Hook Form + Zod validation                        |
| **Icons**    | Lucide React                                            |
| **i18n**     | i18next + Browser Language Detector                     |
| **SEO**      | React Helmet Async                                      |
| **Language** | JavaScript (JSX) + TypeScript config                    |
| **Build**    | Vite with React plugin                                  |
| **Hosting**  | Netlify (static) / Firebase Hosting                     |

---

## 📁 Project Structure

```
thakre-printing-press/
├── public/                  # Static assets (favicon, icons)
├── src/
│   ├── assets/              # Images and media
│   ├── components/
│   │   ├── admin/           # Admin layout, sidebar, guards
│   │   ├── common/          # Shared/reusable components
│   │   └── public/          # Header, Footer, WhatsApp button
│   ├── config/              # Firebase and app configuration
│   ├── contexts/            # React context providers
│   ├── i18n/                # Translation files (en, hi, mr)
│   ├── pages/
│   │   ├── admin/           # 23 CMS admin pages
│   │   └── public/          # 11 public-facing pages
│   ├── services/            # Firebase service layer
│   ├── styles/              # Global and shared CSS
│   ├── utils/               # Helper functions
│   ├── App.jsx              # Route definitions
│   └── main.jsx             # App entry point
├── .env.example             # Environment variable template
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
├── vite.config.js           # Vite build configuration
└── package.json             # Dependencies and scripts
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **npm** >= 9
- A **Firebase** project with Firestore and Authentication enabled

### Installation

```bash
# Clone the repository
git clone https://github.com/HarshPatle1910/thakre-printing-press.git
cd thakre-printing-press

# Install dependencies
npm install
```

### Environment Setup

```bash
# Copy the example environment file
cp .env.example .env
```

Edit `.env` and fill in your Firebase credentials:

```env
VITE_FIREBASE_API_KEY=your_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=thakre-printing-press.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=thakre-printing-press
VITE_FIREBASE_STORAGE_BUCKET=thakre-printing-press.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
VITE_FIREBASE_APP_ID=your_firebase_app_id
```

### Development

```bash
# Start the dev server on port 3000
npm run dev
```

### Build for Production

```bash
# Create optimized production build in /dist
npm run build

# Preview production build locally
npm run preview
```

---

## 🌐 Deployment

### Netlify (Recommended)

This project is configured for Netlify deployment:

1. Connect your GitHub repository to Netlify
2. Set **Build Command** → `npm run build`
3. Set **Publish Directory** → `dist`
4. Add environment variables in Netlify dashboard (all `VITE_FIREBASE_*` vars)
5. Deploy!

### Firebase Hosting (Alternative)

```bash
npm run build
npx firebase deploy --only hosting
```

---

## 📜 Available Scripts

| Script            | Description                         |
| ----------------- | ----------------------------------- |
| `npm run dev`     | Start Vite dev server (port 3000)   |
| `npm run build`   | Create production build             |
| `npm run preview` | Preview production build locally    |

---

## 🔒 Security

- Admin routes are protected with Firebase Authentication
- Role-based access control (Owner/Admin roles)
- Activity logs are append-only (cannot be edited or deleted)
- Environment variables keep API keys out of source code

> ⚠️ **Note:** Firestore security rules should be tightened for production use. The current rules are configured for development convenience.

---

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is private and proprietary to **Thakre Printing Press**.

---

## 📞 Contact

<!-- **Thakre Printing Press** -->
<!-- 📍 Goregaon, Gondia, Maharashtra, India -->
**Harsh Patle**
📍 +91 9405512436

---

<p align="center">
  Built with ❤️ using React + Firebase
</p>
# thakre-printing-press
