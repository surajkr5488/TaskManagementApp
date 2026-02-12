Task Management Application
Overview

This project is a cross-platform Task Management application built using React Native.
The primary focus of this implementation is reliability, offline-first architecture, scalable state management, and production-grade user experience.

The application supports task creation, reminders, offline storage, background sync, and push notifications, while maintaining a clean and modern UI layer.

Architecture Approach :- 
The application follows a modular and scalable architecture designed for real-world production usage.

Key Principles :-

Separation of concerns (UI, State, Services, Storage)

Offline-first data handling

Predictable state management

Environment-based configuration

Reusable UI components

Theme-driven design system

Technology Stack
Layer	Technology
Mobile Framework -	React Native (CLI)
Language -	TypeScript
State Management -	Redux Toolkit
Backend Services -	Firebase (Auth, Firestore, FCM)
Offline Storage -	Realm / Local Database
Notifications -	Local Notifications + Firebase Cloud Messaging
Navigation	React Navigation
UI	Custom Components + Linear Gradient
Core Features
Authentication

Firebase Email / Password authentication

Persistent session handling

Secure token lifecycle management

Task Management :-

Create, update, delete tasks

Mark tasks as completed or pending

Reminder scheduling support

Visual task state indicators

Offline First Implementation

The application is designed to work without network connectivity.

Tasks are stored locally first

Sync queue handles pending updates

Automatic sync when connectivity is restored

Conflict-safe update handling

Notifications
Local Notifications

Triggered based on selected reminder time

Works in background and terminated states

Remote Notifications (FCM)

Server push capability

Token lifecycle handling

Foreground and background listeners

Theming System

Theme is fully dynamic and supports:

Light Theme

Dark Theme

Centralized color tokens

Gradient-safe fallback handling

Runtime theme switching

UI / UX Design Considerations

The UI layer is designed with production usability in mind rather than demo-level visuals.

Task List

Gradient header with network state indicator

Card-based layout for task readability

Status badges (Reminder, Sync, Overdue)

Smooth list animations

Pull-to-refresh support

Task Detail

Clean form structure

Date and time picker separation

Reminder preview system

Validation-driven submission

Data Flow
UI → Redux Action → Service Layer → Local DB → Sync Engine → Firestore
Sync Flow

Task created offline → Stored locally

Sync queue marks pending items

When online → Sync worker pushes updates

Firestore becomes source of truth

State Management Strategy

Redux Toolkit is used to:

Centralize application state

Manage async operations via thunks

Maintain predictable reducer updates

Handle optimistic UI updates

Performance Considerations

FlatList optimized rendering

Lazy screen loading

Memoized selectors

Animation driver optimization

Minimal re-render strategy

Environment Configuration

Supports multiple environments:

Development

Staging

Production

Environment variables handled using .env configuration.

Error Handling Strategy

Network fallback handling

Sync retry mechanism

Safe gradient color fallback (prevents native crashes)

Defensive theme loading checks

Security Considerations

Firebase rule-based access

User-scoped task storage

Token-based authentication flow

Secure environment config separation

Scalability Considerations

The architecture allows easy extension for:

Team task sharing

Real-time collaboration

Web dashboard integration

Analytics tracking

Role-based access

Setup Instructions
Install Dependencies
npm install

iOS:

cd ios && pod install
Firebase Setup

Add Android config → google-services.json

Add iOS config → GoogleService-Info.plist

Configure .env

Run Application
npm start -- --reset-cache
npm run android
Design Decisions
Why Redux Toolkit

Predictable state updates and simplified async handling.

Why Offline First

Improves reliability in low connectivity environments.

Why Firebase

Fast integration, scalable backend, and managed infrastructure.

Known Limitations

Conflict resolution currently last-write-wins

Notification scheduling depends on OS background policies

Future Enhancements :-

Realtime Firestore listeners

Background sync workers

Task categorization and tagging

Rich notification actions

Calendar integration

Conclusion

The application is designed to simulate a real-world production mobile application rather than a basic demo project.

Focus areas:

Reliability

Scalability

Maintainability

User Experience

Offline Capability