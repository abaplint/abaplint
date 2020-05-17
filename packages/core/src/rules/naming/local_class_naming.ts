import {Issue} from "../../issue";
import {ABAPRule} from "../_abap_rule";
import {ABAPFile} from "../../files";
import {NamingRuleConfig} from "../_naming_rule_config";
import {NameValidator} from "../../utils/name_validator";

export class LocalClassNamingConf extends NamingRuleConfig {
  /** The pattern for local class names */
  public local: string = "^LCL_.+$";
  /** The pattern for local exception names */
  public exception: string = "^LCX_.+$";
  /** The pattern for local test class names */
  public test: string = "^LTCL_.+$";
}

export class LocalClassNaming extends ABAPRule {

  private conf = new LocalClassNamingConf();

  public getMetadata() {
    return {
      key: "local_class_naming",
      title: "Local class naming conventions",
      quickfix: false,
      shortDescription: `Allows you to enforce a pattern, such as a prefix, for local class names.`,
    };
  }

  private getDescription(expected: string, actual: string): string {
    return this.conf.patternKind === "required" ?
      "Local class name does not match pattern " + expected + ": " + actual :
      "Local class name must not match pattern " + expected + ": " + actual;
  }

  public getConfig(): LocalClassNamingConf {
    return this.conf;
  }

  public setConfig(conf: LocalClassNamingConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile): Issue[] {
    const issues: Issue[] = [];
    if (this.conf.patternKind === undefined) {
      this.conf.patternKind = "required";
    }

    for (const classDef of file.getInfo().listClassDefinitions()) {
      if (classDef.isGlobal) {
        continue;
      }

      const className = classDef.name;
      let expected = "";

      if (classDef.isForTesting) {
        expected = this.conf.test;
      } else if (classDef.isException) {
        expected = this.conf.exception;
      } else {
        expected = this.conf.local;
      }
      if (expected === undefined || expected.length === 0) {
        continue;
      }
      const regex = new RegExp(expected, "i");

      if (NameValidator.violatesRule(className, regex, this.conf)) {
        issues.push(
          Issue.atIdentifier(
            classDef.identifier,
            this.getDescription(expected, className),
            this.getMetadata().key));
      }
    }
    return issues;
  }

}