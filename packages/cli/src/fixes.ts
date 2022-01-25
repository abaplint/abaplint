import {Issue, IRegistry, applyEditList, IEdit, IProgress} from "@abaplint/core";

export interface MyFS {
  writeFileSync(name: string, raw: string): void;
}

export class ApplyFixes {
  private readonly changedFiles: Set<string> = new Set<string>();

  public applyFixes(inputIssues: readonly Issue[], reg: IRegistry, fs: MyFS, bar?: IProgress): readonly Issue[] {
    let changed: string[] = [];
    let iteration = 1;
    let issues = inputIssues;
    this.changedFiles.clear();
    const MAX_ITERATIONS = 50000;

    bar?.set(MAX_ITERATIONS, "Apply Fixes");
    while(iteration <= MAX_ITERATIONS) {
      bar?.tick("Apply Fixes, iteration " + iteration + ", " + issues.length + " candidates");

      changed = this.applyList(issues, reg);
      if (changed.length === 0) {
        break;
      }
      iteration++;

      issues = reg.parse().findIssues();
    }

    this.writeChangesToFS(fs, reg);

  // always end the progress indicator at 100%
    while(iteration <= MAX_ITERATIONS) {
      bar?.tick("Fixes Applied");
      iteration++;
    }

    return issues;
  }

  private writeChangesToFS(fs: MyFS, reg: IRegistry) {
    for (const filename of this.changedFiles.values()) {
      const file = reg.getFileByName(filename);
      if (file === undefined) {
        continue;
      }
      fs.writeFileSync(file.getFilename(), file.getRaw());
    }
  }

  private possibleOverlap(edit: IEdit, list: IEdit[]): boolean {
  // only checks if the edits have changes in the same rows
    for (const e of list) {
      for (const file1 of Object.keys(e)) {
        for (const file2 of Object.keys(edit)) {
          if (file1 === file2) {
            for (const list1 of e[file1]) {
              for (const list2 of edit[file2]) {
                if (list2.range.start.getRow() <= list1.range.start.getRow()
                  && list2.range.end.getRow() >= list1.range.start.getRow()) {
                  return true;
                }
                if (list2.range.start.getRow() <= list1.range.start.getRow()
                  && list2.range.end.getRow() >= list1.range.end.getRow()) {
                  return true;
                }
              }
            }
          }
        }
      }
    }
    return false;
  }

  private applyList(issues: readonly Issue[], reg: IRegistry): string[] {

    const edits: IEdit[] = [];

    for (const i of issues) {
      const edit = i.getFix();
      if (edit === undefined) {
        continue;
      } else if (this.possibleOverlap(edit, edits) === true) {
        continue;
      }

      edits.push(edit);
    }

    const changed = applyEditList(reg, edits);

    for (const filename of changed) {
      this.changedFiles.add(filename);
    }
    return changed;

  }

}