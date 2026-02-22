import geomagnetism from "geomagnetism";

/**
 * Precise Kaaba coordinates (Al-Masid al-Haram)
 * Latitude: 21.42252° N
 * Longitude: 39.82621° E
 */
export const KAABA_COORDS = { lat: 21.42252, lng: 39.82621 };

/**
 * Calculates the Qiblah bearing (True North) from a user's location.
 * @param lat User latitude in degrees
 * @param lng User longitude in degrees
 */
export const calculateQiblaBearing = (lat: number, lng: number): number => {
  const toRad = (d: number) => (d * Math.PI) / 180;

  const phi1 = toRad(lat);
  const phi2 = toRad(KAABA_COORDS.lat);
  const deltaLambda = toRad(KAABA_COORDS.lng - lng);

  const x = Math.sin(deltaLambda) * Math.cos(phi2);
  const y =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const bearing = (Math.atan2(x, y) * 180) / Math.PI;
  return (bearing + 360) % 360;
};

/**
 * Gets the magnetic declination for a specific location.
 * Uses World Magnetic Model (WMM) via geomagnetism library.
 * @param lat User latitude
 * @param lng User longitude
 */
export const getMagneticDeclination = (lat: number, lng: number): number => {
  try {
    const info = geomagnetism.model().point([lat, lng]);
    return info.decl;
  } catch (error) {
    console.error("Error calculating magnetic declination:", error);
    return 0;
  }
};
