import {Registry, Issue} from ".";
import {Include} from "./abap/statements";
import {IncludeName} from "./abap/expressions";
import {ABAPObject} from "./objects/_abap_object";
import {FunctionGroup, Program} from "./objects";
import {ABAPFile} from "./files";

// todo, check for cycles
// todo, check for unused includes
// todo, it is not possible to INCLUDE a main program

export class IncludeGraph {
  private readonly reg: Registry;
  private readonly issues: Issue[];

  public constructor(reg: Registry) {
    this.reg = reg;
    this.issues = [];
    this.build();
  }

  public getIssues(): Issue[] {
    return this.issues;
  }

  public getIssuesFile(file: ABAPFile): Issue[] {
    const ret: Issue[] = [];
    for (const i of this.issues) {
      if (i.getFilename() === file.getFilename()) {
        ret.push(i);
      }
    }
    return ret;
  }

///////////////////////////////

  private build() {
    for (const o of this.reg.getABAPObjects()) {
      if (o instanceof Program && o.isInclude() === true) {
        // todo, always add vertex to graph
      }
      for (const f of o.getABAPFiles()) {
        for (const s of f.getStatements()) {
          if (s.get() instanceof Include) {
            const ifFound = s.concatTokens().toUpperCase().includes("IF FOUND");
            const iexp = s.findFirstExpression(IncludeName);
            if (iexp === undefined) {
              throw new Error("unexpected Include node");
            }
            const name = iexp.getFirstToken().getStr().toUpperCase();
            const found = this.findInclude(name, o);
            if (found === false && ifFound === false) {
              const issue = Issue.atStatement(f, s, "Include " + name + " not found", "check_include");
              this.issues.push(issue);
            }
          }
        }
      }
    }
  }

  private findInclude(name: string, obj: ABAPObject): boolean {
    if (obj instanceof FunctionGroup) {
      const includes = obj.getIncludes();
      includes.push(("L" + obj.getName() + "UXX").toUpperCase());
      if (includes.indexOf(name) >= 0) {
        return true;
      }
    }

    const res = this.reg.getObject("PROG", name);
    return res !== undefined;
  }

}