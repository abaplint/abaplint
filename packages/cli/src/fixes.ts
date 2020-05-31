import * as memfs from "memfs";
import {Issue, IRegistry, applyEdit} from "@abaplint/core";

export function applyFixes(issues: readonly Issue[], reg: IRegistry, fs: memfs.IFs): void {
  for (const i of issues) {
    const edit = i.getFix();
    if (edit === undefined) {
      continue;
    }

    applyEdit(reg, edit);

    // if the file is changed multiple times, it is written to FS multiple times
    for (const filename in edit) {
      const file = reg.getFileByName(filename);
      if (file === undefined) {
        continue;
      }
      fs.writeFileSync(file.getFilename(), file.getRaw());
    }
  }
}