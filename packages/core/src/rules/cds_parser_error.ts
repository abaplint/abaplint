import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";

export class CDSParserErrorConf extends BasicRuleConfig {
}

export class CDSParserError implements IRule {
  private conf = new CDSParserErrorConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_parser_error",
      title: "CDS Parser Error",
      shortDescription: `CDS parsing`,
      extendedInformation: `Parses CDS and issues parser errors`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSParserErrorConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(o: IObject): Issue[] {
    const issues: Issue[] = [];

    if (o.getType() === "DDLS" && o instanceof DataDefinition) {
      const hasError = o.hasParserError();
      const file = o.findSourceFile();
      if (hasError === true && file) {
        issues.push(Issue.atRow(file, 1, "CDS Parser error", this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}