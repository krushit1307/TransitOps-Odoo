# TransitOps Control Tower

Smart Transport Operations Platform for fleet, dispatch, and depot management.

## Setup & Run

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`.

---

## Demo Credentials

The application uses Role-Based Access Control (RBAC). Use the credentials below to log in as different personas:

| Role | Email / Username | Password |
|------|-----------------|----------|
| **Fleet Manager** | `fleet@transitops.demo` | `Transit@123` |
| **Dispatcher** | `dispatch@transitops.demo` | `Transit@123` |
| **Safety Officer** | `safety@transitops.demo` | `Transit@123` |
| **Financial Analyst** | `finance@transitops.demo` | `Transit@123` |

---

## 5-Minute Judge Walkthrough Script

This script covers a 9-step end-to-end operation workflow and explicitly demonstrates 3 key negative paths to prove system constraints are working.

### 1. Initial Setup & Validation
- **Log in as Fleet Manager (`fleet@transitops.demo`)**
- Notice you land on the **Fleet** dashboard.
- Go to **Settings & RBAC** (left sidebar).
  - Point out the General Settings (Gandhinagar Depot GJ4).
  - Point out the **Live RBAC Matrix** (cells dynamically display access levels per role).
- Go to **Fleet** and register a new vehicle.

### 2. The 9-Step Example Workflow
1. **Register Vehicle:** Add a new vehicle via the Fleet Manager.
2. **Register Driver:** Switch to the **Drivers** tab, show how safety scores and licenses are tracked. (Point out Alex and Priya).
3. **Create Trip:** **Log out**, then **Log in as Dispatcher (`dispatch@transitops.demo`)**. Go to **Trips** -> **Create Trip**.
4. **Dispatch:** Assign the new trip to a driver and vehicle, then dispatch it.
5. **Complete:** Mark the trip as Completed (enter final odometer and fuel consumed).
6. **Maintenance:** Back in **Fleet** (Fleet Manager view), move a vehicle to **In Shop**.
7. **Cancel:** As Dispatcher, show the `TR006` trip in **Cancelled** state with the note: "Vehicle went to shop".
8. **Fuel & Expenses:** **Log in as Financial Analyst (`finance@transitops.demo`)**, view the newly created fuel logs and expense items from the completed trip.
9. **Analytics:** View the **Dashboard**, show how KPI cards zero-pad (`05`) and demonstrate the synchronous cross-filtering (change 'Vehicle Type' to 'Van' and show KPIs, Trips, and Status bars updating simultaneously).

### 3. The 3 Negative Paths (Constraints in Action)
Make sure to explicitly demonstrate these business rules:

- **Negative Path 1: Capacity Limit (BR-02)**
  - While Dispatching, attempt to create a cargo request of 700 kg and assign it to a Van (max capacity 500 kg).
  - *Result:* Blocked as over-capacity.

- **Negative Path 2: Driver Eligibility (BR-03)**
  - When creating a trip, open the Driver dropdown.
  - *Result:* **John is missing.** Explain that he is intentionally absent because he has an expired license and is Suspended.

- **Negative Path 3: RBAC UI Constraints**
  - While logged in as the Dispatcher, navigate to the **Fleet** page.
  - *Result:* The **"Add Vehicle"** button is completely hidden due to RBAC limitations (Dispatcher only has "view" access to Fleet).

---

> **Note on Lockout:** You can also demonstrate the security lockout by intentionally entering an incorrect password 5 times. On the 5th failed attempt, the account locks and displays `❌ Account locked after 5 failed attempts.`
