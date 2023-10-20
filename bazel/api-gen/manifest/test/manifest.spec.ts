// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {DocEntry, EntryType, JsDocTagEntry} from '@angular/compiler-cli';
import {generateManifest} from '../index';

describe('api manifest generation', () => {
  it('should generate a manifest', () => {
    const manifest = generateManifest([
      {
        moduleName: '@angular/core',
        entries: [
          entry({name: 'PI', entryType: EntryType.Constant}),
        ],
      }
    ]);

    expect(manifest).toEqual({
      '@angular/core': [{name: 'PI', type: EntryType.Constant, isDeprecated: false}],
    });
  });
});


/** Creates a fake DocsEntry with the given object's fields patches onto the result. */
function entry(patch: Partial<DocEntry>): DocEntry {
  return {
    name: '',
    description: '',
    entryType: EntryType.Constant,
    jsdocTags: [],
    rawComment: '',
    ...patch,
  };
}

/** Creates a fake jsdoc tag entry list that contains a tag with the given name */
function jsdocTags(name: string): JsDocTagEntry[] {
  return [{name, comment: ''}];
}
