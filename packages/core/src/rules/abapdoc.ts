import {ABAPRule} from "./_abap_rule";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Issue} from "../issue";
import {ABAPFile} from "../files";
import {IRegistry} from "../_iregistry";
import {IMethodDefinition} from "../abap/types/_method_definition";

export class AbapdocConf extends BasicRuleConfig {
  /** Check local classes and interfaces for abapdoc. */
  public checkLocal: boolean = false;
}

export class Abapdoc extends ABAPRule {

  private conf = new AbapdocConf();

  public getMetadata() {
    return {
      key: "abapdoc",
      title: "Check abapdoc",
      quickfix: false,
      shortDescription: `Various checks regarding abapdoc.
Base rule checks for existence of abapdoc for public class methods and all interface methods.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbapdocConf): void {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, _reg: IRegistry) {
    const issues: Issue[] = [];
    const rows = file.getRawRows();

    let methods: IMethodDefinition[] = [];

    for (const classDef of file.getInfo().getClassDefinitions()) {
      if (this.conf.checkLocal === false && classDef.isLocal() === true) {
        continue;
      }
      methods = methods.concat(classDef.getMethodDefinitions().getPublic());
    }

    for (const interfaceDef of file.getInfo().getInterfaceDefinitions()) {
      if (this.conf.checkLocal === false && interfaceDef.isLocal() === true) {
        continue;
      }
      methods = methods.concat(interfaceDef.getMethodDefinitions());
    }

    for (const method of methods) {
      if (method.isRedefinition()) {
        continue;
      }
      const previousRow = method.getStart().getRow() - 2;
      if (!(rows[previousRow].trim().substring(0, 2) === "\"!")) {
        const issue = Issue.atIdentifier(method, "Missing ABAP Doc for method " + method.getName(), this.getMetadata().key);
        issues.push(issue);
      }
    }
    return issues;
  }

}