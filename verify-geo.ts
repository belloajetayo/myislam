// Mocking geomagnetism for node environment if needed,
// but since we are running in the project context we should be fine.
import { calculateQiblaBearing, getMagneticDeclination } from "./src/utils/geo";

const testCases = [
  { name: "London", lat: 51.5074, lng: -0.1278, expected: 118.98 },
  { name: "New York", lat: 40.7128, lng: -74.006, expected: 58.48 },
  { name: "Jakarta", lat: -6.2088, lng: 106.8456, expected: 295.14 },
  { name: "Mecca (Near)", lat: 21.42, lng: 39.82, expected: 111.45 },
];

console.log("--- Qibla Bearing Verification ---");
testCases.forEach((tc) => {
  const result = calculateQiblaBearing(tc.lat, tc.lng);
  const decl = getMagneticDeclination(tc.lat, tc.lng);
  console.log(
    `${tc.name}: Bearing ${result.toFixed(2)}°, Declination ${decl.toFixed(2)}°`,
  );
});
