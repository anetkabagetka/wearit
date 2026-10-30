import { toJsDate } from "@/utils/format/formatDate";

// true when the item's last wear was logged today. "Log a wear" works once a day per item.
// toDateString() is e.g. "Thu Oct 29 2026", so two dates on the same day give the same text
export function wornToday(item) {
    if (!item.lastWornAt) {
        return false;
    }
    return toJsDate(item.lastWornAt).toDateString() === new Date().toDateString();
}