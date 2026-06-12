---
title: "CareLink Project Documentation"
author: "Engineering Team"
date: "June 2026"
version: "1.0.0"
---

# CareLink: Hospital Priority Queue Management System
## Software Implementation & Deployment Document

---

## Table of Contents
1. [Executive Summary](#1-executive-summary)
2. [System Architecture](#2-system-architecture)
3. [Core Subsystems & Features](#3-core-subsystems--features)
   - 3.1 [Smart Triage & Priority Engine](#31-smart-triage--priority-engine)
   - 3.2 [Patient Portal](#32-patient-portal)
   - 3.3 [Admin Queue Management](#33-admin-queue-management)
4. [Recent Modifications](#4-recent-modifications)
5. [Deployment & Hosting Strategy](#5-deployment--hosting-strategy)
6. [Future Roadmap](#6-future-roadmap)

---

## 1. Executive Summary

CareLink is a modern, intelligent Hospital Priority Queue Management System designed to optimize patient intake and treatment workflows. By replacing traditional First-Come-First-Serve (FCFS) methodologies with dynamic, triage-based priority scheduling, CareLink ensures that patients experiencing critical or life-threatening conditions receive immediate medical attention. The system provides a unified interface for both patients (for booking and tracking) and hospital administrators (for queue management and emergency intake).

## 2. System Architecture

The application is architected as a modern Single-Page Application (SPA) leveraging Server-Side Rendering (SSR) capabilities where applicable, ensuring high performance and SEO compliance.

*   **Framework:** Next.js 14 (App Router)
*   **Language:** TypeScript (Strict Mode)
*   **Styling:** Tailwind CSS
*   **State Management:** React Hooks coupled with a LocalStorage abstraction layer (`src/lib/store.ts`) for simulated persistent state across browser sessions.
*   **Routing:** Next.js App Router providing strict separation of concerns via role-based route groups (e.g., `/dashboard/patient` and `/dashboard/admin`).

## 3. Core Subsystems & Features

### 3.1 Smart Triage & Priority Engine
At the core of CareLink is the intelligent priority engine designed to emulate medical triage protocols:
*   **Symptom Analyzer:** An algorithmic engine (`symptom-analyzer.ts`) that evaluates user-submitted symptoms and pre-existing medical conditions to assign a deterministic priority score ranging from 0 to 100.
*   **Max-Heap Priority Queue:** A custom data structure (`priority-queue.ts`) guaranteeing `O(log n)` time complexity for both insertion and extraction operations. This ensures the system remains performant even under high patient load, always surfacing the most critical patient first.
*   **Wait-Time Decay:** To prevent starvation of lower-priority cases, the system incorporates a decay factor where priority scores artificially inflate based on elapsed waiting time.

### 3.2 Patient Portal
The patient-facing interface is designed for accessibility, clarity, and ease of use:
*   **Secure Authentication:** A streamlined, secure username and password authentication flow.
*   **Real-Time Dashboard:** Provides patients with live updates regarding their exact position in the queue and algorithmically estimated wait times.
*   **Guided Booking Wizard:** A multi-step flow allowing patients to select a specific medical department, choose an available physician, pick a time slot, and input their current symptoms. The system provides an immediate estimated priority level before final confirmation.

### 3.3 Admin Queue Management
The administrative portal provides hospital staff with comprehensive control over the patient flow:
*   **Live Queue Monitoring:** A centralized dashboard displaying the fully sorted queue, allowing staff to rebalance scores and transition patient statuses (e.g., "In Progress", "Completed").
*   **Emergency Patient Intake:** A dedicated, high-visibility 🚨 **Add Emergency Patient** workflow. This allows administrators to bypass the standard booking process for walk-ins or critical arrivals, forcing a `HIGH` priority assignment (Score ≥ 75) and immediately injecting the patient at the top of the queue.
*   **System Rebalancing:** Both manual trigger and interval-based automated rebalancing mechanisms to recalculate all patient scores dynamically.

## 4. Recent Modifications

To refine the user experience and maintain professional standards, the following adjustments were recently integrated:
1.  **Unified Authentication:** Removed simulated Google OAuth from both Patient Login and Signup pages to enforce a clean, username/password-only flow.
2.  **UI Cleanup:** Removed exposed demo credentials from the login interfaces for a production-ready appearance.
3.  **Homepage Redesign:** Restructured the landing page sections ("Why Choose CareLink?" and "Everything You Need") from cluttered 12-item grids into focused, highly readable 3-column and 2-column layouts with refined iconography.
4.  **Admin Workflow Optimization:** Upgraded the Admin Queue management interface by prioritizing the new `Add Emergency Patient` form, demoting the standard rebalance action to a secondary state for better operational efficiency.

## 5. Deployment & Hosting Strategy

The system is fully prepared for continuous integration and deployment. The recommended approach utilizes GitHub and Vercel.

### 5.1 Version Control Initialization (GitHub)
```bash
# Initialize local repository
cd C:\Users\aston\Desktop\carelink
git init
git add .
git commit -m "Initial commit: CareLink Priority Queue System MVP"

# Push to remote repository
git remote add origin https://github.com/YOUR_USERNAME/carelink.git
git branch -M main
git push -u origin main
```

### 5.2 Production Deployment (Vercel)
1.  Navigate to the [Vercel Dashboard](https://vercel.com/) and authenticate via GitHub.
2.  Select **Add New...** > **Project**.
3.  Import the newly pushed `carelink` repository.
4.  Maintain the default build configurations (Vercel will auto-detect Next.js).
5.  Execute **Deploy**.
6.  The application will be provisioned with a secure, globally distributed edge URL (HTTPS).

## 6. Future Roadmap
*   **Persistent Backend Integration:** Transition from the `localStorage` simulation to a robust relational database (e.g., PostgreSQL) utilizing an ORM like Prisma.
*   **Production Authentication:** Implement `NextAuth.js` (Auth.js) for secure, JWT-based user session management.
*   **Real-Time Synchronization:** Integrate WebSockets (e.g., Socket.io or Pusher) to push live queue updates to client devices instantaneously without reliance on polling.
