# RehanFertilizers

Ahsan Fertilizer & Crops Store - Complete Business Management System built with Next.js and Supabase.

## Features

- Dashboard with real-time sales, profit, and stock metrics
- Sales management with cash/loan payment tracking
- Purchase recording and stock management
- Crop inventory tracking
- Customer loan tracking with overdue alerts
- Low stock and overdue loan notifications
- Daily and monthly reports
- Export to Excel, PDF, and JSON backup

## Tech Stack

- **Next.js 16** (App Router, TypeScript)
- **Supabase** (PostgreSQL database)
- **React 19**

## Setup

1. Clone the repo
2. Run `npm install`
3. Create a Supabase project and run `supabase/schema.sql` in the SQL Editor
4. Create `.env.local` with your credentials:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```
5. Run `npm run dev`
