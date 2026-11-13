import {IFile} from "./_ifile";

const rowCache = new WeakMap<IFile, readonly string[]>();

/** getRawRows() splits the source on every call; a file is never changed, edits create a new one,
 *  so the rows can be cached per file object. The result must not be modified */
export function getCachedRawRows(file: IFile): readonly string[] {
  let rows = rowCache.get(file);
  if (rows === undefined) {
    rows = file.getRawRows();
    rowCache.set(file, rows);
  }
  return rows;
}
