import { format, parseISO } from "date-fns";
import { DatePrecision } from "@/types/graphql-schema";

/** Formats a date from the backend, default is `PPp`, ie `MMM d, yyyy, h:mm a`  */
export function formatDate(dateString: string, formatString?: string) {
  const parsedDate = parseISO(dateString);
  try {
    return format(parsedDate, formatString || "PPp");
  } catch (error) {
    return "";
  }
}

export function getPrecisionDateDisplay(
  precision: DatePrecision,
  value: string
) {
  switch (precision) {
    case "YEAR":
      return formatDate(value, "yyyy");

    case "MONTH":
      return formatDate(value, "MMMM yyyy");

    default:
      return formatDate(value, "MMMM d, yyyy");
  }
}

/**
 * For citation guidelines, see https://scholar.google.com/intl/en/scholar/inclusion.html#indexing
 */
export function getPrecisionCitationDateDisplay(
  precision?: DatePrecision,
  value?: string | null
) {
  if (!value) return null;

  switch (precision) {
    case "YEAR":
      return formatDate(value, "yyyy");

    case "MONTH":
      return formatDate(value, "yyyy/LL/01");

    default:
      return formatDate(value, "yyyy/LL/dd");
  }
}
