import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ABAPFile} from "../abap/abap_file";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {Constant as ConstantSyntax} from "../abap/5_syntax/expressions/constant";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {DataReference, EnumType, FloatType, HexType, IntegerType, StringType, StructureType, TableType, UnknownType, VoidType} from "../abap/types/basic";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata, RuleTag} from "./_irule";
import {IRegistry} from "../_iregistry";
import {EditHelper} from "../edit_helper";
import {Release, releaseAtLeast} from "../version";

export class RedundantConversionConf extends BasicRuleConfig {
  /** Also report a CONV that is the whole right-hand side of an assignment whose target already has the
   *  conversion type, e.g. "count = CONV i( text )." with count TYPE i, the assignment converts by itself */
  public assignmentTarget: boolean = true;
}

export class RedundantConversion implements IRule {
  private reg: IRegistry;
  private conf = new RedundantConversionConf();

  // built-in functions that always return a string, whatever their arguments
  private static readonly stringResult = new Set([
    "BOOLC", "CONCAT_LINES_OF", "CONDENSE", "ESCAPE", "FROM_MIXED", "INSERT", "REPEAT", "REPLACE",
    "REVERSE", "SEGMENT", "SHIFT_LEFT", "SHIFT_RIGHT", "SUBSTRING", "SUBSTRING_AFTER", "SUBSTRING_BEFORE",
    "SUBSTRING_FROM", "SUBSTRING_TO", "TO_LOWER", "TO_MIXED", "TO_UPPER", "TRANSLATE"]);
  // built-in functions that always return an i
  private static readonly integerResult = new Set([
    "CHARLEN", "COUNT", "COUNT_ANY_NOT_OF", "COUNT_ANY_OF", "DBMAXLEN", "DISTANCE", "FIND", "FIND_ANY_NOT_OF",
    "FIND_ANY_OF", "FIND_END", "LINES", "NUMOFCHAR", "STRLEN", "XSTRLEN"]);

