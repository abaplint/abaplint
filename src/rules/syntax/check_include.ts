import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {Registry} from "../../registry";
import {BasicRuleConfig} from "../_basic_rule_config";
import {Include} from "../../abap/statements";
import {IncludeName} from "../../abap/expressions";
import {ABAPObject} from "../../objects/_abap_object";
import {FunctionGroup} from "../../objects";

/** Checks INCLUDE statements */
export class CheckIncludeConf extends BasicRuleConfig {
}

export class CheckInclude extends ABAPRule {

  private conf = new CheckIncludeConf();

  public getKey(): string {
    return "check_include";
  }

  public getDescription(include: string): string {
    return "Include " + include + " not found";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckIncludeConf) {
    this.conf = conf;
  }

// todo, check for recursive INCLUDEs, and make sure to start in the main file

  public runParsed(file: ABAPFile, reg: Registry, obj: ABAPObject) {
    const issues: Issue[] = [];

    for (const statement of file.getStatements()) {
      if (statement.get() instanceof Include) {
        if (statement.concatTokens().toUpperCase().includes("IF FOUND")) {
          continue;
        }
        const iexp = statement.findFirstExpression(IncludeName);
        if (iexp === undefined) {
          throw new Error("unexpected Include node");
        }
        const name = iexp.getFirstToken().getStr().toUpperCase();

        if (this.findInclude(name, reg, obj) === false) {
          issues.push(new Issue({file,
            message: this.getDescription(name),
            key: this.getKey(),
            start: statement.getStart(),
            end: statement.getEnd()}));
        }
      }
    }

    return issues;
  }

  private findInclude(name: string, reg: Registry, obj: ABAPObject): boolean {
    if (obj instanceof FunctionGroup) {
      const includes = obj.getIncludes();
      includes.push(("L" + obj.getName() + "UXX").toUpperCase());
      if (includes.indexOf(name) >= 0) {
        return true;
      }
    }

    const res = reg.getObject("PROG", name);
    return res !== undefined;
  }

}