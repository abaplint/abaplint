import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import * as Statements from "../abap/statements";
import * as Structures from "../abap/structures";

export class WhenOthersLastConf extends BasicRuleConfig {
}

export class WhenOthersLast extends ABAPRule {

  private conf = new WhenOthersLastConf();

  public getKey(): string {
    return "when_others_last";
  }

  public getDescription(): string {
    return "WHEN OTHERS should be last in CASE";
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
          const start = whens[i].getFirstToken().getPos();
          const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start});
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