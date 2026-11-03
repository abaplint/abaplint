import {ExpressionNode} from "../abap/nodes";
import {BDEFDefineBehavior, BDEFImplementationIn, BDEFName} from "../bdef/expressions";
import {DDIC} from "../ddic";
import {IFile} from "../files/_ifile";
import {Issue} from "../issue";
import {BehaviorDefinition} from "../objects";
import {IObject} from "../objects/_iobject";
import {IRegistry} from "../_iregistry";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";

export class BDEFCheckSyntaxConf extends BasicRuleConfig {
}

export class BDEFCheckSyntax implements IRule {
  private reg: IRegistry;
  private conf = new BDEFCheckSyntaxConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "bdef_check_syntax",
      title: "BDEF Check Syntax",
      shortDescription: "Checks behavior definition references to entities and implementation classes",
      extendedInformation: `Performs semantic checks which require other objects to be available.

Missing objects are only reported when their names match the configured errorNamespace.`,
      tags: [RuleTag.Syntax],
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: BDEFCheckSyntaxConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry): IRule {
    this.reg = reg;
    return this;
  }

  public run(object: IObject): Issue[] {
    if (!(object instanceof BehaviorDefinition)) {
      return [];
    }

    const tree = object.getTree();
    const file = object.findSourceFile();
    if (tree === undefined || file === undefined) {
      return [];
    }

    const issues: Issue[] = [];
    this.checkImplementationClasses(tree, issues, file);
    this.checkEntities(tree, issues, file);
    return issues;
  }

  private checkImplementationClasses(tree: ExpressionNode, issues: Issue[], file: IFile) {
    for (const implementation of tree.findAllExpressions(BDEFImplementationIn)) {
      const nameNode = implementation.findDirectExpression(BDEFName);
      if (nameNode === undefined) {
        continue;
      }
      const name = this.name(nameNode);
      if (this.reg.getObject("CLAS", name) === undefined && this.reg.inErrorNamespace(name)) {
        issues.push(Issue.atToken(file, nameNode.getFirstToken(), `Implementation class "${name}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private checkEntities(tree: ExpressionNode, issues: Issue[], file: IFile) {
    const ddic = new DDIC(this.reg);
    for (const define of tree.findDirectExpressions(BDEFDefineBehavior)) {
      if (define.getFirstToken().getStr().toUpperCase() !== "DEFINE") {
        // "extend behavior for" refers to entities of the extended BDEF
        continue;
      }
      const nameNode = define.findDirectExpression(BDEFName);
      if (nameNode === undefined) {
        continue;
      }
      const name = this.name(nameNode);
      if (this.reg.inErrorNamespace(name)
          && this.reg.getObject("DDLS", name) === undefined
          && ddic.lookupDDLS(name) === undefined) {
        issues.push(Issue.atToken(file, nameNode.getFirstToken(), `Entity "${name}" not found`,
                                  this.getMetadata().key, this.conf.severity));
      }
    }
  }

  private name(node: ExpressionNode): string {
    return node.concatTokens().replace(/ /g, "");
  }
}
