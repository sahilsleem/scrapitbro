import type { PhotoItem } from '@/types';
import {
  formatShutterSpeed,
  formatAperture,
  formatIso,
  formatExposureComp,
  formatFocalLength
} from './exif';

export interface FormattedMetadataItem {
  id: string;
  rawKey: string;
  label: string;
  value: string;
  category: 'camera' | 'capture' | 'image' | 'location' | 'technical' | 'other';
}

export interface MetadataSection {
  id: string;
  title: string;
  description?: string;
  items: FormattedMetadataItem[];
}

const KNOWN_LABELS: Record<string, { label: string; category: FormattedMetadataItem['category'] }> = {
  // Camera & Optics
  cameraMake: { label: 'Camera Manufacturer', category: 'camera' },
  Make: { label: 'Camera Manufacturer', category: 'camera' },
  cameraModel: { label: 'Camera Model', category: 'camera' },
  Model: { label: 'Camera Model', category: 'camera' },
  lens: { label: 'Lens Model', category: 'camera' },
  LensModel: { label: 'Lens Model', category: 'camera' },
  Lens: { label: 'Lens Model', category: 'camera' },
  LensMake: { label: 'Lens Manufacturer', category: 'camera' },
  LensInfo: { label: 'Lens Specification', category: 'camera' },
  LensSerialNumber: { label: 'Lens Serial Number', category: 'camera' },
  BodySerialNumber: { label: 'Body Serial Number', category: 'camera' },
  SerialNumber: { label: 'Device Serial Number', category: 'camera' },
  Software: { label: 'Software / Firmware', category: 'camera' },
  HostComputer: { label: 'Host Computer', category: 'camera' },
  focalLength: { label: 'Focal Length', category: 'camera' },
  FocalLength: { label: 'Focal Length', category: 'camera' },
  FocalLengthIn35mmFormat: { label: '35mm Equivalent Focal Length', category: 'camera' },
  FocalLengthIn35mmFilm: { label: '35mm Equivalent Focal Length', category: 'camera' },
  DigitalZoomRatio: { label: 'Digital Zoom Ratio', category: 'camera' },

  // Capture & Exposure
  dateTimeOriginal: { label: 'Date Taken (Original)', category: 'capture' },
  DateTimeOriginal: { label: 'Date Taken (Original)', category: 'capture' },
  capturedAt: { label: 'Capture Date', category: 'capture' },
  CreateDate: { label: 'Date Digitized', category: 'capture' },
  DateTimeDigitized: { label: 'Date Digitized', category: 'capture' },
  ModifyDate: { label: 'Date Modified', category: 'capture' },
  DateTime: { label: 'Date Modified', category: 'capture' },
  OffsetTime: { label: 'Timezone Offset', category: 'capture' },
  OffsetTimeOriginal: { label: 'Original Timezone Offset', category: 'capture' },
  OffsetTimeDigitized: { label: 'Digitized Timezone Offset', category: 'capture' },
  SubSecTime: { label: 'Sub-second Capture', category: 'capture' },
  SubSecTimeOriginal: { label: 'Sub-second Original', category: 'capture' },
  SubSecTimeDigitized: { label: 'Sub-second Digitized', category: 'capture' },
  iso: { label: 'ISO Speed', category: 'capture' },
  ISO: { label: 'ISO Speed', category: 'capture' },
  ISOSpeedRatings: { label: 'ISO Speed Ratings', category: 'capture' },
  PhotographicSensitivity: { label: 'Photographic Sensitivity', category: 'capture' },
  SensitivityType: { label: 'Sensitivity Type', category: 'capture' },
  StandardOutputSensitivity: { label: 'Standard Output Sensitivity', category: 'capture' },
  RecommendedExposureIndex: { label: 'Recommended Exposure Index', category: 'capture' },
  shutterSpeed: { label: 'Shutter Speed', category: 'capture' },
  ExposureTime: { label: 'Exposure Time', category: 'capture' },
  ShutterSpeedValue: { label: 'Shutter Speed Value', category: 'capture' },
  aperture: { label: 'Aperture (f-stop)', category: 'capture' },
  FNumber: { label: 'F-Number', category: 'capture' },
  ApertureValue: { label: 'Aperture Value', category: 'capture' },
  MaxApertureValue: { label: 'Maximum Lens Aperture', category: 'capture' },
  exposureCompensation: { label: 'Exposure Bias', category: 'capture' },
  ExposureBiasValue: { label: 'Exposure Bias Value', category: 'capture' },
  ExposureCompensation: { label: 'Exposure Compensation', category: 'capture' },
  ExposureProgram: { label: 'Exposure Program', category: 'capture' },
  ExposureMode: { label: 'Exposure Mode', category: 'capture' },
  MeteringMode: { label: 'Metering Mode', category: 'capture' },
  LightSource: { label: 'Light Source', category: 'capture' },
  Flash: { label: 'Flash Status', category: 'capture' },
  FlashEnergy: { label: 'Flash Energy', category: 'capture' },
  WhiteBalance: { label: 'White Balance', category: 'capture' },
  SceneCaptureType: { label: 'Scene Capture Type', category: 'capture' },
  SceneType: { label: 'Scene Type', category: 'capture' },
  CustomRendered: { label: 'Custom Rendering', category: 'capture' },
  SubjectDistance: { label: 'Subject Distance', category: 'capture' },
  SubjectDistanceRange: { label: 'Subject Distance Range', category: 'capture' },
  SubjectArea: { label: 'Subject Area', category: 'capture' },
  SensingMethod: { label: 'Sensing Method', category: 'capture' },
  FileSource: { label: 'File Source', category: 'capture' },
  GainControl: { label: 'Gain Control', category: 'capture' },
  Contrast: { label: 'Contrast', category: 'capture' },
  Saturation: { label: 'Saturation', category: 'capture' },
  Sharpness: { label: 'Sharpness', category: 'capture' },

  // Image & Encoding
  dimensions: { label: 'Image Dimensions', category: 'image' },
  width: { label: 'Image Width', category: 'image' },
  height: { label: 'Image Height', category: 'image' },
  ImageWidth: { label: 'Image Width (Pixels)', category: 'image' },
  ImageHeight: { label: 'Image Height (Pixels)', category: 'image' },
  PixelXDimension: { label: 'Pixel X Dimension', category: 'image' },
  PixelYDimension: { label: 'Pixel Y Dimension', category: 'image' },
  fileSizeBytes: { label: 'File Size', category: 'image' },
  mimeType: { label: 'MIME Type', category: 'image' },
  filename: { label: 'Original File Name', category: 'image' },
  orientation: { label: 'Orientation Flag', category: 'image' },
  Orientation: { label: 'Orientation', category: 'image' },
  ColorSpace: { label: 'Color Space', category: 'image' },
  BitsPerSample: { label: 'Bits Per Sample', category: 'image' },
  Compression: { label: 'Compression Scheme', category: 'image' },
  PhotometricInterpretation: { label: 'Photometric Interpretation', category: 'image' },
  SamplesPerPixel: { label: 'Samples Per Pixel', category: 'image' },
  PlanarConfiguration: { label: 'Planar Configuration', category: 'image' },
  YCbCrSubSampling: { label: 'YCbCr Sub-sampling', category: 'image' },
  YCbCrPositioning: { label: 'YCbCr Positioning', category: 'image' },
  XResolution: { label: 'Horizontal Resolution', category: 'image' },
  YResolution: { label: 'Vertical Resolution', category: 'image' },
  ResolutionUnit: { label: 'Resolution Unit', category: 'image' },
  CompressedBitsPerPixel: { label: 'Compressed Bits Per Pixel', category: 'image' },
  ComponentsConfiguration: { label: 'Components Configuration', category: 'image' },

  // Location
  latitude: { label: 'GPS Latitude', category: 'location' },
  longitude: { label: 'GPS Longitude', category: 'location' },
  altitude: { label: 'GPS Altitude', category: 'location' },
  GPSLatitude: { label: 'GPS Latitude', category: 'location' },
  GPSLongitude: { label: 'GPS Longitude', category: 'location' },
  GPSAltitude: { label: 'GPS Altitude', category: 'location' },
  GPSAltitudeRef: { label: 'GPS Altitude Reference', category: 'location' },
  GPSLatitudeRef: { label: 'GPS Latitude Direction', category: 'location' },
  GPSLongitudeRef: { label: 'GPS Longitude Direction', category: 'location' },
  GPSSpeed: { label: 'GPS Speed', category: 'location' },
  GPSSpeedRef: { label: 'GPS Speed Unit', category: 'location' },
  GPSTrack: { label: 'GPS Track Direction', category: 'location' },
  GPSTrackRef: { label: 'GPS Track Reference', category: 'location' },
  GPSImgDirection: { label: 'GPS Image Direction', category: 'location' },
  GPSImgDirectionRef: { label: 'GPS Image Direction Reference', category: 'location' },
  GPSDestLatitude: { label: 'GPS Destination Latitude', category: 'location' },
  GPSDestLongitude: { label: 'GPS Destination Longitude', category: 'location' },
  GPSTimeStamp: { label: 'GPS Timestamp', category: 'location' },
  GPSDateStamp: { label: 'GPS Date Stamp', category: 'location' },
  GPSProcessingMethod: { label: 'GPS Processing Method', category: 'location' },
  GPSDOP: { label: 'GPS Degree of Precision', category: 'location' },
  GPSMapDatum: { label: 'GPS Geodetic Datum', category: 'location' },
  GPSVersionID: { label: 'GPS Tag Version', category: 'location' },

  // Technical & EXIF
  ExifVersion: { label: 'EXIF Version', category: 'technical' },
  FlashpixVersion: { label: 'Flashpix Version', category: 'technical' },
  InteroperabilityIndex: { label: 'Interoperability Index', category: 'technical' },
  InteroperabilityVersion: { label: 'Interoperability Version', category: 'technical' },
  MakerNote: { label: 'Maker Notes', category: 'technical' },
  UserComment: { label: 'User Comment', category: 'technical' },
  ImageDescription: { label: 'Image Description', category: 'technical' },
  Artist: { label: 'Artist / Creator', category: 'technical' },
  Copyright: { label: 'Copyright Notice', category: 'technical' },
};

