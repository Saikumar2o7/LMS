# LoanFlow - Loan Management System

A comprehensive loan management system built with Next.js, Node.js, and MongoDB. Features role-based access control (RBAC) for different stakeholders including Borrowers, Sales, Sanction Officers, Disbursement Officers, Collection Officers, and Admin.

## 🚀 Features

- **Role-Based Access Control** (RBAC)
  - Borrower: Apply for loans, track applications, make payments
  - Sales: Manage leads and follow-ups
  - Sanction Officer: Review and approve/reject loans
  - Disbursement Officer: Process loan disbursements
  - Collection Officer: Track payments and manage collections
  - Admin: Full system control and user management

- **Loan Management**
  - Apply for loans with personal details
  - Upload salary slips and documents
  - Calculate loan interest (12% p.a.)
  - Track application status in real-time
  - Make payments and view payment history

- **Modern UI/UX**
  - Responsive design with Material-UI (MUI)
  - Beautiful gradient effects and animations
  - Mobile-friendly navigation
  - Toast notifications with Ant Design

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher)
- npm or yarn package manager

## 🛠️ Tech Stack

### Frontend

- Next.js 14 (App Router)
- TypeScript
- Material-UI (MUI)
- TailwindCSS
- Framer Motion
- Ant Design (Notifications)
- Axios

### Backend

- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- bcrypt for password hashing

## 📦 Installation

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/loanflow.git
cd loanflow
```

### Install Frontend Dependencies

- bash
- cd front-end/frontend
- npm install
- npm run dev

### Install Backend Dependencies

- bash
- cd ../backend
- npm install
- npm run dev

# On Windows (if installed as service)

net start MongoDB

# On macOS with Homebrew

brew services start mongodb-community

# On Linux

sudo systemctl start mongod
