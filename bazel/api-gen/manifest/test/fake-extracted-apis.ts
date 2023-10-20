// @ts-ignore This compiles fine, but Webstorm doesn't like the ESM import in a CJS context.
import {DocEntry, EntryType} from '@angular/compiler-cli';
import {EntryCollection} from '../index';

//
// export const collectionWithOneConstant: EntryCollection = {
//   moduleName: '@angular/core',
//   entries: [
//     entry({name: 'PI', entryType: EntryType.Constant}),
//   ],
// };
//
// export const collectionWithOverloadedFunctions: EntryCollection = {
//   moduleName: '@angular/core',
//   entries: [
//     entry({name: 'save', entryType: EntryType.Function}),
//     entry({name: 'save', entryType: EntryType.Function}),
//   ],
// };
//
// export const collectionWithOneDeprecatedFunctionOverload: EntryCollection = {
//   moduleName: '@angular/core',
//   entries: [
//     entry({name: 'save', entryType: EntryType.Function}),
//     entry({name: 'save', entryType: EntryType.Function, jsdocTags: [{name: 'deprecated'}]}),
//   ],
// };
// export const collectionWithAllDeprecatedFunctionOverloads: EntryCollection = {
//   moduleName: '@angular/core',
//   entries: [
//     entry({name: 'save', entryType: EntryType.Function, jsdocTags: [{name: 'deprecated'}]}),
//     entry({name: 'save', entryType: EntryType.Function, jsdocTags: [{name: 'deprecated'}]}),
//   ],
// };
