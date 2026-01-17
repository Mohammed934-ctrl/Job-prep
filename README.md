# 🧠 User Onboarding, Caching & Revalidation System  
### Next.js App Router + Clerk + Drizzle + Next Cache Tags

This README documents the **complete reasoning, flow, and benefits** of the user onboarding system implemented in this project.

It is written so that future-you can:
- Quickly revise the logic
- Understand *why* each file exists
- Avoid reintroducing auth, cache, or race-condition bugs

---

## 📌 The Core Problem

When using **Clerk authentication**, two different “users” exist:

1. **Auth User (Clerk)**
   - Created instantly on signup
   - Available immediately via `auth()`

2. **Database User (Drizzle / PostgreSQL)**
   - Created asynchronously (webhook or server logic)
   - May not exist when the app first loads

### ❗ Problem

Redirecting a new user directly to `/app` can fail because:
- Clerk user exists ✅
- Database user does NOT exist ❌

This causes:
- Race conditions
- Broken pages
- Bad UX

---

## ✅ High-Level Solution

We introduce:
- A server-side onboarding gate
- A client-side polling mechanism
- Cached server actions
- Explicit cache revalidation

This guarantees:
- App loads **only after DB user exists**
- Minimal database usage
- Fully consistent data

---

## 🗂 Relevant Files

```
app/onboarding/page.tsx
app/onboarding/client.tsx

features/user/action.ts
features/user/db.ts
features/user/dbcache.ts

services/lib/getCurrentUser.ts
src/lib/datacache.ts
```

---

## 1️⃣ Onboarding Page (Server Component)

**File:** `app/onboarding/page.tsx`

### Purpose
- Check authentication
- Check DB user existence
- Redirect when possible
- Show onboarding UI only when needed

### Key Logic
- If user not logged in → redirect `/`
- If DB user exists → redirect `/app`
- Otherwise → show onboarding loader

This page acts as a **safe waiting room**.

---

## 2️⃣ Onboarding Client (Polling)

**File:** `app/onboarding/client.tsx`

### Purpose
- Poll server until DB user exists
- Redirect user immediately after creation

### Why polling?
- DB user creation is async
- No guaranteed timing
- Polling is simple and reliable

### Why `clearInterval`?
1. Stop polling once user exists  
2. Prevent memory leaks on unmount

---

## 3️⃣ Cached Server Action

**File:** `features/user/action.ts`

### Purpose
- Fetch user from DB
- Cache result for performance
- Tag cache for revalidation

### Key Concepts
- `"use cache"` → enables Next.js caching
- `cacheTag()` → allows targeted invalidation

---

## 4️⃣ Database Writes & Revalidation

**File:** `features/user/db.ts`

### Purpose
- Insert / update user
- Delete user
- Revalidate cache immediately

### Why revalidation?
Cached reads may still return `null` or stale data.
Revalidation forces fresh DB reads.

---

## 5️⃣ Cache Tag Strategy

**File:** `features/user/dbcache.ts`

### Tags Used
- User-specific: `id:<userId>:user`
- Global: `global:user`

Revalidating both ensures:
- Individual pages update
- Lists & dashboards stay consistent

---

## 6️⃣ Global Cache Naming

**File:** `src/lib/datacache.ts`

### Purpose
- Centralize cache tag naming
- Prevent typos
- Scale caching to new entities

---

## 🔁 End-to-End Flow

```
User signs up
        ↓
Clerk auth user created
        ↓
User visits /onboarding
        ↓
DB user missing → show loader
        ↓
Client polls server
        ↓
DB user inserted
        ↓
Cache revalidated
        ↓
Next poll succeeds
        ↓
Redirect to /app
```

---

## ✅ Benefits

- No race conditions
- Works perfectly with webhooks
- Efficient DB usage
- Predictable behavior
- Easy to debug and scale

---

## 🧠 One-Line Mental Model

**Auth is instant.  
DB is async.  
Cache makes it fast.  
Revalidation makes it correct.**

---

## 📌 Debug Checklist

If onboarding feels stuck:
1. Is DB user created?
2. Is `revalidateUsercache()` called?
3. Are cache tags correct?
4. Is polling still running?

---

This README exists so future-you never has to rediscover this logic again.
