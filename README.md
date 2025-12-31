🔐 Project Title

GhostChat Web – Secure Group & Media Messaging System

📌 Project Overview

GhostChat Web is a high-security web-based chat application designed for confidential communication, especially suitable for government, defense, legal, and internal organizational use.

The system allows users to:

Create private chats and group chats

Send secure text messages

Share secure images

Prevent screenshots, screen recording, and unauthorized copying

Make captured photos or screenshots unreadable and traceable

The project is built using Next.js and Redux for the frontend, and Node.js with Express for the backend, following modern security practices.

❗ Problem Statement

In many sensitive environments (government offices, investigations, internal teams):

Messages and images are easily leaked

Screenshots and camera photos cannot be controlled

Media files can be downloaded and shared without tracking

There is no accountability if data is leaked

Traditional chat applications focus on convenience, not confidentiality.

✅ Our Solution

GhostChat Web focuses on data protection over convenience.

Instead of trying to do the impossible (blocking all photos), the system:

Prevents digital capture where possible

Makes camera-captured data useless

Identifies the source of leaks

Ensures messages and images never exist in plain form on the server

🧠 Core Concept (Very Important)

Text and images are never sent or stored in plain form.
They are encrypted, rendered securely, and controlled per user session.

🏗️ System Architecture
Frontend

Next.js (UI & routing)

Redux Toolkit (state & security control)

Canvas API (secure rendering)

WebSockets (real-time messaging)

Backend

Node.js + Express

JWT-based authentication

Encrypted message storage

WebSocket server for real-time communication

Audit logging system

👤 User Features
1. Authentication

Secure login using JWT

Device/session validation

Auto logout on suspicious activity

2. Private & Group Chats

1-to-1 private messaging

Group creation with admin roles

Admin can add/remove users

Group access controlled by encryption keys

🔐 Message Security (Text)
How Text Messages Work

User types a message

Message is encrypted in the browser

Encrypted message is sent to the server

Server stores only encrypted data

Receiver decrypts message locally

Message is rendered using canvas, not plain text

Result

No copy-paste

No text extraction

Screenshots show blurred or blank content

🖼️ Image Security (Most Important Feature)
How Secure Images Work

User uploads an image

Image is encrypted before upload

Server stores only encrypted image

Receiver decrypts image in browser

Image is rendered on a canvas, not <img>

Invisible watermark is added per viewer

Slight motion and noise applied dynamically

Result

Right-click download blocked

Screenshots become useless

Camera photos are blurred/distorted

Leaked images can be traced to the user

👥 Group Security Model

Each group has a unique encryption key

Group key is shared securely with members

When a user is removed, access is revoked

Admin can rotate group keys

🚫 Screenshot & Capture Protection
Implemented Techniques

Screenshot detection (focus & visibility change)

DevTools detection

Secure rendering (canvas)

Automatic blur on suspicious behavior

Disabled selection, copy, drag, and save

🧾 Audit & Monitoring

Every important action is logged:

Message viewed

Image accessed

User joined/removed

Suspicious activity detected

These logs help in accountability and investigation.

🎯 Use Cases

Government internal communication

Law enforcement coordination

Whistleblower systems

Corporate confidential discussions

Legal document sharing

⚠️ Honest Limitation (Important for Interview)

The system cannot physically stop someone from photographing a screen, but it:

Makes the captured data unreadable

Discourages leaks

Enables leak traceability

This is the maximum security achievable on the web.

🧪 Demo Scenarios

Screenshot → chat turns blank

Screen recording → content hidden

Camera photo → unreadable image

User removed from group → access lost

Leak occurs → watermark identifies source

🧠 Why This Project Is Strong

Real-world security thinking

Uses encryption correctly

Solves an actual problem

Honest and technically sound

Excellent for internships & hackathons

📄 One-Line Resume Description

Built a secure web-based messaging system using Next.js, Redux, Node.js, and Express with encrypted text and image communication, screenshot prevention, secure canvas rendering, and group-based access control.

🚀 Next Steps (I’ll Build With You)

If you want, next I can:

Create folder structure

Write backend APIs

Build secure canvas components

Design UI screens

Prepare PPT slides

Help you deploy safely
