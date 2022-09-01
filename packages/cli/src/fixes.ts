import {Issue, IRegistry, applyEditList, IEdit, RulesRunner} from "@abaplint/core";

export interface MyFS {
  writeFileSync(name: string, raw: string): void;
}

export class ApplyFixes {
  private readonly changedFiles: Set<string> = new Set<string>();

  // Strategy:
  // Execute one rule at a time and apply fixes for that rule
  // Some rules are quite expensive to initialize(like downport),
  // so running all rules every time is expensive.
  public async applyFixes(reg: IRegistry, fs: MyFS, quiet?: boolean) {
    let iteration = 0;
    this.changedFiles.clear();
    const MAX_ITERATIONS = 50000;

    const objects = new RulesRunner(reg).objectsToCheck(reg.getObjects());
    const rules = reg.getConfig().getEnabledRules();

    while(iteration <= MAX_ITERATIONS) {
      let changed = 0;
      for (const rule of rules) {
        while(iteration <= MAX_ITERATIONS) {
          const before = Date.now();

          rule.initialize(reg);
          let issues: Issue[] = [];
          for (const obj of objects) {
            issues.push(...rule.run(obj));
          }
          issues = new RulesRunner(reg).excludeIssues(issues);

          iteration++;
          const appliedCount = this.applyList(issues, reg).length;
          const runtime = Date.now() - before;
          if (quiet !== true) {
            process.stderr.write(`\tIteration ${iteration.toString().padStart(3, " ")}, ${
              appliedCount.toString().padStart(3, " ")} fixes applied, ${
              runtime.toString().padStart(4, " ")}ms, rule ${rule.getMetadata().key}\n`);
          }
          if (appliedCount > 0) {
            changed += appliedCount;
            const before = Date.now();
            reg.parse();
            const runtime = Date.now() - before;
            if (quiet !== true) {
              process.stderr.write(`\tParse, ${runtime}ms\n`);
            }
          } else {
            break;
          }
        }
      }
      if (changed === 0) {
        break;
      }
    }

    this.writeChangesToFS(fs, reg);
  }

///////////////////////////////////////////////////

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