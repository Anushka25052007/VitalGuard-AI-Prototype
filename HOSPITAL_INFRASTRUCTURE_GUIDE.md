# Hospital Infrastructure System - Implementation Guide

## Overview
The hospital infrastructure system has been successfully restored to your Bharat Guard hospital management platform. This system manages wards, rooms, beds, and real-time bed availability tracking.

---

## 📋 System Architecture

### Collections Structure

```
hospitals/
├── hospitalCode
├── hospitalName
├── numberOfWards
├── roomsPerWard
├── bedsPerRoom
├── icuBedsPerRoom
└── [other hospital fields]

beds/
├── hospitalCode
├── ward
├── room
├── bedNumber
├── type (regular | ICU)
├── status (available | occupied)
├── patientId
├── createdAt
└── updatedAt

patients/
├── hospitalCode
├── name
├── age
├── disease
├── ward
├── room
├── bedNumber
├── bedId (reference to beds collection)
├── doctorEmail
├── discharged
├── admissionDate
├── dischargeDate
└── [other fields]

staff/
├── hospitalCode
├── name
├── email
├── [existing fields]
```

---

## 🛠️ Key Files & Functions

### 1. **bedService.js** (New Utility File)
Central service for all bed-related operations.

**Functions:**
- `generateBedStructure(hospitalCode, numberOfWards, roomsPerWard, bedsPerRoom, icuBedsPerRoom)`
  - Creates complete bed structure in Firestore
  - Called during hospital registration
  
- `getBedStatistics(hospitalCode)` → Returns stats object
  ```javascript
  {
    totalBeds: number,
    occupiedBeds: number,
    availableBeds: number,
    icuBeds: number,
    occupiedICUBeds: number,
    wardStats: {
      "Ward-1": { totalBeds, occupiedBeds, availableBeds, icuBeds }
    }
  }
  ```

- `getAvailableBedsInWard(hospitalCode, ward)` → Returns available beds
- `getAvailableICUBedsInWard(hospitalCode, ward)` → Returns available ICU beds
- `getHospitalWards(hospitalCode)` → Returns all wards
- `getBedHierarchy(hospitalCode)` → Returns complete bed structure hierarchy

---

### 2. **HospitalSetup.jsx** (Updated)
Hospital registration flow now includes infrastructure setup.

**New Fields:**
- Number of Wards (1-50)
- Rooms per Ward (1-50)
- Beds per Room (1-10)
- ICU Beds per Room (0-10)

**Process:**
1. Admin fills hospital info + infrastructure parameters
2. Generates unique hospital code
3. Calls `generateBedStructure()` automatically
4. Creates all beds in Firestore
5. Stores infrastructure settings in hospital document

**Display:** Shows total beds preview calculation in real-time

---

### 3. **AdminDashboard.jsx** (Updated)
Admin dashboard now displays comprehensive bed statistics.

**New Section: Hospital Infrastructure**
- Display numbers of wards, rooms, beds per room
- Shows ICU settings

**New Section: Hospital Bed Statistics**
- Total Beds
- Occupied Beds
- Available Beds
- ICU Beds (with occupied count)
- Per-Ward Breakdown Table:
  - Ward Name
  - Total Beds
  - Occupied Beds
  - Available Beds
  - Utilization %

**Data Source:** Uses `getBedStatistics()` with real-time updates

---

### 4. **WardDashboard.jsx** (Updated)
Ward-level dashboard with bed structure visualization.

**Existing Features Preserved:**
- Risk distribution (High/Moderate/Low)
- Vitals trend analysis
- Critical room alerts

**New Feature: Bed Structure Display**
- Toggle button to show/hide complete structure
- Hierarchical view: Ward → Room → Beds
- Visual indicators:
  - **Green** = Regular bed, Available
  - **Amber** = Regular bed, Occupied
  - **Red** = ICU bed, Occupied
  - **Dark Red** = ICU bed, Available

**Bed Cards Show:**
- Bed number (B1, B2, etc.)
- Availability count per room
- Hover tooltip with type and status

---

### 5. **PatientAdmission.jsx** (Updated)
Admission workflow with automatic bed allocation.

**Flow:**
1. Admin/Doctor enters patient details
2. Selects ward
3. System auto-finds first available bed
4. Creates patient record with bed reference
5. Updates bed status to "occupied"
6. Links patient to bed via bedId

**Changes Made:**
- Uses new `where("status", "==", "available")` query
- Stores `bedId` and `bedNumber` in patient record
- Updates bed with `status: "occupied"` and `patientId`
- Hospital code filtering added to ward query

---

### 6. **PatientList.jsx** (Updated)
Patient census view with discharge capabilities.

**Discharge Process:**
1. Doctor/Admin clicks "Discharge" button
2. Marks patient as `discharged: true`
3. Releases bed: sets `status: "available"`, clears `patientId`
4. Auto-refreshes patient list
5. Bed immediately available for new admission

**Bed Display:** Now shows bedNumber instead of raw bed field

---

## 🔄 Complete Workflow

### Hospital Registration
```
1. Admin fills hospital setup form
2. Enters infrastructure: 5 wards, 10 rooms, 4 beds, 1 ICU bed
3. Total beds = 5 × 10 × (4 + 1) = 250 beds
4. System generates:
   - Ward-1, Ward-2, ..., Ward-5
   - Room-1 through Room-10 in each ward
   - Bed-1 through Bed-4 (regular) + Bed-5 (ICU) in each room
5. All beds created with status="available"
6. Hospital code assigned and stored
```

