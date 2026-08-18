import {ExpressionNode} from "../abap/nodes";
import {StructureType, UnknownType, VoidType} from "../abap/types/basic";
import {CDSAs, CDSElement, CDSName, CDSPrefixedName, CDSRelation, CDSSource, CDSType} from "../cds/expressions";
import {DDIC} from "../ddic";
import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {DataDefinition} from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class CDSCheckSyntaxConf extends BasicRuleConfig {
}

type Source = {
  entity: string,
  names: string[],
  type: StructureType | UnknownType | VoidType,
};

export class CDSCheckSyntax implements IRule {
  private reg: IRegistry;
  private conf = new CDSCheckSyntaxConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "cds_check_syntax",
      title: "CDS Check Syntax",
      shortDescription: "Checks CDS source, field, and type references",
      extendedInformation: `Performs semantic checks which require other DDIC objects to be available.

Missing objects are only reported when their names match the configured errorNamespace.`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: CDSCheckSyntaxConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(object: IObject): Issue[] {
    if (!(object instanceof DataDefinition)) {
      return [];
    }

    const tree = object.getTree();
    const file = object.findSourceFile();
    if (tree === undefined || file === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    const ddic = new DDIC(this.reg);
    const sources = this.findSources(tree, ddic, issues, file);

    this.checkRelations(tree, ddic, issues, file);
    this.checkTypes(tree, ddic, issues, file);
    this.checkFields(tree, sources, object, issues, file);

    return issues;
  }

  private findSources(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile): Source[] {
    const sources: Source[] = [];

    for (const node of tree.findAllExpressionsRecursive(CDSSource)) {
      const prefixed = node.findDirectExpression(CDSPrefixedName);
      const entityNode = prefixed?.findDirectExpression(CDSName);
      if (entityNode === undefined) {
        continue;
      }

      const entity = this.name(entityNode);
      const asName = node.findDirectExpression(CDSAs)?.findDirectExpression(CDSName);
      const bareAlias = node.findDirectExpression(CDSName);
      const alias = asName === undefined ? bareAlias : asName;
      const lookup = ddic.lookupTableOrView(entity);

      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(entity)) {
        issues.push(Issue.atToken(file, entityNode.getFirstToken(), `CDS source "${entity}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }

      if (lookup.type instanceof StructureType || lookup.type instanceof UnknownType || lookup.type instanceof VoidType) {
        const names = [entity.toUpperCase()];
        if (alias) {
          names.push(this.name(alias).toUpperCase());
        }
        sources.push({entity, names, type: lookup.type});
      }
    }

    return sources;
  }

  private checkRelations(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    for (const relation of tree.findAllExpressionsRecursive(CDSRelation)) {
      const directTokens = relation.getDirectTokens();
      if (directTokens.length === 0) {
        continue;
      }
      const entity = directTokens.map(t => t.getStr()).join("");
      const lookup = ddic.lookupTableOrView(entity);
      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(entity)) {
        issues.push(Issue.atToken(file, directTokens[0], `CDS source "${entity}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private checkTypes(tree: ExpressionNode, ddic: DDIC, issues: Issue[], file: IFile) {
    for (const typeNode of tree.findAllExpressionsRecursive(CDSType)) {
      const typeName = typeNode.findDirectExpressions(CDSName).map(n => this.name(n)).join(".");
      if (typeName === "" || typeName.toUpperCase().startsWith("ABAP.")) {
        continue;
      }

      const lookup = ddic.lookup(typeName);
      if (lookup.type instanceof UnknownType && lookup.object === undefined && this.reg.inErrorNamespace(typeName)) {
        issues.push(Issue.atToken(file, typeNode.getFirstToken(), `CDS type "${typeName}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private checkFields(tree: ExpressionNode, sources: Source[], object: DataDefinition,
                      issues: Issue[], file: IFile) {
    const associationNames = new Set<string>();
    for (const association of object.getParsedData()?.associations || []) {
      associationNames.add(association.name.toUpperCase());
      if (association.as) {
        associationNames.add(association.as.toUpperCase());
      }
    }

    for (const element of tree.findAllExpressionsRecursive(CDSElement)) {
      const prefixed = element.findDirectExpression(CDSPrefixedName);
      if (prefixed === undefined) {
        continue;
      }

      const names = prefixed.findDirectExpressions(CDSName);
      if (names.length === 0) {
        continue;
      }

      const first = this.name(names[0]);
      if (first === "*" || first.startsWith("$") || first.startsWith("#") || associationNames.has(first.toUpperCase())) {
        continue;
      }

      if (names.length > 1) {
        const matchingSources = sources.filter(s => s.names.includes(first.toUpperCase()));
        if (matchingSources.length !== 1) {
          continue;
        }
        const source = matchingSources[0];
        const sourceType = source.type;
        if (!(sourceType instanceof StructureType)) {
          continue;
        }
        const field = this.name(names[1]);
        if (field !== "*" && sourceType.getComponentByName(field) === undefined) {
          issues.push(Issue.atToken(file, names[1].getFirstToken(), `CDS field "${field}" not found in "${source.entity}"`,
                                    this.getMetadata().key, this.conf.severity));
        }
        continue;
      }

      // Do not guess across joins or when a dependency is absent.
      if (sources.length !== 1) {
        continue;
      }

      const source = sources[0];
      const sourceType = source.type;
      if (!(sourceType instanceof StructureType)) {
        continue;
      }
      if (sourceType.getComponentByName(first) === undefined) {
        issues.push(Issue.atToken(file, names[0].getFirstToken(), `CDS field "${first}" not found in "${source.entity}"`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private name(node: ExpressionNode): string {
    return node.concatTokens().replace(/ /g, "");
  }
}
