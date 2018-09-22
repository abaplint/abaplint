import {IRule} from "./rule";
import {Issue} from "../issue";
import {Comment} from "../abap/statements/statement";
import * as Statements from "../abap/statements/";
import {ABAPObject} from "../objects";

export class DefinitionsTopConf {
  public enabled: boolean = true;
}

// todo, use enum instead?
const ANY = 1;
const DEFINITION = 2;
const AFTER = 3;
const IGNORE = 4;

export class DefinitionsTop implements IRule {

  private conf = new DefinitionsTopConf();

  public getKey(): string {
    return "definitions_top";
  }

  public getDescription(): string {
    return "Reorder definitions to top of routine";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf) {
    this.conf = conf;
  }

  public run(obj) {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    let abap = obj as ABAPObject;
    let issues: Array<Issue> = [];

    for (let file of abap.getParsed()) {

      let mode = ANY;
      let issue: Issue = undefined;

// todo, this needs refactoring when the paser has become better
      for (let statement of file.getStatements()) {
        if (statement instanceof Statements.Form
            || statement instanceof Statements.Method) {
          mode = DEFINITION;
          issue = undefined;
        } else if (statement instanceof Comment) {
          continue;
        } else if (statement instanceof Statements.Endform
            || statement instanceof Statements.Endmethod) {
          mode = ANY;
          if (issue !== undefined) {
            issues.push(issue);
            issue = undefined;
          }
        } else if (statement instanceof Statements.Data
            || statement instanceof Statements.DataBegin
            || statement instanceof Statements.DataEnd
            || statement instanceof Statements.Type
            || statement instanceof Statements.TypeBegin
            || statement instanceof Statements.TypeEnd
            || statement instanceof Statements.Constant
            || statement instanceof Statements.Include
            || statement instanceof Statements.IncludeType
            || statement instanceof Statements.Static
            || statement instanceof Statements.StaticBegin
            || statement instanceof Statements.StaticEnd
            || statement instanceof Statements.FieldSymbol) {
          if (mode === AFTER) {
            issue = new Issue(this, file, statement.getStart());
            mode = ANY;
          }
        } else if (statement instanceof Statements.Define) {
// todo, currently macros will skip checking of the routine
          mode = IGNORE;
        } else if (mode === DEFINITION) {
          mode = AFTER;
        }
      }
    }

    return issues;
  }
}