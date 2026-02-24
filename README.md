# ClickDown — Project Management

A ClickUp-inspired project management app built with **Angular 21**, **Angular Material**, and **Tailwind CSS**.

## 🚀 Live Demo

**[https://windowsz.github.io/ds-clickdown/](https://windowsz.github.io/ds-clickdown/)**

[![Deploy to GitHub Pages](https://github.com/Windowsz/ds-clickdown/actions/workflows/deploy.yml/badge.svg)](https://github.com/Windowsz/ds-clickdown/actions/workflows/deploy.yml)

---

## ✨ Features

- **Dark sidebar** — workspace switcher, collapsible spaces / folders / lists tree
- **Home dashboard** — greeting, stats cards, my tasks, activity feed
- **List view** — tasks grouped by status with columns (assignee, due date, priority, tags)
- **Board / Kanban view** — drag-ready status columns with task cards
- **Calendar view** — monthly navigation with tasks plotted on due dates
- **Task detail panel** — slide-in panel with subtasks, comments & activity tabs
- **Inbox** — all / unread notifications
- **My Work** — all / overdue / upcoming task tabs

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | Angular 21 (standalone components, signals) |
| UI Components | Angular Material v21 |
| Styling | Tailwind CSS v3 + SCSS |
| State | Angular Signals (`signal`, `computed`) |
| Routing | Angular Router (lazy-loaded) |
| CI / CD | GitHub Actions → GitHub Pages |

---

## 💻 Local Development

```bash
npm install
npx ng serve
```

Then open **http://localhost:4200/**

## 🏗 Production Build

```bash
npx ng build --configuration production
```

Output is placed in `dist/ds-clickdown-v21/browser/`.

## 📁 Project Structure

```
src/app/
├── core/
│   ├── models/          # Task, Space, User interfaces
│   └── services/        # WorkspaceService (signals-based state)
├── layout/
│   ├── sidebar/         # Dark nav sidebar
│   └── header/          # Top bar with view switcher
└── features/
    ├── home/            # Dashboard page
    ├── inbox/           # Notifications
    ├── my-work/         # Personal task tracker
    └── space/
        ├── list-view/   # Task list grouped by status
        ├── board-view/  # Kanban board
        ├── calendar-view/
        └── task-detail/ # Slide-in task panel
```
