import * as memfs from "memfs";
import {Issue, IRegistry, applyEditList} from "@abaplint/core";
import {IEdit} from "@abaplint/core/build/src/edit_helper";

export function applyFixes(issues: readonly Issue[], reg: IRegistry, fs: memfs.IFs): void {

  const edits: IEdit[] = [];

  for (const i of issues) {
    const edit = i.getFix();
    if (edit !== undefined) {
      edits.push(edit);
    }
  }

  const changed = applyEditList(reg, edits);

  for (const filename of changed) {
    const file = reg.getFileByName(filename);
    if (file === undefined) {
      continue;
    }
    fs.writeFileSync(file.getFilename(), file.getRaw());
  }

}