import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import * as Statements from "../abap/statements";
import * as Structures from "../abap/structures";
import {BasicRuleConfig} from "./_basic_rule_config";

export class ShortCaseConf extends BasicRuleConfig {
  public length: number = 1;
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
      if (c.findDirectStatements(Statements.When).length <= this.conf.length) {
        const issue = new Issue({file, message: this.getDescription(), key: this.getKey(), start: c.getFirstToken().getPos()});
        issues.push(issue);
      }
    }

    return issues;
  }
}