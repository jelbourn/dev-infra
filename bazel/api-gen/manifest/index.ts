import {readFileSync, writeFileSync} from 'fs';

/** The JSON data file format for extracted API reference info. */
interface EntryCollection {
  moduleName: string;
  // TODO(jelbourn): use the real type for DocEntry from @angular/compiler-cli.
  entries: {name: string; entryType: string; jsdocTags: Array<{name: string}>}[];
}

export interface ManifestEntry {
  name: string;
  type: string;
}

/** Manifest that maps each module name to a list of API symbols. */
type Manifest = Record<string, ManifestEntry[]>;

function main() {
  const [srcs, outputFilenameExecRootRelativePath] = process.argv.slice(2);

  const sourceContents = srcs
    .split(',')
    .map((srcPath) => readFileSync(srcPath, {encoding: 'utf8'}));
  const apiCollections = sourceContents.map((s) => JSON.parse(s) as EntryCollection);

  // Filter out repeated entries for function overloads.
  for (const collection of apiCollections) {
    const seen = new Set<string>();
    collection.entries = collection.entries.filter((entry) => {
      if (seen.has(entry.name)) return false;
      seen.add(entry.name);
      return true;
    });
  }

  const manifest: Manifest = apiCollections.reduce((result, collection) => {
    return {
      ...result,
      [collection.moduleName]: collection.entries.map((entry) => ({
        name: entry.name,
        type: entry.entryType,
        isDeprecated: entry.jsdocTags.some((t) => t.name === 'deprecated'),
      })),
    };
  }, {});

  writeFileSync(outputFilenameExecRootRelativePath, JSON.stringify(manifest), {encoding: 'utf8'});
}

main();
