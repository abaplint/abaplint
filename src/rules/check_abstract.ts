import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";
import {Registry} from "..";
import {Scope} from "../abap/syntax/_scope";

/**
 * Checks abstract methods and classes:
 * - class defined as abstract and final,
 * - non-abstract class contains abstract methods
 */
export class CheckAbstractConf extends BasicRuleConfig {
}

enum IssueType {
  /** Abstract method defined in non-abstract class */
  NotAbstractClass,
  AbstractAndFinal,
}
export class CheckAbstract extends ABAPRule {

  private conf = new CheckAbstractConf();

  public getKey(): string {
    return "check_abstract";
  }

  private getDescription(issueType: IssueType, name: string): string {
    switch (issueType) {
      case IssueType.AbstractAndFinal: return "Classes cannot be ABSTRACT and FINAL: " + name;
      case IssueType.NotAbstractClass: return "Abstract methods require abstract classes: " + name;
      default: return "";
    }
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CheckAbstractConf) {
    this.conf = conf;
  }

  public runParsed(file: ABAPFile, reg: Registry) {
    const issues: Issue[] = [];
    const scope = Scope.buildDefault(reg);

    for (const classDef of file.getClassDefinitions()) {
      if (classDef.isAbstract()) {
        if (classDef.isFinal()) {
          issues.push(Issue.atIdentifier(
            classDef, this.getDescription(IssueType.AbstractAndFinal, classDef.getName()), this.getKey()));
        }
        continue;
      }
      for (const methodDef of classDef.getMethodDefinitions(scope).getAll()) {
        if (methodDef.isAbstract()) {
          issues.push(Issue.atIdentifier(
            methodDef, this.getDescription(IssueType.NotAbstractClass, methodDef.getName()), this.getKey()));
        }
      }
    }
    return issues;
  }
}