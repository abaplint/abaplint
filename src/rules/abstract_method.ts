import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "..";
import {Scope} from "../abap/syntax/_scope";

/** Checks for abstract methods in non-abstract classes. */
export class AbstractMethodConf extends BasicRuleConfig {
}

export class AbstractMethod extends ABAPRule {

  private conf = new AbstractMethodConf();

  public getKey(): string {
    return "abstract_method";
  }

  private getDescription(): string {
    return "Abstract methods require abstract classes.";
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: AbstractMethodConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];
    const scope = Scope.buildDefault(reg);

    for (const classDef of file.getClassDefinitions()) {
      if (classDef.isAbstract()) {
        continue;
      }
      for (const methodDef of classDef.getMethodDefinitions(scope).getAll()) {
        if (methodDef.isAbstract()) {
          issues.push(Issue.atIdentifier(methodDef, this.getDescription(), this.getKey()));
        }
      }
    }
    return issues;
  }
}