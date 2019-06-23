import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/statements";
import * as Expressions from "../abap/expressions";
import * as Structures from "../abap/structures";
import {BasicRuleConfig} from "./_basic_rule_config";

export class ShortCaseConf extends BasicRuleConfig {
  public length: number = 1;
  public allow: string[] = [];
}

export class ShortCase extends ABAPRule {
  private conf = new ShortCaseConf();

  public getKey(): string {
    return "short_case";
  }

  public getDescription(): string {
    return "Short CASE construct";
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

      if (c.findDirectStatements(Statements.When).length <= this.conf.length) {
        if (c.findAllExpressions(Expressions.Or).length > 0) {
          continue;
        }
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: c.getFirstToken().getStart()});
        issues.push(issue);
      }
    }

    return issues;
  }
}