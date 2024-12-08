import { isToday, isYesterday, format, formatDistanceToNow } from 'date-fns'

export function formatMyDate(date: Date): string {
    if(isToday(date)) {
        // For a date that happened today, show how long ago
        return `Today, ${formatDistanceToNow(date, { addSuffix: true })}`
    } else if(isYesterday(date)) {
        // For yesterday, show the time
        return `Yesterday, ${format(date, 'HH:mm')}`
    } else {
        // Otherwise, show a standard date and time format
        return format(date, 'd.M.yyyy, HH:mm')
    }
}

// Usage:
const date1 = new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
console.log(formatMyDate(date1)) // "today, 5 minutes ago"

const date2 = new Date(Date.now() - 24 * 60 * 60 * 1000 + 1000 * 60 * 60 * 14 + 23 * 60000)
// roughly "yesterday at 14:23"
console.log(formatMyDate(date2)) // "yesterday, 14:23"

const date3 = new Date('2013-01-01T09:45:00')
console.log(formatMyDate(date3)) // "1.1.2013, 09:45"
