import {IRegistry} from "../_iregistry";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IObject} from "../objects/_iobject";
import {ABAPObject} from "../objects/_abap_object";
import {Issue} from "../issue";
import {RuleTag, IRuleMetadata, IRule} from "./_irule";
import {Severity} from "../severity";

export class CheckSyntaxConf extends BasicRuleConfig {
}

export class CheckSyntax implements IRule {
  private reg: IRegistry;
  private conf = new CheckSyntaxConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "check_syntax",
      title: "Check syntax",
      shortDescription: `Enables syntax check and variable resolution`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public setConfig(conf: CheckSyntaxConf) {
    this.conf = conf;
  }

  public run(obj: IObject): Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const issues = new SyntaxLogic(this.reg, obj).run().issues;

// the syntax logic does not know the rule severity when its run
    if (this.conf.severity
        && this.conf.severity !== Severity.Error) {
      issues.forEach((value: Issue, index: number) => {
        const data = value.getData();
        data.severity = this.conf.severity!;
        issues[index] = new Issue(data);
      });
    }

    return issues;
  }

}