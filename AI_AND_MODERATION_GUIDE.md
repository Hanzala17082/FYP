# AI & Moderation Features Implementation Guide

This guide describes how to add three features to the travel platform:

1. **AI Chatbot with RAG** — Helps travelers discover trips and get trip details via natural language.
2. **Phone Number Validation Script** — Ensures phone numbers are valid and consistent for both agency and user profiles.
3. **Chat Profanity & Hate Speech Moderation** — Detects 18+ and hate speech in chat groups and alerts admins.

---

## 1. AI Chatbot with RAG (Retrieval-Augmented Generation)

### Purpose

- Let travelers ask questions in natural language about trips, destinations, dates, and details.
- Answer using **your own trip data** (RAG) so answers are accurate and up to date.
- Reduce support load and improve discovery.

### High-Level Architecture

```
Traveler → Chat UI → Chat API → RAG Pipeline → LLM → Response
                            ↓
                    Vector DB / Trip Index
                            ↑
                    Trip data (ingested & chunked)
```

### Components to Implement

| Component | Responsibility |
|-----------|----------------|
| **Trip data ingestion** | Export trips (name, description, dates, price, destination, agency, etc.) into a format suitable for indexing. |
| **Embeddings & vector store** | Chunk trip text, generate embeddings (e.g. OpenAI, Cohere, or open-source), store in a vector DB (Pinecone, Weaviate, Chroma, or pgvector). |
| **Retrieval** | On each user message, embed the query, retrieve top-k relevant trip chunks. |
| **LLM + prompt** | Build a prompt with: system instructions + retrieved trip context + user message. Send to an LLM (OpenAI, Anthropic, or local) and return the answer. |
| **Chat API** | REST or WebSocket endpoint that: accepts message, runs RAG, returns reply. Optional: store conversation history for context. |
| **Chat UI** | Frontend chat widget or page where travelers type questions and see replies (and optionally trip cards/links). |

### Data to Expose to RAG

- Trip: title, short/long description, destination, dates, price, duration, inclusions, agency name.
- Optionally: FAQs, policies, reviews summary.
- Keep PII and internal fields out of the index.

### Implementation Steps (Outline)

1. **Choose stack**
   - Embeddings: OpenAI `text-embedding-3-small`, or open-source (e.g. `sentence-transformers`).
   - Vector DB: Pinecone, Weaviate, Chroma, or PostgreSQL + pgvector.
   - LLM: OpenAI GPT-4o-mini / GPT-4, or Claude, or local (e.g. Ollama).

2. **Ingestion script/job**
   - Run when trips are created/updated (or on a schedule).
   - Chunk by trip or by logical sections (e.g. description, inclusions).
   - Generate embeddings and upsert into vector store with metadata (trip_id, agency_id, etc.).

3. **RAG API**
   - Input: `{ "message": "user question", "conversation_id?" }`.
   - Retrieve relevant chunks → build prompt with context → call LLM → return `{ "reply": "...", "suggested_trips": [...] }`.
   - Optionally attach `trip_id` to chunks so you can return “suggested trips” in the UI.

4. **Frontend**
   - Chat component: input, send, display messages.
   - Show suggested trips as cards/links when the reply references specific trips.

### Security & Cost

- Validate and sanitize user input; cap message length.
- Rate-limit per user to avoid abuse and control cost.
- Do not send PII into the LLM unless necessary; use trip metadata only.
- Store API keys (OpenAI, etc.) in environment variables; never in client.

### Suggested File Structure (Conceptual)

```
backend/
  services/
    rag/
      embeddings.service.ts    # Generate embeddings
      retrieval.service.ts     # Query vector store
      chat.service.ts          # Orchestrate RAG + LLM
  jobs/
    index-trips.job.ts         # Ingest trips into vector DB
  api/
    chat/
      route.ts                 # POST /api/chat
frontend/
  app/
    chat/                      # Or embedded widget
      page.tsx
  components/
    TravelChat/
      ChatWindow.tsx
      MessageBubble.tsx
      SuggestedTrips.tsx
```

---

## 2. Phone Number Validation Script

### Purpose

- Ensure phone numbers stored in **agency** and **user (traveler)** profiles are valid and consistently formatted.
- Run on profile create/update (or as a scheduled check) so bad data is caught early.

### What to Validate

- **Format**: E.164 recommended (e.g. `+1234567890`) or at least digits + optional `+` and country code.
- **Length**: Min/max digits per region (e.g. 10–15 digits).
- **Basic sanity**: No placeholder values like `0000000000`, `1234567890`, or obvious fakes.

### Where It Runs

- **Agency profile**: When an agency adds or edits their contact phone.
- **User profile**: When a traveler adds or edits their phone in profile settings.
- Same validation logic for both; only the source (agency vs user) differs.

### Implementation Options

**Option A: Validate on save (recommended)**  
- In backend API that handles profile update (agency + user): before persisting, run the phone validator.  
- If invalid: return `400` with a clear error (e.g. “Invalid phone number format. Use E.164, e.g. +1234567890”).  
- No separate “script” needed; it’s part of the API.

**Option B: Background/scheduled script**  
- Cron or queue job that:  
  - Loads all agency and user profiles with a phone field.  
  - Runs the same validator on each.  
  - Marks invalid ones (e.g. `phone_invalid: true`) or writes to a report table.  
  - Optionally notifies admins or the user/agency to correct.

