import * as Statements from "../abap/statements/";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class AvoidUseConf extends BasicRuleConfig {
  public define = true;
  public endselect = true;
  public execSQL = true;
}

export class AvoidUse extends ABAPRule {

  private conf = new AvoidUseConf();

  public getKey(): string {
    return "avoid_use";
  }

  public getDescription(): string {
    return "Avoid use";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AvoidUseConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      let message: string | undefined = undefined;
      if (this.conf.define && statement.get() instanceof Statements.Define) {
        message = "Avoid use of DEFINE";
      } else if (this.conf.endselect && statement.get() instanceof Statements.EndSelect) {
        message = "Avoid use of ENDSELECT";
      } else if (this.conf.execSQL && statement.get() instanceof Statements.ExecSQL) {
        message = "Avoid use of EXEC SQL";
      }
      if (message) {
        issues.push(new Issue({file, message, key: this.getKey(), start: statement.getStart()}));
      }
    }

    return issues;
  }
}