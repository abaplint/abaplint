import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/2_statements/statements";
import * as Structures from "../abap/3_structures/structures";
import {IRuleMetadata} from "./_irule";

export class BeginSingleIncludeConf extends BasicRuleConfig {
}

export class BeginSingleInclude extends ABAPRule {

  private conf = new BeginSingleIncludeConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "begin_single_include",
      title: "BEGIN contains single INCLUDE",
      shortDescription: `Finds TYPE BEGIN with just one INCLUDE TYPE, and DATA with single INCLUDE STRUCTURE`,
      badExample: `TYPES: BEGIN OF dummy1.
  INCLUDE TYPE dselc.
TYPES: END OF dummy1.

DATA BEGIN OF foo.
INCLUDE STRUCTURE syst.
DATA END OF foo.

STATICS BEGIN OF bar.
INCLUDE STRUCTURE syst.
STATICS END OF bar.`,
      goodExample: `DATA BEGIN OF foo.
INCLUDE STRUCTURE dselc.
DATA END OF foo.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BeginSingleIncludeConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const stru = file.getStructure();
    if (stru === undefined) {
      return [];
    }

    for (const t of stru.findAllStructures(Structures.Types)) {
      if (t.getChildren().length !== 3) {
        continue;
      }
      if (t.findFirstStatement(Statements.IncludeType)) {
        const token = t.getFirstToken();
        const message = "TYPE BEGIN with single INCLUDE";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    for (const t of stru.findAllStructures(Structures.Data)) {
      if (t.getChildren().length !== 3) {
        continue;
      }
      if (t.findFirstStatement(Statements.IncludeType)) {
        const token = t.getFirstToken();
        const message = "DATA BEGIN with single INCLUDE";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    for (const t of stru.findAllStructures(Structures.Statics)) {
      if (t.getChildren().length !== 3) {
        continue;
      }
      if (t.findFirstStatement(Statements.IncludeType)) {
        const token = t.getFirstToken();
        const message = "STATICS BEGIN with single INCLUDE";
        const issue = Issue.atToken(file, token, message, this.getMetadata().key, this.conf.severity);
        issues.push(issue);
      }
    }

    return issues;
  }

}