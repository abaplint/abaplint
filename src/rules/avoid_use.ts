import * as Statements from "../abap/statements/";
import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

/** Detects usage of certain statements. */
export class AvoidUseConf extends BasicRuleConfig {
  /** Detects define (macro definitions) */
  public define: boolean = true;
  /** Detects endselect */
  public endselect: boolean = true;
  /** Detects execSQL (dynamic SQL) */
  public execSQL: boolean = true;
  /** Detects kernel calls */
  public kernelCall: boolean = true;
  /** Detects communication */
  public communication: boolean = true;
  /** Detects statics */
  public statics: boolean = true;
}

export class AvoidUse extends ABAPRule {

  private conf = new AvoidUseConf();

  public getKey(): string {
    return "avoid_use";
  }

  public getDescription(statement: string): string {
    return "Avoid use of " + statement;
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
        message = "DEFINE";
      } else if (this.conf.endselect && statement.get() instanceof Statements.EndSelect) {
        message = "ENDSELECT";
      } else if (this.conf.execSQL && statement.get() instanceof Statements.ExecSQL) {
        message = "EXEC SQL";
      } else if (this.conf.kernelCall && statement.get() instanceof Statements.CallKernel) {
        message = "KERNEL CALL";
      } else if (this.conf.communication && statement.get() instanceof Statements.Communication) {
        message = "COMMUNICATION";
      } else if (this.conf.statics
          && (statement.get() instanceof Statements.Static
          || statement.get() instanceof Statements.StaticBegin)) {
        message = "STATICS";
      }
      if (message) {
        issues.push(new Issue({file, message: this.getDescription(message), key: this.getKey(), start: statement.getStart()}));
      }
    }

    return issues;
  }
}