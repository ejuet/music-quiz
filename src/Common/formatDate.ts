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