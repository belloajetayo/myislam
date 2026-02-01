
# Plan: Enhanced Location Services, Qiblah Precision, and Ramadan Features

## Overview
This plan addresses four key improvements:
1. Server-assisted location handling with client-side GPS precision
2. Enhanced Qiblah compass accuracy
3. Dynamic Ramadan countdown using the Islamic calendar
4. Location-based Ramadan tracker with Suhoor/Iftar times

---

## 1. Server-Assisted Location Architecture

### Why Server-Side Only Won't Work
The HTML5 Geolocation API (GPS) **requires browser execution** - it cannot run server-side. However, we can create a hybrid approach.

### Solution: Edge Function for Location Services
Create a new edge function `get-user-location` that:
- Uses IP-based geolocation (ipapi.co or similar) as a **fallback**
- Caches user's precise GPS coordinates in their profile (when authenticated)
- Returns cached location data for faster subsequent loads

**Files to create:**
- `supabase/functions/get-user-location/index.ts`

**Database change:**
- Leverage existing `profiles.latitude` and `profiles.longitude` columns to cache GPS data

---

## 2. Enhanced Qiblah Compass Accuracy

### Current Issues Identified
- Compass uses only `getCurrentPosition` once instead of watching for updates
- No accuracy indicator to inform users of GPS precision
- Device heading calibration could be improved

### Improvements
- Use `watchPosition` for continuous high-accuracy GPS stream
- Display GPS accuracy in meters on the compass
- Add compass calibration guidance for users
- Implement smooth compass needle animation with damping
- Store precision level (2 decimal places) consistently

**Files to modify:**
- `src/pages/Qiblah.tsx`

---

## 3. Accurate Ramadan Countdown

### Current State
- Hajj countdown exists but uses hardcoded Gregorian dates
- No Ramadan countdown component

### Solution
Create a `RamadanCountdown` component that:
- Fetches real-time Hijri date from the Aladhan API
- Calculates exact days until 1st Ramadan (month 9)
- Displays countdown with days, hours, minutes, seconds
- Shows "Ramadan Mubarak" message during Ramadan

**Files to create:**
- `src/components/home/RamadanCountdown.tsx`

**Files to modify:**
- `src/pages/Index.tsx` (add countdown to homepage)
- `src/pages/Fasting.tsx` (add countdown to fasting page)

---

## 4. Location-Based Ramadan Tracker

### Current State
- Fasting page embeds external iframe (myramadan.lovable.app)
- No native tracking with user's actual location

### Solution
Build a native `RamadanTracker` component that:
- Uses the existing `usePrayerTimes` hook for Suhoor (Fajr) and Iftar (Maghrib) times
- Shows time remaining until Suhoor ends / Iftar begins
- Tracks fasting days completed
- Displays user's city and country
- Provides countdown timers based on actual prayer times for their location

**Files to create:**
- `src/components/fasting/RamadanTracker.tsx`

**Files to modify:**
- `src/pages/Fasting.tsx` (replace or supplement iframe with native tracker)

---

## Technical Details

### Edge Function: get-user-location
```text
Purpose: IP-based geolocation fallback + profile location caching
Endpoint: /functions/v1/get-user-location
Returns: { city, country, latitude, longitude, source: 'ip' | 'cached' }
```

### Ramadan Countdown Logic
```text
1. Fetch current Hijri date from Aladhan API
2. If current month < 9: Calculate days until 1st of month 9
3. If current month = 9: Display "Ramadan Mubarak" + day of Ramadan
4. If current month > 9: Calculate days until next year's Ramadan
```

### Qiblah Precision Enhancements
```text
- watchPosition with: enableHighAccuracy: true, maximumAge: 0
- Display accuracy: "GPS: ±5m" indicator
- Damped compass rotation for smooth needle movement
- Clear visual when facing Qiblah (within ±2 degrees)
```

---

## Implementation Order

1. **Create edge function** for server-assisted location
2. **Update Qiblah page** with continuous GPS and accuracy display
3. **Create RamadanCountdown component** with Hijri calendar integration
4. **Create native RamadanTracker** with location-based times
5. **Update Fasting page** to use native tracker
6. **Add Ramadan countdown to homepage**

---

## Summary of Files

| Action | File |
|--------|------|
| Create | `supabase/functions/get-user-location/index.ts` |
| Create | `src/components/home/RamadanCountdown.tsx` |
| Create | `src/components/fasting/RamadanTracker.tsx` |
| Modify | `src/pages/Qiblah.tsx` |
| Modify | `src/pages/Fasting.tsx` |
| Modify | `src/pages/Index.tsx` |
| Modify | `supabase/config.toml` |
