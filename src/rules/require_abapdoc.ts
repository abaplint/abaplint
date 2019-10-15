import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {MethodDefinition} from "../abap/types";

/** Checks abapdoc for public class methods and all interface methods. */
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
    let methods: MethodDefinition[] = [];

    for (const classDef of file.getClassDefinitions()) {
      methods = methods.concat(classDef.getMethodDefinitions().getPublic());
    }
    for (const interfaceDef of file.getInterfaceDefinitions()) {
      methods = methods.concat(interfaceDef.getMethodDefinitions());
    }

    for (const method of methods) {
      const previousRow = method.getStart().getRow() - 2;
      if (!(rows[previousRow].trim().substring(0, 2) === "\"!")) {
        issues.push(new Issue({
          file,
          message: this.getDescription(),
          key: this.getKey(),
          start: method.getStart() }));
      }
    }
    return issues;
  }

}