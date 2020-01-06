import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {MethodDefinition} from "../abap/types";
import {CurrentScope} from "../abap/syntax/_current_scope";
import {Registry} from "../registry";

/**
 * Various checks regarding abapdoc. Base rule checks for existence of abapdoc for
 * public class methods and all interface methods.
 */
export class AbapdocConf extends BasicRuleConfig {

  /** Check local classes and interfaces for abapdoc. */
  public checkLocal: boolean = false;
}

export class Abapdoc extends ABAPRule {

  private conf = new AbapdocConf();

  public getKey(): string {
    return "abapdoc";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];
    const rows = file.getRawRows();
    const scope = CurrentScope.buildDefault(reg);
    let methods: MethodDefinition[] = [];

    for (const classDef of file.getClassDefinitions()) {
      if (this.conf.checkLocal === false && classDef.isLocal() === true) {
        continue;
      }
      methods = methods.concat(classDef.getMethodDefinitions(scope).getPublic());
    }

    for (const interfaceDef of file.getInterfaceDefinitions()) {
      if (this.conf.checkLocal === false && interfaceDef.isLocal() === true) {
        continue;
      }
      methods = methods.concat(interfaceDef.getMethodDefinitions(scope));
    }

    for (const method of methods) {
      const previousRow = method.getStart().getRow() - 2;
      if (method.isRedefinition()) {
        continue;
      }
      if (!(rows[previousRow].trim().substring(0, 2) === "\"!")) {
        const issue = Issue.atIdentifier(method, "Missing ABAP Doc for method " + method.getName(), this.getKey());
        issues.push(issue);
      }
    }
    return issues;
  }

}