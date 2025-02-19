import {writeFileSync} from 'fs';
import path from 'path';
// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {NgtscProgram, CompilerOptions, createCompilerHost} from '@angular/compiler-cli';

function main() {
  const [
    moduleName,
    entryPointExecRootRelativePath,
    srcs,
    outputFilenameExecRootRelativePath,
    serializedPathMapWithExecRootRelativePaths,
  ] = process.argv.slice(2);

  // The path map is a serialized JSON map of import path to index.ts file.
  // For example, {'@angular/core': 'path/to/some/index.ts'}
  const pathMap = JSON.parse(serializedPathMapWithExecRootRelativePaths) as Record<string, string>;

  // The tsconfig expects the path map in the form of path -> array of actual locations.
  // We also resolve the exec root relative paths to absolute paths to disambiguate.
  const resolvedPathMap: {[key: string]: string[]} = {};
  for (const [importPath, filePath] of Object.entries(pathMap)) {
    const importPathWithWildcard = path.join(importPath, '*');
    resolvedPathMap[importPathWithWildcard] = [path.resolve(path.dirname(filePath))];
  }

  const compilerOptions: CompilerOptions = {paths: resolvedPathMap};
  const compilerHost = createCompilerHost({options: compilerOptions});
  const program: NgtscProgram = new NgtscProgram(srcs.split(','), compilerOptions, compilerHost);

  const output = JSON.stringify({
    moduleName: moduleName,
    entries: program.getApiDocumentation(entryPointExecRootRelativePath),
  });

  writeFileSync(outputFilenameExecRootRelativePath, output, {encoding: 'utf8'});
}

main();
