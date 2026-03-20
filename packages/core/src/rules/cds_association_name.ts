import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";
import {CDSAssociation, CDSAs, CDSName} from "../cds/expressions";

export class CDSAssociationNameConf extends BasicRuleConfig {
}

export class CDSAssociationName implements IRule {
  private conf = new CDSAssociationNameConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_association_name",
      title: "CDS Association Name",
      shortDescription: `CDS association names should start with an underscore`,
      extendedInformation: `By convention, CDS association names must start with an underscore character.

https://help.sap.com/docs/abap-cloud/abap-data-models/cds-associations`,
      tags: [RuleTag.SingleFile, RuleTag.Naming],
      badExample: `define view entity test as select from source
  association [1..1] to target as Assoc on Assoc.id = source.id
{ key id }`,
      goodExample: `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{ key id }`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSAssociationNameConf) {
    this.conf = conf;
  }

  public initialize(_reg: IRegistry): IRule {
    return this;
  }

  public run(o: IObject): Issue[] {
    if (o.getType() !== "DDLS" || !(o instanceof DataDefinition)) {
      return [];
    }

    const tree = o.getTree();
    if (tree === undefined) {
      return [];
    }

    const file = o.findSourceFile();
    if (file === undefined) {
      return [];
    }

    const issues: Issue[] = [];

    for (const assoc of tree.findAllExpressions(CDSAssociation)) {
      const asExpr = assoc.findFirstExpression(CDSAs);
      if (asExpr === undefined) {
        continue;
      }
      const nameExpr = asExpr.findDirectExpression(CDSName);
      if (nameExpr === undefined) {
        continue;
      }
      const name = nameExpr.getFirstToken().getStr();
      if (!name.startsWith("_")) {
        const token = nameExpr.getFirstToken();
        const message = `CDS association name "${name}" should start with an underscore`;
        issues.push(Issue.atToken(file, token, message, this.getMetadata().key, this.getConfig().severity));
      }
    }

    return issues;
  }

}
