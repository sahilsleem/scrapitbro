import type { ExifMetadata } from '@/types';

/**
 * Format shutter speed into photographic fractional notation (e.g. 1/250s, 1/1000s, 0.5s, 2s)
 */
export function formatShutterSpeed(speed: number | string | undefined): string {
  if (speed === undefined || speed === null || speed === '') return '--';
  if (typeof speed === 'string') {
    if (speed.endsWith('s')) return speed;
    return `${speed}s`;
  }
  if (typeof speed === 'number') {
    if (speed <= 0) return '--';
    if (speed >= 1) {
      return Number.isInteger(speed) ? `${speed}s` : `${speed.toFixed(1)}s`;
    }
    const denominator = Math.round(1 / speed);
    return `1/${denominator}s`;
  }
  return '--';
}

/**
 * Format aperture value with standard ƒ/ stop notation (e.g. ƒ/2.8, ƒ/1.4)
 */
export function formatAperture(fNumber: number | string | undefined): string {
  if (fNumber === undefined || fNumber === null || fNumber === '') return '--';
  if (typeof fNumber === 'string') {
    if (fNumber.startsWith('ƒ/') || fNumber.startsWith('f/')) {
      return fNumber.replace(/^f\//, 'ƒ/');
    }
    return `ƒ/${fNumber}`;
  }
  if (typeof fNumber === 'number') {
    return `ƒ/${fNumber.toFixed(1).replace(/\.0$/, '')}`;
  }
  return '--';
}

/**
 * Format ISO sensitivity value without duplication
 */
export function formatIso(iso: number | string | undefined): string {
  if (iso === undefined || iso === null || iso === '') return '--';
  if (Array.isArray(iso)) iso = iso[0];
  const clean = String(iso).replace(/^ISO\s*/i, '').trim();
  return clean ? `ISO ${clean}` : '--';
}

/**
 * Format focal length with optional 35mm equivalent notation
 */
export function formatFocalLength(
  focalLength?: number | string,
  focalLength35mm?: number | string
): string {
  if (focalLength === undefined && focalLength35mm === undefined) return '--';

  let flNum = typeof focalLength === 'number' ? focalLength : (typeof focalLength === 'string' ? parseFloat(focalLength) : undefined);
  let fl35Num = typeof focalLength35mm === 'number' ? focalLength35mm : (typeof focalLength35mm === 'string' ? parseFloat(focalLength35mm) : undefined);

  if (!isNaN(fl35Num as number) && !isNaN(flNum as number) && fl35Num && flNum && Math.round(flNum) !== Math.round(fl35Num)) {
    const formattedFl = Number.isInteger(flNum) ? `${flNum}mm` : `${flNum.toFixed(1)}mm`;
    return `${formattedFl} (${Math.round(fl35Num)}mm eq.)`;
  }

  if (!isNaN(fl35Num as number) && fl35Num) return `${Math.round(fl35Num)}mm`;
  if (!isNaN(flNum as number) && flNum) {
    return Number.isInteger(flNum) ? `${flNum}mm` : `${flNum.toFixed(1)}mm`;
  }

  if (typeof focalLength === 'string' && focalLength.trim()) {
    return focalLength.endsWith('mm') ? focalLength : `${focalLength}mm`;
  }

  return '--';
}

/**
 * Format exposure compensation / bias EV (e.g. +0.3 EV, -1.0 EV, 0 EV)
 */
export function formatExposureComp(ev: number | string | undefined): string {
  if (ev === undefined || ev === null || ev === '') return '0 EV';
  if (typeof ev === 'string') {
    return ev.includes('EV') ? ev : `${ev} EV`;
  }
  if (typeof ev === 'number') {
    if (ev === 0) return '0 EV';
    const sign = ev > 0 ? '+' : '';
    return `${sign}${ev.toFixed(1)} EV`;
  }
  return '0 EV';
}

/**
 * Convert decimal latitude/longitude into GPS Degrees, Minutes, Seconds (DMS) string
 */
export function formatGpsCoordinates(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined || isNaN(lat) || isNaN(lng)) return '';

  const formatCoord = (deg: number, isLat: boolean): string => {
    const absolute = Math.abs(deg);
    const degrees = Math.floor(absolute);
    const minutesNotTruncated = (absolute - degrees) * 60;
    const minutes = Math.floor(minutesNotTruncated);
    const seconds = Math.floor((minutesNotTruncated - minutes) * 60);

    let direction = '';
    if (isLat) {
      direction = deg >= 0 ? 'N' : 'S';
    } else {
      direction = deg >= 0 ? 'E' : 'W';
    }

    return `${degrees}°${minutes}'${seconds}" ${direction}`;
  };

  return `${formatCoord(lat, true)}, ${formatCoord(lng, false)}`;
}

/**
 * Generate Google Maps exploration URL for GPS coordinates
 */
export function getGpsMapUrl(lat?: number, lng?: number): string {
  if (lat === undefined || lng === undefined) return '#';
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function formatExifSummary(exif?: ExifMetadata): string {
  if (!exif) return 'No EXIF metadata';
  const parts = [];
  if (exif.focalLength) parts.push(exif.focalLength);
  if (exif.aperture) parts.push(formatAperture(exif.aperture));
  if (exif.shutterSpeed) parts.push(formatShutterSpeed(exif.shutterSpeed));
  if (exif.iso) parts.push(formatIso(exif.iso));
  return parts.join(' • ') || 'No EXIF metadata';
}
