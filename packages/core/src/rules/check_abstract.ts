import {Issue} from "../issue";
import {ABAPRule} from "./_abap_rule";
import {ABAPFile} from "../files";
import {BasicRuleConfig} from "./_basic_rule_config";

export class CheckAbstractConf extends BasicRuleConfig {
}

enum IssueType {
  /** Abstract method defined in non-abstract class */
  NotAbstractClass,
  AbstractAndFinal,
}

export class CheckAbstract extends ABAPRule {

  private conf = new CheckAbstractConf();

  public getMetadata() {
    return {
      key: "check_abstract",
      title: "Check abstract methods and classes",
      shortDescription: `Checks abstract methods and classes:
- class defined as abstract and final,
- non-abstract class contains abstract methods`,
    };
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

  public runParsed(file: ABAPFile) {
    const issues: Issue[] = [];

    for (const classDef of file.getInfo().listClassDefinitions()) {
      if (classDef.isAbstract === true) {
        if (classDef.isFinal === true) {
          issues.push(Issue.atIdentifier(
            classDef.identifier,
            this.getDescription(IssueType.AbstractAndFinal, classDef.name),
            this.getMetadata().key,
            this.conf.severity));
        }
        continue;
      }
      for (const methodDef of classDef.methods) {
        if (methodDef.isAbstract === true) {
          issues.push(Issue.atIdentifier(
            methodDef.identifier,
            this.getDescription(IssueType.NotAbstractClass, methodDef.name),
            this.getMetadata().key,
            this.conf.severity));
        }
      }
    }
    return issues;
  }
}