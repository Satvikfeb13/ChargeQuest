# ⚡ Project: ChargeQuest - Interview Preparation Guide
**EV Charging Station Booking System**

---

## 📋 Tech Stack
*   **Frontend**: React (Vite/CRA)
*   **Backend**: Spring Boot (Java 21)
*   **Database**: MySQL
*   **Authentication**: JWT (Stateless)
*   **Architecture**: Layered Monolithic (MVC)
*   **Version Control**: Git & GitHub

---

# 1️⃣ PROJECT OVERVIEW

### ❓ What problem does ChargeQuest solve?
ChargeQuest solves the real-world problem of **EV Range Anxiety** and **Charging Infrastructure Uncertainty**:
*   Uncertainty in EV charging availability.
*   Manual station booking & poor queue management.
*   No centralized booking platform.
*   No visibility into slot availability or pricing.

**ChargeQuest provides:**
*   Real-time booking & slot reservation.
*   Digital payment integration (Razorpay).
*   Role-based station management (Admin/Owner/User).

### 🌍 Real-World Use Case
**An EV Owner:**
1.  Opens ChargeQuest.
2.  Searches nearby stations.
3.  Views real-time availability.
4.  Books a time slot & pays online.
5.  Reaches station without waiting.

**Station Owners:** Manage slots, view bookings, track revenue.
**Admins:** Manage platform, monitor users, control stations.

### 🔑 Key Features
*   **Basic**: Registration, Login, Browse Stations, Book Slot, Cancel Booking.
*   **Intermediate**: Role-based Access Control (RBAC), Secure Authentication, Slot Conflict Prevention.
*   **Advanced**: Payment Integration, Optimistic/Pessimistic Locking, Audit Logging.

---

# 2️⃣ HIGH-LEVEL ARCHITECTURE

### 🏗 Overall System Design
ChargeQuest follows a **Layered Monolithic Architecture** using Spring Boot:

**Frontend (React)**  
⬇  
**REST APIs (Spring Boot - Tomcat)**  
⬇  
**Controller Layer (Web Layer)**  
⬇  
**Service Layer (Business Logic)**  
⬇  
**Repository Layer (JPA/Hibernate Data Access)**  
⬇  
**MySQL Database**

### 🔄 Frontend ↔ Backend ↔ Database Interaction
1.  **React** sends HTTP request via Axios.
2.  **JWT** is attached in the `Authorization` header.
3.  **Spring Security Filter Chain (`JwtFilter`)** validates the token.
4.  **DispatcherServlet** routes request to the correct Controller.
5.  **Service** executes business logic within a `@Transactional` context.
6.  **Repository Interface (`JpaRepository`)** executes SQL query via Hibernate.
7.  Response returned as JSON DTO.

### 🔐 Authentication & Authorization Flow
1.  User logs in.
2.  `AuthenticationManager` validates credentials against DB.
3.  **JWT Access Token** generated using `jjwt` library.
4.  Token returned to frontend.
5.  Frontend stores token (localStorage).
6.  All protected APIs validate token via `OncePerRequestFilter`.

---

# 3️⃣ DETAILED FLOWS

### 📝 User Registration Flow
1.  React → `POST /api/v1/auth/register`
2.  Controller receives `@RequestBody UserDTO`.
3.  Service checks if email exists (`repository.existsByEmail()`).
4.  Password hashed using `BCryptPasswordEncoder`.
5.  User entity saved via `repository.save()`.
6.  Response `201 Created`.

### 🔑 Login & JWT Flow
1.  React → `POST /api/v1/auth/login`
2.  `AuthenticationManager.authenticate()` verifies email & password.
3.  If successful, `JwtUtils.generateToken()` creates the JWT.
4.  Token returned in JSON response: `{"token": "ey..."}`.
5.  React saves token.

### 🛡 Protected API Flow
1.  React sends request with `Authorization: Bearer <token>`.
2.  **`CustomJwtVerificationFilter`** parses the header.
3.  `JwtUtils.validateToken()` checks signature and expiry.
4.  If valid → Sets `SecurityContextHolder.getContext().setAuthentication(...)`.
5.  Controller executes.
6.  If invalid → Filter throws exception, returning **401 Unauthorized**.

### ❌ Error Handling Flow
1.  Exception thrown in Service (e.g., `BookingException`).
2.  Caught by **Global Exception Handler** (`@RestControllerAdvice`).
3.  Method annotated with `@ExceptionHandler` handles specific error.
4.  Returns `ResponseEntity` with unified Error DTO (status, message, timestamp).

---

# 4️⃣ PROJECT FOLDER STRUCTURE

### 📂 Backend Structure (Spring Boot Standard)
```text
src/main/java/com/chargequest/
 │
 ├── config/            → SecurityConfig, SwaggerConfig, CorsConfig
 ├── controller/        → REST Controllers (AuthController, BookingController)
 ├── service/           → Business Logic Interfaces & Implementations
 ├── repository/        → JPA Interfaces (UserRepository, BookingRepository)
 ├── model/             → JPA Entities (User, Station, Booking)
 ├── dto/               → Data Transfer Objects (Requests/Responses)
 ├── customException/   → Custom Exception classes
 ├── globalException/   → Global Exception Handler (@RestControllerAdvice)
 ├── utils/             → JWT Utility class
 └── ChargeQuestApplication.java → Main entry point
```

