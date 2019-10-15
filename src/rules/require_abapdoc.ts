import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";

/** Checks abapdoc for public class methods and all interface methods. */
// todo check if public method is implementation of interface method
export class RequireAbapdocConf extends BasicRuleConfig {
}

export class RequireAbapdoc extends ABAPRule {

  private conf = new RequireAbapdocConf();

  public getKey(): string {
    return "require_abapdoc";
  }

  public getDescription(): string {
    return "Require abapdoc for public methods.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RequireAbapdocConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];
    const rows = file.getRawRows();

    for (const def of file.getClassDefinitions()) {
      for (const publicMethod of def.getMethodDefinitions().getPublic()) {
        const previousRow = publicMethod.getStart().getRow() - 2;
        if (!(rows[previousRow].trim().substring(0, 2) === "\"!")) {
          issues.push(new Issue({
            file,
            message: this.getDescription(),
            key: this.getKey(),
            start: publicMethod.getStart()}));
        }
      }
    }

    for (const def of file.getInterfaceDefinitions()) {
      for (const interfaceMethod of def.getMethodDefinitions()) {
        const previousRow = interfaceMethod.getStart().getRow() - 2;
        if (!(rows[previousRow].trim().substring(0, 2) === "\"!")) {
          issues.push(new Issue({
            file,
            message: this.getDescription(),
            key: this.getKey(),
            start: interfaceMethod.getStart()}));
        }
      }
    }

    return issues;
  }

}