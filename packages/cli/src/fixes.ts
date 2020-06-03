import * as memfs from "memfs";
import {Issue, IRegistry, applyEditList, IEdit} from "@abaplint/core";

export function applyFixes(inputIssues: readonly Issue[], reg: IRegistry, fs: memfs.IFs): void {
  let changed: string[] = [];
  let iterations = 0;
  let issues = inputIssues;

  while(iterations <= 10) {
    changed = applyList(issues, reg, fs);
    if (changed.length === 0) {
      break;
    }
    iterations--;

    issues = reg.parse().findIssues();
  }

}

function applyList(issues: readonly Issue[], reg: IRegistry, fs: memfs.IFs): string[] {

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
  return changed;

}