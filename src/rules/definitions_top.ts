import {Issue} from "../issue";
import {Comment} from "../abap/statements/_statement";
import * as Statements from "../abap/statements/";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks that definitions are placed at the beginning of methods. */
export class DefinitionsTopConf extends BasicRuleConfig {
}

// todo, use enum instead?
const ANY = 1;
const DEFINITION = 2;
const AFTER = 3;
const IGNORE = 4;

export class DefinitionsTop extends ABAPRule {

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

  public setConfig(conf: DefinitionsTopConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    let mode = ANY;
    let issue: Issue | undefined = undefined;

// todo, this needs refactoring when the paser has become better
    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Statements.Form
          || statement.get() instanceof Statements.Method) {
        mode = DEFINITION;
        issue = undefined;
      } else if (statement.get() instanceof Comment) {
        continue;
      } else if (statement.get() instanceof Statements.EndForm
          || statement.get() instanceof Statements.EndMethod) {
        mode = ANY;
        if (issue !== undefined) {
          issues.push(issue);
          issue = undefined;
        }
      } else if (statement.get() instanceof Statements.Data
          || statement.get() instanceof Statements.DataBegin
          || statement.get() instanceof Statements.DataEnd
          || statement.get() instanceof Statements.Type
          || statement.get() instanceof Statements.TypeBegin
          || statement.get() instanceof Statements.TypeEnd
          || statement.get() instanceof Statements.Constant
          || statement.get() instanceof Statements.ConstantBegin
          || statement.get() instanceof Statements.ConstantEnd
          || statement.get() instanceof Statements.Include
          || statement.get() instanceof Statements.IncludeType
          || statement.get() instanceof Statements.Static
          || statement.get() instanceof Statements.StaticBegin
          || statement.get() instanceof Statements.StaticEnd
          || statement.get() instanceof Statements.FieldSymbol) {
        if (mode === AFTER) {
          issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: statement.getStart()});
          mode = ANY;
        }
      } else if (statement.get() instanceof Statements.Define) {
// todo, currently macros will skip checking of the routine
        mode = IGNORE;
      } else if (mode === DEFINITION) {
        mode = AFTER;
      }
    }

    return issues;
  }
}