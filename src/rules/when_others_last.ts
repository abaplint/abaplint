import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/statements";
import * as Structures from "../abap/structures";

/** Checks that WHEN OTHERS is placed the last within a CASE statement. */
export class WhenOthersLastConf extends BasicRuleConfig {
}

export class WhenOthersLast extends ABAPRule {

  private conf = new WhenOthersLastConf();

  public getKey(): string {
    return "when_others_last";
  }

  private getDescription(): string {
    return "WHEN OTHERS should be the last branch in a CASE statement.";
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    const struc = file.getStructure();
    if (struc === undefined) {
      return [];
    }

    const cases = struc.findAllStructures(Structures.Case);
    for (const c of cases) {
      const whens = c.findDirectStatements(Statements.When);
      for (let i = 0; i < whens.length - 1; i++) {
        if (whens[i].concatTokens() === "WHEN OTHERS.") {
          const start = whens[i].getFirstToken().getStart();
          const issue = Issue.atPosition(file, start, this.getDescription(), this.getKey());
          issues.push(issue);
        }
      }
    }

    return issues;
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: WhenOthersLastConf) {
    this.conf = conf;
  }

}