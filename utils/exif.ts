// EXIF tag names and shapes are inconsistent across iOS/Android and aren't typed by expo-image-picker
// (the `exif` field is just Record<string, any>), so this reads defensively across the shapes we know
// of: flat tags (both platforms) and iOS's nested "{TIFF}"/"{Exif}" dictionaries.
type ExifData = Record<string, any>

// EXIF date tags use "YYYY:MM:DD HH:MM:SS" with no timezone offset; parsed as local time.
export function parseExifCapturedAt(exif: ExifData | null | undefined): string {
    if (!exif) {
        return ''
    }
    const rawDate: unknown = exif.DateTimeOriginal ?? exif.DateTime ?? exif['{TIFF}']?.DateTime ?? exif['{Exif}']?.DateTimeOriginal
    if (typeof rawDate !== 'string') {
        return ''
    }

    const match = rawDate.match(/^(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/)
    if (!match) {
        return ''
    }
    const [, year, month, day, hour, minute, second] = match
    const parsed = new Date(Number(year), Number(month) - 1, Number(day), Number(hour), Number(minute), Number(second))
    if (isNaN(parsed.getTime())) {
        return ''
    }
    return parsed.toISOString()
}