  public getMetadata(): IRuleMetadata {
    return {
      key: "redundant_conversion",
      title: "Redundant Conversion",
      shortDescription: `Find redundant CONV expressions`,
      extendedInformation: `Reports CONV expressions whose operand already has the conversion's target type,
including the result of a built-in function with a fixed result type, like to_upper( ) or strlen( ).

With option assignmentTarget, also reports a CONV that is the whole right-hand side of an assignment
whose target already has the conversion's type, "count = CONV i( text )." with count TYPE i, the
assignment converts by itself. Not reported for inline declarations, enumerated types, LET, and operands
with a generic type.`,
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

      const sources = structure.findAllExpressionsRecursive(Expressions.Source);
      // Sources that are an operand of an enclosing Source, e.g. "2 * CONV i( a + b )" or "- CONV i( a + b )"
      const operands = new Set<ExpressionNode>();
      for (const source of sources) {
        if (source.getChildren().length > 1) {
          source.findDirectExpressions(Expressions.Source).forEach(operand => operands.add(operand));
        }
      }

      // recursive, a CONV can be the argument of a built-in function, which is itself a Source
      for (const source of sources) {
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
        const assignmentHasSameType = this.conf.assignmentTarget !== false
          && this.assignmentTargetHasSameType(source, file, scope, target.getType());
        if (operandHasSameType === false
            && arithmeticHasSameContext === false
            && assignmentHasSameType === false) {
          continue;
        }

        const closingParen = source.getDirectTokens().find(token =>
          token.getStr() === ")" && token.getStart().isAfter(bodySource.getLastToken().getStart()));
        if (closingParen === undefined) {
          continue;
        }
        // parentheses are only needed when the CONV takes part in a surrounding operation,
        // "CONV type ( body )" alone has 5 children, more means a trailing operator
        const partOfOperation = source.getChildren().length !== 5 || operands.has(source);
        const preserveParentheses = partOfOperation
          && (bodySource.findDirectExpression(Expressions.ArithOperator) !== undefined
          || bodySource.findDirectTokenByText("&&") !== undefined);
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

  /** "target = CONV i( text )." where target has the conversion type, the assignment converts the same way */
  private assignmentTargetHasSameType(
    conversion: ExpressionNode,
    file: ABAPFile,
    scope: ISpaghettiScopeNode,
    conversionType: AbstractType): boolean {

    // CONV converts the base type to an enumerated type, a plain assignment does not compile
    if (conversionType instanceof EnumType) {
      return false;
    }

    const body = conversion.findDirectExpression(Expressions.ConvBody);
    if (body === undefined
        || body.findDirectExpression(Expressions.Let) !== undefined
        // "CONV type ( body )" without a trailing operator
        || conversion.getChildren().length !== 5) {
      return false;
    }

    // "target = CONV ...", not "+=", "?=", "a = b = CONV ..." or MOVE
    const statement = file.getStatements().find(candidate => candidate.includesToken(conversion.getFirstToken()));
    const children = statement?.getChildren() ?? [];
    const target = children[0];
    if (!(statement?.get() instanceof Statements.Move)
        || children.length !== 4
        || !(target instanceof ExpressionNode)
        || !(target.get() instanceof Expressions.Target)
        || children[1].concatTokens() !== "="
        || children[2] !== conversion) {
      return false;
    }

    // a generic operand gets its type from the CONV, also "ref->*" with ref TYPE REF TO data
    const bodyStart = body.getFirstToken().getStart();
    const bodyEnd = body.getLastToken().getEnd();
    const genericOperand = scope.getData().references.some(reference => {
      if (reference.referenceType !== ReferenceType.DataReadReference
          || reference.position.getFilename() !== file.getFilename()
          || reference.position.getStart().isBetween(bodyStart, bodyEnd) === false
          || !(reference.resolved instanceof TypedIdentifier)) {
        return false;
      }
      const type = reference.resolved.getType();
      return type.isGeneric() || (type instanceof DataReference && type.getType().isGeneric());
    });
    if (genericOperand === true) {
      return false;
    }

    const targetType = this.targetType(target, scope);
    return targetType !== undefined && this.sameType(conversionType, targetType);
  }

  /** Type of a variable, field symbol, attribute or structure component, undefined for anything else */
  private targetType(target: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    let type: AbstractType | undefined;
    for (const child of target.getChildren()) {
      if (child instanceof TokenNode) {
        if (["-", "->", "=>"].includes(child.getFirstToken().getStr()) === false) {
          return undefined;
        }
      } else if (child.get() instanceof Expressions.TargetField
          || child.get() instanceof Expressions.TargetFieldSymbol
          || child.get() instanceof Expressions.AttributeName) {
        const resolved = scope.getData().references.find(reference =>
          (reference.referenceType === ReferenceType.DataWriteReference
          || reference.referenceType === ReferenceType.DataReadReference)
          && reference.position.getStart().equals(child.getFirstToken().getStart()))?.resolved;
        if (!(resolved instanceof TypedIdentifier)) {
          return undefined;
        }
        type = resolved.getType();
      } else if (child.get() instanceof Expressions.ComponentName) {
        if (type instanceof TableType) {
          type = type.getRowType();
        }
        if (!(type instanceof StructureType)) {
          return undefined;
        }
        type = type.getComponentByName(child.concatTokens());
      } else if (!(child.get() instanceof Expressions.ClassName)) {
        // inline declarations, dereferences, table expressions, offsets and lengths
        return undefined;
      }
    }
    return type;
  }

  private sourceType(source: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    let context: AbstractType | undefined;

    // boolc( <condition> ) is not a MethodCallChain, xsdbool( ) has the same shape but is not reported
    const first = source.getFirstToken();
    if (first.getStr().toUpperCase() === "BOOLC"
        && source.findDirectExpression(Expressions.Cond) !== undefined
        && source.getChildren().length === 4
        && scope.getData().references.some(reference =>
          reference.referenceType === ReferenceType.BuiltinMethodReference
          && reference.position.getStart().equals(first.getStart()))) {
      return StringType.get();
    }

    for (const child of source.getChildren()) {
      if (!(child instanceof ExpressionNode)) {
        continue;
      } else if (child.get() instanceof Expressions.FieldChain) {
        context = this.fieldChainType(child, scope);
        if (context === undefined) {
          return undefined;
        }
      } else if (child.get() instanceof Expressions.MethodCallChain) {
        if (source.getChildren().length !== 1) {
          return undefined;
        }
        context = this.builtinResultType(child, scope);
        if (context === undefined) {
          return undefined;
        }
      } else if (child.get() instanceof Expressions.Constant) {
        context = this.infer(context, ConstantSyntax.runSyntax(child));
      } else if (child.get() instanceof Expressions.StringTemplate) {
        context = StringType.get();
      } else if (child.get() instanceof Expressions.Source) {
        context = this.infer(context, this.sourceType(child, scope));
      } else if (child.get() instanceof Expressions.ArithOperator) {
        // the CONV sets the calculation type of arithmetic expressions, only redundant
        // if the assignment target has the same type, see arithmeticUsesSameTargetType
        return undefined;
      } else {
        return undefined;
      }
    }

    if (source.findDirectTokenByText("&&")) {
      return StringType.get();
    }
    return context;
  }

  /** The result type of a call to a built-in function whose result type does not depend on its arguments,
   *  undefined for anything else, e.g. abs( ) or xsdbool( ), or a method of the same name */
  private builtinResultType(chain: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    const children = chain.getChildren();
    if (children.length !== 1 || !(children[0].get() instanceof Expressions.MethodCall)) {
      return undefined;
    }
    const name = (children[0] as ExpressionNode).findDirectExpression(Expressions.MethodName)?.getFirstToken();
    if (name === undefined) {
      return undefined;
    }
    const isBuiltin = scope.getData().references.some(reference =>
      reference.referenceType === ReferenceType.BuiltinMethodReference
      && reference.position.getStart().equals(name.getStart()));
    if (isBuiltin === false) {
      return undefined;
    }

    const upper = name.getStr().toUpperCase();
    if (RedundantConversion.stringResult.has(upper)) {
      return StringType.get();
    } else if (RedundantConversion.integerResult.has(upper)) {
      return IntegerType.get();
    }
    return undefined;
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
