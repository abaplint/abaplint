import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPFile} from "../abap/abap_file";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {Constant as ConstantSyntax} from "../abap/5_syntax/expressions/constant";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode} from "../abap/nodes";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {FloatType, HexType, IntegerType, StringType, StructureType, TableType, UnknownType, VoidType} from "../abap/types/basic";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {EditHelper} from "../edit_helper";
import {Release, releaseAtLeast} from "../version";

export class RedundantConversionConf extends BasicRuleConfig {
}

export class RedundantConversion implements IRule {
  private reg: IRegistry;
  private conf = new RedundantConversionConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "redundant_conversion",
      title: "Redundant Conversion",
      shortDescription: `Find redundant CONV expressions`,
      extendedInformation: `Reports CONV expressions whose operand already has the conversion's target type.`,
      tags: [RuleTag.Quickfix],
      badExample: `DATA text TYPE string.
text = CONV string( text ).`,
      goodExample: `DATA text TYPE string.
text = text.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: RedundantConversionConf) {
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

      for (const source of structure.findAllExpressions(Expressions.Source)) {
        if (source.getFirstToken().getStr().toUpperCase() !== "CONV") {
          continue;
        }

        const typeExpression = source.findDirectExpression(Expressions.TypeNameOrInfer);
        const bodySource = source.findDirectExpression(Expressions.ConvBody)
          ?.findDirectExpression(Expressions.Source);
        if (typeExpression === undefined
            || bodySource === undefined) {
          continue;
        }

        const scope = syntax.spaghetti.lookupPosition(source.getFirstToken().getStart(), file.getFilename());
        if (scope === undefined) {
          continue;
        }

        const target = scope.getData().references.find(reference =>
          reference.referenceType === ReferenceType.InferredType
          && reference.position.getStart().equals(typeExpression.getFirstToken().getStart()))?.resolved;
        const operandType = this.sourceType(bodySource, scope);

        if (!(target instanceof TypedIdentifier)) {
          continue;
        }
        const operandHasSameType = operandType !== undefined && this.sameType(target.getType(), operandType);
        const arithmeticHasSameContext = this.arithmeticUsesSameTargetType(
          source, bodySource, file, scope, target.getType());
        if (operandHasSameType === false && arithmeticHasSameContext === false) {
          continue;
        }

        const closingParen = source.getDirectTokens().find(token =>
          token.getStr() === ")" && token.getStart().isAfter(bodySource.getLastToken().getStart()));
        if (closingParen === undefined) {
          continue;
        }
        const preserveParentheses = bodySource.findDirectExpression(Expressions.ArithOperator) !== undefined
          || bodySource.findDirectTokenByText("&&") !== undefined;
        // Apply the later edit first so the original positions remain valid when
        // both parts of the CONV wrapper are changed on the same line.
        const fix = EditHelper.merge(
          EditHelper.replaceRange(
            file, bodySource.getLastToken().getEnd(), closingParen.getEnd(), preserveParentheses ? ")" : ""),
          EditHelper.replaceRange(
            file, source.getFirstToken().getStart(), bodySource.getFirstToken().getStart(), preserveParentheses ? "(" : ""));
        issues.push(Issue.atRange(
          file,
          source.getFirstToken().getStart(),
          closingParen.getEnd(),
          "Redundant CONV expression",
          this.getMetadata().key,
          this.conf.severity,
          fix));
      }
    }

    return issues;
  }

  private arithmeticUsesSameTargetType(
    conversion: ExpressionNode,
    bodySource: ExpressionNode,
    file: ABAPFile,
    scope: ISpaghettiScopeNode,
    conversionType: AbstractType): boolean {

    if (bodySource.findDirectExpression(Expressions.ArithOperator) === undefined) {
      return false;
    }

    const statement = file.getStatements().find(candidate => candidate.includesToken(conversion.getFirstToken()));
    if (!(statement?.get() instanceof Statements.Move)) {
      return false;
    }

    const targetToken = statement.findDirectExpression(Expressions.Target)?.getFirstToken();
    if (targetToken === undefined) {
      return false;
    }
    const assignmentTarget = scope.getData().references.find(reference =>
      reference.referenceType === ReferenceType.DataWriteReference
      && reference.position.getStart().equals(targetToken.getStart()))?.resolved;

    return assignmentTarget instanceof TypedIdentifier
      && this.sameType(conversionType, assignmentTarget.getType());
  }

  private sourceType(source: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    let context: AbstractType | undefined;

    for (const child of source.getChildren()) {
      if (!(child instanceof ExpressionNode)) {
        continue;
      } else if (child.get() instanceof Expressions.FieldChain) {
        context = this.fieldChainType(child, scope);
        if (context === undefined) {
          return undefined;
        }
      } else if (child.get() instanceof Expressions.Constant) {
        context = this.infer(context, ConstantSyntax.runSyntax(child));
      } else if (child.get() instanceof Expressions.Source) {
        context = this.infer(context, this.sourceType(child, scope));
      } else if (child.get() instanceof Expressions.ArithOperator) {
        if (child.concatTokens() === "**") {
          context = new FloatType();
        }
      } else {
        return undefined;
      }
    }

    if (source.findDirectTokenByText("&&")) {
      return StringType.get();
    }
    return context;
  }

  private fieldChainType(fieldChain: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    const operand = scope.getData().references.find(reference =>
      reference.referenceType === ReferenceType.DataReadReference
      && reference.position.getStart().equals(fieldChain.getFirstToken().getStart()))?.resolved;
    if (!(operand instanceof TypedIdentifier)) {
      return undefined;
    }

    let type: AbstractType | undefined = operand.getType();
    for (const child of fieldChain.getChildren()) {
      if (!(child instanceof ExpressionNode)
          || child.get() instanceof Expressions.SourceField) {
        continue;
      } else if (child.get() instanceof Expressions.ComponentName) {
        if (type instanceof TableType) {
          type = type.getRowType();
        }
        if (!(type instanceof StructureType)) {
          return undefined;
        }
        type = type.getComponentByName(child.concatTokens());
      } else {
        // Offsets, table expressions, attributes, and dereferences need more
        // context than the initial data reference provides.
        return undefined;
      }
    }
    return type;
  }

  private infer(context: AbstractType | undefined, found: AbstractType | undefined): AbstractType | undefined {
    if (context instanceof FloatType && found instanceof IntegerType) {
      return context;
    } else if (context instanceof IntegerType && found instanceof HexType) {
      return context;
    } else if ((context instanceof IntegerType || context instanceof FloatType) && found?.isGeneric()) {
      return context;
    }
    return found;
  }

  private sameType(first: AbstractType, second: AbstractType): boolean {
    if (first instanceof UnknownType
        || second instanceof UnknownType
        || first instanceof VoidType
        || second instanceof VoidType
        || first.isGeneric()
        || second.isGeneric()) {
      return false;
    }

    if (first.constructor !== second.constructor) {
      return false;
    }

    if (first instanceof StructureType || first instanceof TableType) {
      const firstName = first.getQualifiedName()?.toUpperCase();
      const secondName = second.getQualifiedName()?.toUpperCase();
      return firstName !== undefined && firstName === secondName;
    }

    return first.toABAP() === second.toABAP();
  }
}