### 📂 Frontend Structure
```text
frontend/
│
├── src/
│   ├── api/          → Axios configs
│   ├── components/   → Reusable components
│   ├── pages/        → Page-level components
│   ├── context/      → AuthContext
│   ├── routes/       → ProtectedRoute
│   ├── utils/        → Helpers
│   └── App.js
```

---

# 5️⃣ DATABASE DESIGN

### 🗄 Tables

**1. users**
*   `id` INT PK
*   `name` VARCHAR(100)
*   `email` VARCHAR(150) UNIQUE (Indexed)
*   `password` VARCHAR(255)
*   `role` ENUM('USER','OWNER','ADMIN')

**2. stations**
*   `id` INT PK
*   `name`, `location`, `price`, `owner_id` (FK)

**3. bookings**
*   `id` INT PK
*   `user_id` INT FK
*   `station_id` INT FK
*   `booking_date`, `slot_time`, `status`
*   **Unique constraint**: `(station_id, booking_date, slot_time)` (Prevents Double Booking)

---

# 6️⃣ SECURITY CONSIDERATIONS

*   **Password Hashing**: `BCrypt` with salt.
*   **JWT**: Signed with HMAC-SHA256 secret.
*   **SQL Injection**: Prevented by JPA Parameterized Queries.
*   **CORS**: Configured to restrict allowed origins.
*   **XSS**: Input sanitization and React's auto-escaping.

---

# 🎤 INTERVIEW Q&A

## 🏗 SECTION 1 – Project & Architecture

**1. Explain your project in 2 minutes.**
"I worked on ChargeQuest, an EV Charging Station Management System. It solves EV range anxiety by allowing users to find stations and book slots in real-time.
*   **Backend**: Spring Boot 3 (Java 21), Spring Security (JWT), MySQL.
*   **Frontend**: React.
*   **Features**: Role-based access, Razorpay payments, Concurrency handling for bookings."

**2. What is the architecture?**
"Layered Monolithic Architecture.
*   **Controller**: Handles Requests.
*   **Service**: Business Logic.
*   **Repository**: Data Access.
*   **Reason**: Simplifies development/deployment for this scale. Can mock services for testing."

**3. Request Flow?**
`React` -> `DispatcherServlet` -> `Controller` -> `Service` -> `Repository` -> `MySQL`.

## 🔐 SECTION 2 – Authentication & JWT

**1. How does auth work?**
"Stateless JWT Authentication.
1.  User logs in -> Server verifies DB -> Generates JWT.
2.  Client sends JWT in `Authorization` header.
3.  `CustomJwtVerificationFilter` intercepts request, verifies signature, sets SecurityContext."

**2. Where is it validated?**
"In the `doFilterInternal` method of my custom filter, using `jjwt` library to parse and verify the signature."

**3. Security Risks?**
"**XSS** if storing in localStorage (can be mitigated with HttpOnly cookies). **Tampering** is prevented by the JWT signature (Secret Key)."

## 💾 SECTION 3 – Database & JPA

**1. N+1 Problem?**
"Fetching 10 Bookings triggers 1 query for list + 10 queries for Users.
**Fix**: Use JPQL `JOIN FETCH` (e.g., `SELECT b FROM Booking b JOIN FETCH b.user`)."

**2. save() vs saveAndFlush()?**
"`save()` persists to context (delayed write). `saveAndFlush()` forces immediate SQL `INSERT`. Used when I need the generated ID immediately."

## 🔄 SECTION 4 – Concurrency (Critical)

**1. Handling Race Conditions (Double Checking)?**
"1. **App Level**: Check `hasOverlappingBooking()`.
2. **DB Level**: **Unique Constraint** on `(station_id, start_time)`. This is the ultimate guard—DB rejects second insert."

**2. @Transactional?**
"Guarantees Atomicity. If Payment succeeds but Booking save fails, everything rolls back."

## ⚛ SECTION 5 – React

**1. AuthContext?**
"Uses React Context API to hold global `user` state. Checks `localStorage` on load to persist login."

**2. Axios Interceptor?**
"Automatically attaches `Authorization: Bearer token` to every outgoing request."

## 🚀 SECTION 6, 7, 8 – Production & Design

**1. Scaling?**
"Stateless backend allows horizontal scaling behind a Load Balancer. Database Read Replicas. Redis Caching for Stations."

**2. SQL Injection?**
"JPA uses Prepared Statements by default. Inputs are treated as data, not executable code."

## 🧩 SECTION 11 – DSA (Java)

**1. Find Duplicates?**
"Use a `HashSet`. Iterate array, if `set.add(x)` returns false, it's a duplicate."

**2. ArrayList vs LinkedList?**
"ArrayList = Fast Access (O(1)), Slow Insert (O(N)). LinkedList = Slow Access (O(N)), Fast Insert (O(1))."

## ☕ SECTION 12 – Core Java

**1. HashMap Internals?**
"Array of Buckets. Key determines index via `hashCode`. Collisions form Linked List. Java 8 converts list to Red-Black Tree if > 8 nodes."

**2. Interface vs Abstract Class?**
"Interface = Contract (Multiple Impl). Abstract Class = Shared Identity/State (Single Inheritance)."
