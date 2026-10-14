import * as Expressions from "../abap/2_statements/expressions";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode} from "../abap/nodes";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {ObjectReferenceType} from "../abap/types/basic";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {EditHelper} from "../edit_helper";
import {Release, releaseAtLeast} from "../version";

export class RedundantCastConf extends BasicRuleConfig {
}

export class RedundantCast implements IRule {
  private reg: IRegistry;
  private conf = new RedundantCastConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "redundant_cast",
      title: "Redundant Cast",
      shortDescription: `Find redundant CAST expressions`,
      extendedInformation: `Reports CAST expressions whose operand is already a reference to the cast's target class or interface.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA ref TYPE REF TO lcl.
DATA(copy) = CAST lcl( ref ).`,
      goodExample: `DATA ref TYPE REF TO lcl.
DATA(copy) = ref.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RedundantCastConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!releaseAtLeast(this.reg.getConfig().getRelease(), Release.v740sp02)
        && !this.reg.getConfig().isOpenABAP()) {
      return [];
    }

    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const issues: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      const structure = file.getStructure();
      if (structure === undefined) {
        continue;
      }

      for (const cast of structure.findAllExpressionsRecursive(Expressions.Cast)) {
        const typeExpression = cast.findDirectExpression(Expressions.TypeNameOrInfer);
        const source = cast.findDirectExpression(Expressions.Source);
        if (typeExpression === undefined
            || source === undefined
            || cast.findDirectExpression(Expressions.Let) !== undefined) {
          continue;
        }

        const scope = syntax.spaghetti.lookupPosition(cast.getFirstToken().getStart(), file.getFilename());
        if (scope === undefined) {
          continue;
        }

        const target = scope.getData().references.find(reference =>
          reference.referenceType === ReferenceType.InferredType
          && reference.position.getStart().equals(typeExpression.getFirstToken().getStart()))?.resolved;
        if (!(target instanceof TypedIdentifier)) {
          continue;
        }

        const operandType = this.sourceType(source, scope);
        if (operandType === undefined || this.sameType(target.getType(), operandType) === false) {
          continue;
        }

        const closingParen = cast.getDirectTokens().find(token =>
          token.getStr() === ")" && token.getStart().isAfter(source.getLastToken().getStart()));
        if (closingParen === undefined) {
          continue;
        }

        const fix = EditHelper.replaceRange(file, cast.getFirstToken().getStart(), closingParen.getEnd(), source.concatTokens());
        issues.push(Issue.atRange(
          file,
          cast.getFirstToken().getStart(),
          closingParen.getEnd(),
          "Redundant CAST expression",
          this.getMetadata().key,
          this.conf.severity,
          fix));
      }
    }

    return issues;
  }

  /** The type of a plain variable or attribute, undefined for anything more complex */
  private sourceType(source: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    const children = source.getChildren();
    if (children.length !== 1 || !(children[0].get() instanceof Expressions.FieldChain)) {
      return undefined;
    }

    const fieldChain = children[0] as ExpressionNode;
    const last = fieldChain.getLastChild();
    if (!(last instanceof ExpressionNode)
        || !(last.get() instanceof Expressions.SourceField || last.get() instanceof Expressions.AttributeName)) {
      return undefined;
    }

    const operand = scope.getData().references.find(reference =>
      reference.referenceType === ReferenceType.DataReadReference
      && reference.position.getStart().equals(last.getFirstToken().getStart()))?.resolved;
    if (!(operand instanceof TypedIdentifier)) {
      return undefined;
    }
    return operand.getType();
  }

  private sameType(first: AbstractType, second: AbstractType): boolean {
    if (!(first instanceof ObjectReferenceType) || !(second instanceof ObjectReferenceType)) {
      return false;
    }
    return first.getIdentifierName().toUpperCase() === second.getIdentifierName().toUpperCase();
  }
}