**Option C: Both**  
- Validate on save (Option A) to block bad data.  
- Periodic script (Option B) to catch legacy data or any bypasses.

### Validation Logic (Outline)

1. Normalize: strip spaces, dashes, parentheses; keep `+` and digits.
2. Check format: regex or a library (e.g. `libphonenumber` in Node: `libphonenumber-js`).
3. Reject placeholders / test numbers if you have a blocklist.
4. Optionally validate country code and length per country.

### Suggested File Structure (Conceptual)

```
shared/
  utils/
    phoneValidator.ts         # validatePhone(phone: string) → { valid, normalized?, error? }
backend/
  api/
    agency/
      profile/
        update.ts             # Call phone validator before save
    user/
      profile/
        update.ts             # Call phone validator before save
  scripts/
    validate-all-phones.ts    # Optional: scan DB, report invalid
```

### Notifications (Optional)

- If a script finds invalid phones: send a digest to admin (e.g. “N agencies, M users have invalid phone numbers”) and/or in-app notice for agency/user to update profile.

---

## 3. Chat Groups Profanity & Hate Speech Moderation

### Purpose

- Detect **18+ (adult) content** and **hate speech** in chat group messages.
- Notify **platform admin** and **agency admin** (for agency-related groups) so they can review and take action.

### Flow

1. User sends a message in a chat group.
2. Before or after persisting, message is sent to a **moderation pipeline**.
3. Pipeline classifies: safe / adult / hate-speech (and optionally other categories).
4. If violation:  
   - Optionally block message from being shown (or show only after review).  
   - Create an alert/flag for admins.  
   - Notify platform admin and, if applicable, agency admin.

### Moderation Options

| Approach | Pros | Cons |
|----------|------|------|
| **Third-party API** (OpenAI Moderation, Perspective API, etc.) | Fast to integrate, maintained | Cost, data sent to third party, dependency |
| **Self-hosted model** (e.g. Hugging Face transformers) | Data stays in-house, no per-call API cost | More DevOps, tuning, and maintenance |
| **Keyword / rule-based** | Simple, no external call | Easy to evade, many false positives/negatives |

Recommended for a first version: **OpenAI Moderation API** or **Google Perspective API** for toxicity/hate; add a second layer (keyword or another model) for 18+ if the API doesn’t cover it.

### What to Send to Moderation

- **Input**: Plain text of the message (and optionally recent context).  
- **Output**: Categories (e.g. `hate`, `sexual`, `violence`) and scores or binary flags.  
- Define thresholds (e.g. if `hate` or `sexual` > 0.8 → flag and notify).

### Who Gets Notified

- **Platform admin**: All violations (so they have full visibility).  
- **Agency admin**: Only violations in chats tied to that agency (e.g. trip discussion groups, agency support chats).  
- Decide whether to notify in real time (e.g. push/email) or via an “Moderation queue” in admin dashboard.

### Implementation Steps (Outline)

1. **Chat message pipeline**
   - When a group message is created: after saving (or before, if you want to block before storage), call the moderation service with message text.

2. **Moderation service**
   - Call external API or local model.  
   - Return: `{ safe: boolean, categories: { hate: number, adult: number, ... } }`.  
   - If not safe: create `ModerationFlag` (or similar) with message_id, channel_id, user_id, categories, timestamp.

3. **Notification**
   - On new flag:  
     - Insert into admin “moderation queue”.  
     - Resolve agency_id from channel/group → notify agency admin.  
     - Always notify platform admin (e.g. list in dashboard or email digest).

4. **Admin UI**
   - **Platform admin**: List all flags, filter by type (hate, 18+), link to message and user, actions (e.g. delete message, warn user, suspend).  
   - **Agency admin**: Same but filtered to their agency’s channels.

### Privacy & Compliance

- Retain only what’s needed for moderation and appeals (e.g. message id, user id, timestamp, category).  
- Document in privacy policy that messages may be processed for safety.  
- Consider hashing or truncating message content in notifications if possible.

### Suggested File Structure (Conceptual)

```
backend/
  services/
    moderation/
      moderation.service.ts   # Call OpenAI/Perspective/etc.
      flag.service.ts        # Create/list ModerationFlag
  api/
    chat/
      send-message.ts         # After save → call moderation
  jobs/
    notify-moderation.ts     # Or inline in send-message
  db/
    ModerationFlag.ts        # Schema: messageId, channelId, userId, categories, notifiedAdmins
frontend/
  app/
    admin/
      moderation/            # Queue for platform admin
        page.tsx
    agency/
      moderation/            # Queue for agency admin (their channels only)
        page.tsx
```

---

## Summary Checklist

| Feature | Main deliverable | Key dependency |
|--------|------------------|----------------|
| **RAG Chatbot** | Trip index + retrieval + LLM API + chat UI | Vector DB, embeddings, LLM API keys |
| **Phone validation** | Validator used in agency + user profile APIs; optional batch script | Validation library (e.g. libphonenumber-js) |
| **Profanity / hate speech** | Moderation service + flag storage + admin + agency notifications | Moderation API or model + chat message hook |

Use this guide as the single source of truth for design and scope when implementing each feature. Implement in order: phone validation (quick), then moderation (needed once chat exists), then RAG chatbot (largest effort).
