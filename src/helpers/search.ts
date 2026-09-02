import { SearchPredicateInput } from "@/types/graphql-schema";

export function getPredicates(
  filters: Record<string, string>,
): [SearchPredicateInput] | undefined {
  const predicates: [SearchPredicateInput?] = [];

  Object.keys(filters).forEach((key) => {
    const pairs = key.split("--");

    if (!pairs || pairs.length !== 2) return;

    const operator = pairs[1];
    const path = pairs[0].replace("-", ".");
    const value = filters[key];

    predicates.push({
      [operator]: { path, value },
    });
  });

  return predicates ? (predicates as [SearchPredicateInput]) : undefined;
}

// Reads the filter state from a search-page query string. Filter fields are
// flat params named `<searchPath>--<operator>` (hyphens for dots); the legacy
// shapes — a `filters` JSON-blob param and comma-joined `schema` — are still
// accepted so old bookmarked URLs keep working.
export function getFilterValues(search: string): {
  filters: Record<string, string>;
  schema: string[];
} {
  const sp = new URLSearchParams(search);
  const filters: Record<string, string> = {};

  const legacy = sp.get("filters");
  if (legacy) {
    try {
      Object.assign(filters, JSON.parse(legacy));
    } catch {
      // ignore malformed legacy blobs
    }
  }

  for (const [key, value] of sp) {
    if (key.includes("--") && value) filters[key] = value;
  }

  removeEmptyKeys(filters);

  const schema = sp
    .getAll("schema")
    .flatMap((v) => v.split(","))
    .filter(Boolean);

  return { filters, schema };
}

function removeEmptyKeys(data: Record<string, string>) {
  Object.keys(data).forEach((key) => {
    if (!data[key]) {
      delete data[key];
    }
  });
}

const FILTER_SEARCH_PATHS = [
  "$core.published",
  "$core.doi",
  "props.peer_reviewed#boolean",
  "props.cc_license#select",
  "props.publisher#string",
];

type Property = Readonly<{ readonly searchPath?: string | undefined }>;

// Filter searchableProperties by their searchPath, using the above array.
// Example: filterSearchableProperties<FilterNode>(searchData.coreProperties)
export function filterSearchableProperties<T extends Property>(
  properties: Readonly<T[]>,
) {
  if (!properties) return [];

  return properties.filter(
    (prop: T) =>
      prop.searchPath && FILTER_SEARCH_PATHS.includes(prop.searchPath),
  );
}

export function getFilterInputType(operator: string) {
  switch (operator) {
    case "date":
    case "dateGTE":
    case "dateLTE":
      return "date";

    case "numeric":
    case "numericLTE":
    case "numericGTE":
      return "number";

    default:
      return "text";
  }
}

export function getFilterInputLabel(label: string, operator: string) {
  switch (operator) {
    case "dateGTE":
      return `${label} After`;

    case "dateLTE":
      return `${label} Before`;

    default:
      return label;
  }
}
