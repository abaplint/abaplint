import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {CDSMetadataExtension, DataDefinition} from "../objects";

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

  public run(object: IObject): Issue[] {
    const issues: Issue[] = [];

    if ((object.getType() === "DDLS" && object instanceof DataDefinition) ||
        (object.getType() === "DDLX" && object instanceof CDSMetadataExtension)) {
      const hasError = object.hasParserError();
      const file = object.findSourceFile();
      if (hasError === true && file) {
        issues.push(Issue.atRow(file, 1, "CDS Parser error", this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}