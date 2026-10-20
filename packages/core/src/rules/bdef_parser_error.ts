import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {BehaviorDefinition} from "../objects";

export class BDEFParserErrorConf extends BasicRuleConfig {
}

export class BDEFParserError implements IRule {
  private conf = new BDEFParserErrorConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "bdef_parser_error",
      title: "BDEF Parser Error",
      shortDescription: `BDEF parsing`,
      extendedInformation: `Parses behavior definitions and issues parser errors`,
      tags: [RuleTag.Syntax, RuleTag.SingleFile],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BDEFParserErrorConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(object: IObject): Issue[] {
    const issues: Issue[] = [];

    if (object instanceof BehaviorDefinition) {
      const file = object.findSourceFile();
      if (object.hasParserError() === true && file) {
        const empty = file.getRaw().length === 0 ? ", empty file" : "";
        const message = "BDEF Parser error" + empty;
        issues.push(Issue.atRow(file, 1, message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}
