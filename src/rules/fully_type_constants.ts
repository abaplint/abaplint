import {BasicRuleConfig} from "./_basic_rule_config";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {Issue} from "..";
import * as Statements from "../abap/statements";
import {Type} from "../abap/expressions";

// todo jsdoc
export class FullyTypeConsantsConf extends BasicRuleConfig {
  // todo jsdoc
  public checkData: boolean = true;
}

export class FullyTypeConstants extends ABAPRule {
  private conf = new FullyTypeConsantsConf();

  public getKey(): string {
    return "fully_type_constants";
  }

  public getDescription(type: string): string {
    return `Fully type ${type} (no implicit typing).`;
  }

  public getConfig(): FullyTypeConsantsConf {
    return this.conf;
  }

  public setConfig(conf: FullyTypeConsantsConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];

    for (const stat of file.getStatements()) {
      if ((stat.get() instanceof Statements.Constant
          || (this.conf.checkData === true && stat.get() instanceof Statements.Data))
          && (!stat.findFirstExpression(Type))) {
        issues.push(
          Issue.atStatement(
            file,
            stat,
            this.getDescription(stat.getFirstToken().getStr()),
            this.getKey()));
      }
    }
    return issues;
  }
}