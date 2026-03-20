import {Issue} from "../issue";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {DataDefinition} from "../objects";
import {CDSSelect, CDSElement, CDSAssociation, CDSAs, CDSName, CDSRelation} from "../cds/expressions";
import {ExpressionNode} from "../abap/nodes/expression_node";

export class CDSFieldOrderConf extends BasicRuleConfig {
}

export class CDSFieldOrder implements IRule {
  private conf = new CDSFieldOrderConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_field_order",
      title: "CDS Field Order",
      shortDescription: `Checks that CDS key fields are listed first and associations last in the field list`,
      tags: [RuleTag.SingleFile],
      badExample: `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  field1,
  key id,
  _Assoc
}`,
      goodExample: `define view entity test as select from source
  association [1..1] to target as _Assoc on _Assoc.id = source.id
{
  key id,
  field1,
  _Assoc
}`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSFieldOrderConf) {
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
    const associationNames = this.getAssociationNames(tree);

    for (const select of tree.findAllExpressions(CDSSelect)) {
      const elements = select.findDirectExpressions(CDSElement);
      if (elements.length === 0) {
        continue;
      }

      let seenNonKey = false;
      let seenAssociation = false;

      for (const element of elements) {
        const isKey = element.findDirectTokenByText("KEY") !== undefined;
        const isAssoc = this.isAssociationElement(element, associationNames);

        if (isKey && seenNonKey) {
          const message = "Key fields must be listed before non-key fields";
          issues.push(Issue.atToken(file, element.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity));
        }

        if (!isAssoc && seenAssociation) {
          const message = "Associations must be listed last in the field list";
          issues.push(Issue.atToken(file, element.getFirstToken(), message, this.getMetadata().key, this.getConfig().severity));
        }

        if (!isKey) {
          seenNonKey = true;
        }
        if (isAssoc) {
          seenAssociation = true;
        }
      }
    }

    return issues;
  }

  private getAssociationNames(tree: ExpressionNode): Set<string> {
    const names = new Set<string>();
    for (const assoc of tree.findAllExpressions(CDSAssociation)) {
      const relation = assoc.findDirectExpression(CDSRelation);
      if (relation === undefined) {
        continue;
      }
      const asNode = relation.findDirectExpression(CDSAs);
      if (asNode) {
        const nameNode = asNode.findDirectExpression(CDSName);
        if (nameNode) {
          names.add(nameNode.getFirstToken().getStr().toUpperCase());
        }
      } else {
        const name = relation.getFirstToken().getStr();
        names.add(name.toUpperCase());
      }
    }
    return names;
  }

  private isAssociationElement(element: ExpressionNode, associationNames: Set<string>): boolean {
    const tokens = element.concatTokens().replace(/^(KEY|VIRTUAL)\s+/i, "").trim();
    const name = tokens.split(/[\s.,:(]+/)[0];
    return associationNames.has(name.toUpperCase());
  }

}