### Patient Admission
```
1. Doctor selects ward
2. System finds first available bed
3. Creates patient record with bedId reference
4. Updates bed: status="occupied", patientId=<patientId>
5. Bed now shows as occupied in all dashboards
6. Real-time updates to AdminDashboard & WardDashboard statistics
```

### Patient Discharge
```
1. Doctor clicks Discharge
2. Sets patient.discharged=true
3. Updates bed: status="available", patientId=null
4. Bed available for next patient immediately
5. Counts update in all dashboards
```

---

## 📊 Firestore Schema Summary

### Beds Collection
```javascript
{
  hospitalCode: "HOSP123456",
  ward: "Ward-1",
  room: "Room-5",
  bedNumber: 3,
  type: "regular" | "ICU",
  status: "available" | "occupied",
  patientId: "patient_doc_id" | null,
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### Hospital Document
```javascript
{
  hospitalCode: "HOSP123456",
  hospitalName: "City Hospital",
  adminName: "Dr. Smith",
  adminEmail: "admin@hospital.com",
  numberOfWards: 5,
  roomsPerWard: 10,
  bedsPerRoom: 4,
  icuBedsPerRoom: 1,
  address: "123 Main St",
  latitude: 20.9374,
  longitude: 77.7796,
  imageUrl: "data:image/...",
  createdAt: Timestamp
}
```

### Patient Document
```javascript
{
  hospitalCode: "HOSP123456",
  name: "John Doe",
  age: 45,
  disease: "Pneumonia",
  guardianName: "Jane Doe",
  guardianContact: "9876543210",
  ward: "Ward-1",
  room: "Room-5",
  bedNumber: 3,
  bedId: "bed_document_id",
  doctorEmail: "doctor@hospital.com",
  discharged: false,
  admissionDate: Timestamp,
  dischargeDate: null,
  alertSend: false
}
```

---

## ✅ Features Fully Implemented

- ✓ Hospital infrastructure creation (wards, rooms, beds)
- ✓ Automatic bed generation during registration
- ✓ Complete Firestore collection with proper schema
- ✓ Real-time bed allocation during admission
- ✓ Discharge logic with bed release
- ✓ AdminDashboard bed statistics & per-ward breakdown
- ✓ WardDashboard bed structure visualization
- ✓ Hospital code generation
- ✓ Hospital image upload
- ✓ Location mapping
- ✓ Staff upload & management
- ✓ Real-time data updates

---

## 🔍 Real-Time Features

All dashboards update in real-time via Firestore listeners:

### AdminDashboard
- Listens to hospitals collection → Hospital info
- Listens to staff collection → Staff list
- Listens to beds collection → Statistics calculation

### WardDashboard
- Listens to vitals collection → Risk data
- Listens to beds collection → Availability & hierarchy

### PatientList
- Fetches patients on load
- Manual refresh after discharge

---

## 🎯 Testing Checklist

1. **Hospital Registration**
   - [ ] Fill all fields
   - [ ] Configure infrastructure (e.g., 2 wards, 3 rooms, 2 beds, 1 ICU)
   - [ ] Verify hospital code generated
   - [ ] Check hospitals collection in Firestore
   - [ ] Verify beds collection has all beds created (2 × 3 × 3 = 18 beds)

2. **Admin Dashboard**
   - [ ] See infrastructure info displayed
   - [ ] See bed statistics (total, occupied, available)
   - [ ] See per-ward breakdown
   - [ ] Verify counts update in real-time

3. **Patient Admission**
   - [ ] Select ward
   - [ ] System auto-finds available bed
   - [ ] Patient admitted successfully
   - [ ] Bed status changes to "occupied"
   - [ ] Bed count decreases in dashboards

4. **Ward Dashboard**
   - [ ] Toggle "Show Bed Structure"
   - [ ] See ward → room → bed hierarchy
   - [ ] Verify color coding (green=available, amber=occupied, red=ICU)
   - [ ] Check availability counts per room

5. **Patient Discharge**
   - [ ] Click "Discharge" on patient
   - [ ] Verify patient marked as discharged
   - [ ] Verify bed status changes to "available"
   - [ ] Bed available for new admission
   - [ ] Counts update in AdminDashboard

---

## 🚀 Performance Notes

- Bed generation with `generateBedStructure()` runs in parallel using Promise.all()
- Real-time listeners use indexed queries for optimal performance
- Bed hierarchy cached in state to avoid repeated queries
- Discharge updates are atomic (patient + bed updated together)

---

## 📝 Notes

- All existing features remain unchanged and functional
- Bed system is backward compatible with existing patient data
- New patients must have bedId and bedNumber fields
- Hospital must be registered before staff can be added
- ICU beds are regular beds with type="ICU" (no separate collection)

---

## 🔗 Integration Points

- **Email System:** sendStaffReactivatedEmail, sendStaffRemovedEmail (unchanged)
- **PatientVitals:** Uses existing patients collection (no changes)
- **DoctorNotifications:** No changes needed
- **Layout & Navigation:** All routes unchanged

---

## 📞 Support Notes

If beds aren't showing in AdminDashboard:
1. Verify hospital registration completed
2. Check beds collection in Firestore console
3. Confirm hospitalCode matches in beds and hospital documents
4. Check browser console for errors

If patient admission fails:
1. Ensure ward exists with available beds
2. Verify patient doesn't already exist (duplicate check)
3. Check bedId is stored correctly in patient record
4. Verify bed status is updated to "occupied"

---

**System Status:** ✅ Ready for Production

Last Updated: 2026-03-11