/**
 * Automatically convert any camelCase, PascalCase, or snake_case key into clean Title Case
 */
function keyToTitleCase(key: string): string {
  // If we already know a custom label, use it
  if (KNOWN_LABELS[key]?.label) return KNOWN_LABELS[key].label;

  return key
    .replace(/([A-Z]+)/g, ' $1')
    .replace(/[_.-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .split(' ')
    .map((word) => {
      const lower = word.toLowerCase();
      if (lower === 'exif') return 'EXIF';
      if (lower === 'gps') return 'GPS';
      if (lower === 'iso') return 'ISO';
      if (lower === 'id') return 'ID';
      if (lower === 'url') return 'URL';
      if (lower === 'mime') return 'MIME';
      if (lower === 'ycbcr') return 'YCbCr';
      if (lower === 'dpi') return 'DPI';
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Cleanly format raw values into human-readable strings
 */
function formatRawValue(key: string, value: any): string | null {
  if (value === undefined || value === null) return null;

  // Ignore functions or empty strings/arrays
  if (typeof value === 'function') return null;
  if (typeof value === 'string' && value.trim() === '') return null;
  if (Array.isArray(value) && value.length === 0) return null;

  // Date formatting
  if (value instanceof Date) {
    if (isNaN(value.getTime())) return null;
    return value.toLocaleDateString(undefined, {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  // ISO string checking
  if (
    typeof value === 'string' &&
    (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) &&
    /^\d{4}-\d{2}-\d{2}/.test(value)
  ) {
    const d = new Date(value);
    if (!isNaN(d.getTime())) {
      return d.toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });
    }
  }

  // Shutter Speed / Exposure Time
  if (key === 'ExposureTime' || key === 'shutterSpeed' || key === 'ShutterSpeedValue') {
    return formatShutterSpeed(value);
  }

  // Aperture / FNumber
  if (key === 'FNumber' || key === 'aperture' || key === 'ApertureValue') {
    return formatAperture(value);
  }

  // ISO
  if (key === 'ISO' || key === 'iso' || key === 'ISOSpeedRatings') {
    return formatIso(value).replace(/^ISO\s*/, '');
  }

  // Exposure Bias / Compensation
  if (key === 'ExposureBiasValue' || key === 'exposureCompensation' || key === 'ExposureCompensation') {
    return formatExposureComp(value);
  }

  // Focal Length
  if (key === 'FocalLength' || key === 'focalLength') {
    return formatFocalLength(value);
  }
  if (key === 'FocalLengthIn35mmFormat' || key === 'FocalLengthIn35mmFilm') {
    const num = parseFloat(String(value));
    return isNaN(num) ? String(value) : `${Math.round(num)} mm`;
  }

  // Bytes / File Size
  if (key === 'fileSizeBytes') {
    const num = Number(value);
    return `${(num / (1024 * 1024)).toFixed(2)} MB (${num.toLocaleString()} bytes)`;
  }

  // Flash descriptions
  if (key === 'Flash' && typeof value === 'object' && value.description) {
    return String(value.description);
  }

  // Arrays (e.g., GPS coords, ComponentsConfiguration, Version arrays)
  if (Array.isArray(value)) {
    if (value.length > 32) {
      return `Binary Data (${value.length} items)`;
    }
    // Check if character codes
    if (value.every((v) => typeof v === 'number' && v >= 32 && v <= 126)) {
      const ascii = String.fromCharCode(...value).trim();
      if (ascii.length > 0) return `${ascii} (${value.join(', ')})`;
    }
    return value.map((v) => (typeof v === 'object' ? JSON.stringify(v) : String(v))).join(', ');
  }

  // Uint8Array / ArrayBuffers / Blobs
  if (value instanceof Uint8Array || (typeof Buffer !== 'undefined' && value instanceof Buffer)) {
    return `Binary Data (${value.length} bytes)`;
  }

  // Objects
  if (typeof value === 'object') {
    if (value.description) return String(value.description);
    if (value.value !== undefined) return String(value.value);
    // Otherwise fallback to key-value summary
    const entries = Object.entries(value).filter(([_, v]) => v !== undefined && v !== null);
    if (entries.length === 0) return null;
    return entries.map(([k, v]) => `${keyToTitleCase(k)}: ${v}`).join(' • ');
  }

  // Booleans
  if (typeof value === 'boolean') {
    return value ? 'Yes / Enabled' : 'No / Disabled';
  }

  // Numbers
  if (typeof value === 'number') {
    if (Number.isInteger(value)) return value.toLocaleString();
    return Number(value.toFixed(4)).toString();
  }

  return String(value).trim();
}

/**
 * Determine the best category for any key
 */
function categorizeKey(key: string): FormattedMetadataItem['category'] {
  if (KNOWN_LABELS[key]?.category) return KNOWN_LABELS[key].category;

  const lower = key.toLowerCase();
  if (lower.includes('gps') || lower.includes('latitude') || lower.includes('longitude') || lower.includes('altitude') || lower.includes('location')) {
    return 'location';
  }
  if (lower.includes('camera') || lower.includes('lens') || lower.includes('make') || lower.includes('model') || lower.includes('body') || lower.includes('serial')) {
    return 'camera';
  }
  if (lower.includes('iso') || lower.includes('shutter') || lower.includes('aperture') || lower.includes('exposure') || lower.includes('metering') || lower.includes('flash') || lower.includes('whitebalance') || lower.includes('date') || lower.includes('time') || lower.includes('focal')) {
    return 'capture';
  }
  if (lower.includes('width') || lower.includes('height') || lower.includes('dimension') || lower.includes('pixel') || lower.includes('resolution') || lower.includes('color') || lower.includes('compression') || lower.includes('size') || lower.includes('format') || lower.includes('mime') || lower.includes('orientation')) {
    return 'image';
  }
  if (lower.includes('exif') || lower.includes('version') || lower.includes('note') || lower.includes('tag') || lower.includes('offset') || lower.includes('interop')) {
    return 'technical';
  }
  return 'other';
}

/**
 * Extract 100% of available metadata from a photo item into organized sections
 */
export function extractCompletePhotoMetadata(photo: PhotoItem): {
  sections: MetadataSection[];
  totalFieldsCount: number;
} {
  const seenKeys = new Set<string>();
  const allItems: FormattedMetadataItem[] = [];

  // Helper to ingest a key-value
  const ingest = (key: string, value: any, explicitCategory?: FormattedMetadataItem['category']) => {
    if (value === undefined || value === null) return;
    if (seenKeys.has(key.toLowerCase())) return;

    // Filter out internal non-metadata or duplicate object wrappers
    if (key === 'raw' || key === 'originalBlob' || key === 'thumbnailBlob' || key === 'fullUrl' || key === 'thumbnailUrl' || key === 'tags' || key === 'isFavorite' || key === 'isArchived') {
      return;
    }

    const formatted = formatRawValue(key, value);
    if (!formatted || formatted.trim() === '') return;

    seenKeys.add(key.toLowerCase());
    const label = KNOWN_LABELS[key]?.label || keyToTitleCase(key);
    const category = explicitCategory || KNOWN_LABELS[key]?.category || categorizeKey(key);

    allItems.push({
      id: `${category}-${key}`,
      rawKey: key,
      label: label.toUpperCase(),
      value: formatted,
      category,
    });
  };

  // 1. Ingest from Raw EXIF first (has most specific and rich properties)
  const rawExif = (photo.exif?.raw as Record<string, any>) || {};
  for (const [rawKey, rawVal] of Object.entries(rawExif)) {
    ingest(rawKey, rawVal);
  }

  // 2. Ingest structured EXIF properties
  if (photo.exif) {
    if (photo.exif.cameraMake) ingest('cameraMake', photo.exif.cameraMake, 'camera');
    if (photo.exif.cameraModel) ingest('cameraModel', photo.exif.cameraModel, 'camera');
    if (photo.exif.lens) ingest('lens', photo.exif.lens, 'camera');
    if (photo.exif.focalLength) ingest('focalLength', photo.exif.focalLength, 'camera');
    if (photo.exif.iso) ingest('iso', photo.exif.iso, 'capture');
    if (photo.exif.shutterSpeed) ingest('shutterSpeed', photo.exif.shutterSpeed, 'capture');
    if (photo.exif.aperture) ingest('aperture', photo.exif.aperture, 'capture');
    if (photo.exif.exposureCompensation !== undefined) ingest('exposureCompensation', photo.exif.exposureCompensation, 'capture');
    if (photo.exif.dateTimeOriginal) ingest('dateTimeOriginal', photo.exif.dateTimeOriginal, 'capture');
    if (photo.exif.orientation) ingest('orientation', photo.exif.orientation, 'image');

    if (photo.exif.location) {
      if (photo.exif.location.latitude !== undefined) ingest('latitude', photo.exif.location.latitude, 'location');
      if (photo.exif.location.longitude !== undefined) ingest('longitude', photo.exif.location.longitude, 'location');
      if (photo.exif.location.altitude !== undefined) ingest('altitude', `${photo.exif.location.altitude} m`, 'location');
    }
  }

  // 3. Ingest top-level Photo properties
  if (photo.filename) ingest('filename', photo.filename, 'image');
  if (photo.fileSizeBytes) ingest('fileSizeBytes', photo.fileSizeBytes, 'image');
  if (photo.mimeType) ingest('mimeType', photo.mimeType.replace(/^image\//, '').toUpperCase(), 'image');
  if (photo.dimensions?.width && photo.dimensions?.height) {
    ingest('dimensions', `${photo.dimensions.width} × ${photo.dimensions.height}`, 'image');
  }
  if (photo.capturedAt) ingest('capturedAt', photo.capturedAt, 'capture');
  if (photo.filmStock) ingest('filmStock', photo.filmStock, 'camera');

  // Group items into organized sections
  const sectionMap: Record<FormattedMetadataItem['category'], { title: string; description?: string }> = {
    camera: { title: 'CAMERA & DEVICE', description: 'Equipment, optics, and manufacturer information' },
    capture: { title: 'CAPTURE & EXPOSURE', description: 'Settings, timestamps, and shooting parameters' },
    image: { title: 'IMAGE & ENCODING', description: 'Dimensions, resolution, color space, and file metrics' },
    location: { title: 'LOCATION & GPS', description: 'Geographic coordinates and satellite positioning' },
    technical: { title: 'TECHNICAL DETAILS', description: 'EXIF versions, standards, and encoding parameters' },
    other: { title: 'OTHER METADATA', description: 'Additional embedded metadata found in this photo' },
  };

  const sections: MetadataSection[] = (['camera', 'capture', 'image', 'location', 'technical', 'other'] as const)
    .map((catKey) => {
      const items = allItems.filter((it) => it.category === catKey);
      return {
        id: catKey,
        title: sectionMap[catKey].title,
        description: sectionMap[catKey].description,
        items,
      };
    })
    .filter((sec) => sec.items.length > 0);

  return {
    sections,
    totalFieldsCount: allItems.length,
  };
}
