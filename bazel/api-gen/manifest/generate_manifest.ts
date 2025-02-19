// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import type {DocEntry, JsDocTagEntry} from '@angular/compiler-cli';

/** The JSON data file format for extracted API reference info. */
export interface EntryCollection {
  moduleName: string;
  entries: DocEntry[];
}

export interface ManifestEntry {
  name: string;
  type: string;
  isDeprecated: boolean;
}

/** Manifest that maps each module name to a list of API symbols. */
export type Manifest = Record<string, ManifestEntry[]>;

/** Gets a unique lookup key for an API, e.g. "@angular/core/ElementRef". */
function getApiLookupKey(moduleName: string, name: string) {
  return `${moduleName}/${name}`;
}

/** Gets whether the given entry has the "@deprecated" JsDoc tag. */
function hasDeprecatedTag(entry: DocEntry) {
  return entry.jsdocTags.some((t: JsDocTagEntry) => t.name === 'deprecated');
}

/** Gets whether the given entry is deprecated in the manifest. */
function isDeprecated(
  lookup: Map<string, DocEntry[]>,
  moduleName: string,
  entry: DocEntry,
): boolean {
  const entriesWithSameName = lookup.get(getApiLookupKey(moduleName, entry.name));

  // If there are multiple entries with the same name in the same module, only mark them as
  // deprecated if *all* of the entries with the same name are deprecated (e.g. function overloads).
  if (entriesWithSameName && entriesWithSameName.length > 1) {
    return entriesWithSameName.every((entry) => hasDeprecatedTag(entry));
  }

  return hasDeprecatedTag(entry);
}

/** Generates an API manifest for a set of API collections extracted by extract_api_to_json.  */
export function generateManifest(apiCollections: EntryCollection[]): Manifest {
  // Filter out repeated entries for function overloads, but also keep track of
  // all symbols keyed to their lookup key. We need this lookup later for determining whether
  // to mark an entry as deprecated.
  const entryLookup = new Map<string, DocEntry[]>();
  for (const collection of apiCollections) {
    collection.entries = collection.entries.filter((entry) => {
      const lookupKey = getApiLookupKey(collection.moduleName, entry.name);
      if (entryLookup.has(lookupKey)) {
        entryLookup.get(lookupKey)!.push(entry);
        return false;
      }

      entryLookup.set(lookupKey, [entry]);
      return true;
    });
  }

  return apiCollections.reduce((result, collection) => {
    return {
      ...result,
      [collection.moduleName]: collection.entries.map((entry) => ({
        name: entry.name,
        type: entry.entryType,
        isDeprecated: isDeprecated(entryLookup, collection.moduleName, entry),
      })),
    };
  }, {});
}
