import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {ClassDefinition} from "../abap/statements";
import {IObject} from "../objects/_iobject";
import {Registry} from "../registry";
import {ClassName} from "../abap/expressions";
import {Class} from "../objects";
import {BasicRuleConfig} from "./_basic_rule_config";

export class LocalClassNamingConf extends BasicRuleConfig {
  public local: string = "^LCL_.*$";
  public test: string = "^LTCL_.*$";
}

export class LocalClassNaming extends ABAPRule {

  private conf = new LocalClassNamingConf();

  public getKey(): string {
    return "local_class_naming";
  }

  public getDescription(): string {
    return "Local class naming";
  }

  public getConfig() {
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
      if (stat.concatTokens().includes("FOR TESTING")) {
        if (testRegex.test(name) === false) {
          expected = this.conf.test;
        }
      } else {
        if (localRegex.test(name) === false) {
          expected = this.conf.local;
        }
      }

      if (expected.length > 0) {
        const issue = new Issue({
          file,
          message: this.getDescription() + ", expected " + expected,
          key: this.getKey(),
          start: token.getStart(),
          end: token.getEnd()});
        issues.push(issue);
      }
    }

    return issues;
  }

}