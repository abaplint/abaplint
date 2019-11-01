import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {ClassDefinition} from "../../abap/statements";
import {IObject} from "../../objects/_iobject";
import {Registry} from "../../registry";
import {ClassName} from "../../abap/expressions";
import {Class} from "../../objects";
import {NamingRuleConfig} from "../_naming_rule_config";
import {NameValidator} from "../../utils/name_validator";

/** Allows you to enforce a pattern, such as a prefix, for local class names. */
export class LocalClassNamingConf extends NamingRuleConfig {
  /** The pattern for local class names */
  public local: string = "^LCL_.+$";
  /** The pattern for local test class names */
  public test: string = "^LTCL_.+$";
}

export class LocalClassNaming extends ABAPRule {

  private conf = new LocalClassNamingConf();

  public getKey(): string {
    return "local_class_naming";
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Local class name does not match pattern " + expected + ": " + actual :
      "Local class name must not match pattern " + expected + ": " + actual ;
  }

  public getConfig(): LocalClassNamingConf {
    return this.conf;
  }

  public setConfig(conf: LocalClassNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: Registry, obj: IObject) {
    const issues: Issue[] = [];
    const testRegex = new RegExp(this.conf.test, "i");
    const localRegex = new RegExp(this.conf.local, "i");

    for (const stat of file.getStatements()) {
      if (!(stat.get() instanceof ClassDefinition)) {
        continue;
      }

      const expr = stat.findFirstExpression(ClassName);
      if (!expr) {
        continue;
      }
      const token = expr.getFirstToken();
      const name = token.getStr();
      if (obj instanceof Class && name.toUpperCase() === obj.getName().toUpperCase()) {
        continue;
      }

      let expected = "";
      if (stat.concatTokens().toUpperCase().includes("FOR TESTING")) {
        if (NameValidator.violatesRule(name, testRegex, this.conf)) {
          expected = this.conf.test;
        }
      } else {
        if (NameValidator.violatesRule(name, localRegex, this.conf)) {
          expected = this.conf.local;
        }
      }

      if (expected.length > 0) {
        const issue = Issue.atToken(file, token, this.getDescription(expected, name), this.getKey());
        issues.push(issue);
      }
    }

    return issues;
  }

}