import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/2_statements/statements";
import * as Expressions from "../abap/2_statements/expressions";
import * as Structures from "../abap/3_structures/structures";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Checks for CASE statements which have fewer than the specified number of branches */
export class ShortCaseConf extends BasicRuleConfig {
  /** The smallest number of WHEN branches which will trigger a violation.
   * Example: if length = 1, at least 2 branches are required
   */
  public length: number = 1;

  public allow: string[] = [];
}

export class ShortCase extends ABAPRule {
  private conf = new ShortCaseConf();

  public getKey(): string {
    return "short_case";
  }

  private getDescription(): string {
    return "CASE construct too short, it must have a minimum of " + (this.conf.length + 1) + " WHEN branches";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: ShortCaseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    for (const c of struc.findAllStructures(Structures.Case)) {
      const clist = c.findDirectStatements(Statements.Case);
      if (clist.length > 0 && this.conf.allow && this.conf.allow.find((e) => { return e === clist[0].getTokens()[1].getStr(); })) {
        continue;
      }

      if (c.findDirectStructures(Structures.When).length <= this.conf.length) {
        if (c.findAllExpressions(Expressions.Or).length > 0) {
          continue;
        }
        const issue = Issue.atToken(file, c.getFirstToken(), this.getDescription(), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }
}