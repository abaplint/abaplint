import * as Expressions from "../abap/2_statements/expressions";
import * as Statements from "../abap/2_statements/statements";
import {ReferenceType} from "../abap/5_syntax/_reference";
import {ISpaghettiScopeNode} from "../abap/5_syntax/_spaghetti_scope";
import {Constant as ConstantSyntax} from "../abap/5_syntax/expressions/constant";
import {SyntaxLogic} from "../abap/5_syntax/syntax";
import {ExpressionNode, TokenNode} from "../abap/nodes";
import {MethodDefinition} from "../abap/types";
import {TypedIdentifier} from "../abap/types/_typed_identifier";
import {AbstractType} from "../abap/types/basic/_abstract_type";
import {Integer8Type, IntegerType, PackedType, StructureType, TableType} from "../abap/types/basic";
import {Issue} from "../issue";
import {ABAPObject} from "../objects/_abap_object";
import {IObject} from "../objects/_iobject";
import {BasicRuleConfig} from "./_basic_rule_config";
import {IRule, IRuleMetadata} from "./_irule";
import {IRegistry} from "../_iregistry";

export class InlinePackedComputationConf extends BasicRuleConfig {
}

export class InlinePackedComputation implements IRule {
  private reg: IRegistry;
  private conf = new InlinePackedComputationConf();

  public getMetadata(): IRuleMetadata {
    return {
      key: "inline_packed_computation",
      title: "Inline declaration from a packed computation",
      shortDescription: `Finds inline declarations whose value is an arithmetic expression with calculation type p`,
      extendedInformation: `The result of a computation with calculation type p has no length and number of decimals
that a declaration could take over, so DATA( ) or FINAL( ) gets the type p LENGTH 8 DECIMALS 0 and the
syntax check warns "For the result of a computation with type P, the type P(8,0) is used here implicitly".
Decimals of the operands are lost, and so are digits beyond the length.

Reported when at least one operand is packed and all other operands are of type i, int8 or p, also with
brackets around the whole expression. VALUE, CONV and EXACT operands count with their type, VALUE # only with
a single operand, "VALUE #( itab[ 1 ]-comp OPTIONAL )". Operands of other types, generic or unknown types,
other constructor expressions like COND and SWITCH, and the operator ** are not reported.

Declare the variable with the operands' type, or name the type with CONV.`,
      tags: [],
      badExample: `DATA a TYPE p LENGTH 8 DECIMALS 2.
DATA b TYPE p LENGTH 8 DECIMALS 2.
DATA(diff) = a - b.`,
      goodExample: `DATA a TYPE p LENGTH 8 DECIMALS 2.
DATA b TYPE p LENGTH 8 DECIMALS 2.
DATA diff LIKE a.
diff = a - b.`,
    };
  }

  public getConfig() {
    return this.conf;
  }

  public setConfig(conf: InlinePackedComputationConf) {
    this.conf = conf;
  }

  public initialize(reg: IRegistry) {
    this.reg = reg;
    return this;
  }

  public run(obj: IObject): readonly Issue[] {
    if (!(obj instanceof ABAPObject)) {
      return [];
    }

    const syntax = new SyntaxLogic(this.reg, obj).run();
    if (syntax.issues.length > 0) {
      return [];
    }

    const issues: Issue[] = [];
    for (const file of obj.getABAPFiles()) {
      for (const statement of file.getStatements()) {
        if (!(statement.get() instanceof Statements.Move)) {
          continue;
        }
        const inline = statement.findDirectExpression(Expressions.Target)?.findDirectExpression(Expressions.InlineData);
        const name = inline?.findDirectExpression(Expressions.TargetField)?.getFirstToken();
        const source = this.unwrapBrackets(statement.findDirectExpression(Expressions.Source));
        if (name === undefined
            || source === undefined
            || source.findDirectExpression(Expressions.ArithOperator) === undefined) {
          continue;
        }

        const scope = syntax.spaghetti.lookupPosition(name.getStart(), file.getFilename());
        if (scope === undefined) {
          continue;
        }

        const operands = this.operandTypes(source, scope);
        if (operands === undefined || operands.some(t => t instanceof PackedType) === false) {
          continue;
        }

        const message = `"${name.getStr()}" gets type p LENGTH 8 DECIMALS 0 from this packed computation, ` +
          `declare it with the operands' type or use CONV`;
        issues.push(Issue.atToken(file, name, message, this.getMetadata().key, this.conf.severity));
      }
    }

    return issues;
  }

  /** "( a + b )" around the whole right-hand side, the brackets do not change the calculation */
  private unwrapBrackets(source: ExpressionNode | undefined): ExpressionNode | undefined {
    while (source !== undefined) {
      const children = source.getChildren();
      if (children.length !== 3
          || children[0].getFirstToken().getStr() !== "("
          || !(children[1] instanceof ExpressionNode)
          || !(children[1].get() instanceof Expressions.Source)
          || children[2].getFirstToken().getStr() !== ")") {
        break;
      }
      source = children[1];
    }
    return source;
  }

  /** The types of the operands of an arithmetic expression, undefined when an operand is not of type
   *  i, int8 or p, or is not known */
  private operandTypes(source: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType[] | undefined {
    const ret: AbstractType[] = [];

    let children = source.getChildren();
    const first = children[0];
    if (first instanceof TokenNode && ["VALUE", "CONV", "EXACT"].includes(first.getFirstToken().getStr().toUpperCase())) {
      // a constructor operand, followed by the rest of the chain after its closing parenthesis
      const close = children.findIndex((child, index) => index > 2 && child instanceof TokenNode);
      const found = this.constructorType(source, scope);
      if (close < 0 || found === undefined || this.isCalculationOperand(found) === false) {
        return undefined;
      }
      ret.push(found);
      children = children.slice(close + 1);
    }

    for (const child of children) {
      let found: AbstractType | undefined = undefined;
      if (child instanceof TokenNode) {
        // parentheses and a sign, anything else is a constructor expression or a string operator
        if (["(", ")", "+", "-"].includes(child.getFirstToken().getStr()) === false) {
          return undefined;
        }
        continue;
      } else if (child.get() instanceof Expressions.ArithOperator) {
        if (["+", "-", "*", "/", "DIV", "MOD"].includes(child.concatTokens().toUpperCase()) === false) {
          return undefined;
        }
        continue;
      } else if (child.get() instanceof Expressions.Source) {
        const nested = this.operandTypes(child, scope);
        if (nested === undefined) {
          return undefined;
        }
        ret.push(...nested);
        continue;
      } else if (child.get() instanceof Expressions.FieldChain) {
        found = this.fieldChainType(child, scope);
      } else if (child.get() instanceof Expressions.MethodCallChain) {
        found = this.methodCallType(child, scope);
      } else if (child.get() instanceof Expressions.Constant) {
        found = ConstantSyntax.runSyntax(child);
      }

      if (found === undefined || this.isCalculationOperand(found) === false) {
        return undefined;
      }
      ret.push(found);
    }

    return ret;
  }

  private isCalculationOperand(type: AbstractType): boolean {
    return type.isGeneric() === false
      && (type instanceof PackedType || type instanceof IntegerType || type instanceof Integer8Type);
  }

  /** The type of VALUE, CONV or EXACT as the syntax check inferred it, with # only VALUE with a single
   *  operand in the body, "VALUE #( itab[ 1 ]-comp OPTIONAL )" */
  private constructorType(source: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    const typeName = source.findDirectExpression(Expressions.TypeNameOrInfer);
    if (typeName === undefined) {
      return undefined;
    }

    if (typeName.concatTokens() === "#") {
      // with DEFAULT the syntax check takes the type of the default value
      const body = source.findDirectExpression(Expressions.ValueBody);
      const children = body?.getChildren() || [];
      if (children.length === 0
          || children.length > 2
          || !(children[0].get() instanceof Expressions.Source)
          || (children.length === 2 && children[1].concatTokens().toUpperCase() !== "OPTIONAL")) {
        return undefined;
      }
    }

    const inferred = scope.getData().references.find(reference =>
      reference.referenceType === ReferenceType.InferredType
      && reference.position.getStart().equals(typeName.getFirstToken().getStart()))?.resolved;
    if (!(inferred instanceof TypedIdentifier)) {
      return undefined;
    }
    return inferred.getType();
  }

  private methodCallType(chain: ExpressionNode, scope: ISpaghettiScopeNode): AbstractType | undefined {
    const last = chain.getLastChild();
    if (!(last instanceof ExpressionNode) || !(last.get() instanceof Expressions.MethodCall)) {
      return undefined;
    }
    const name = last.findDirectExpression(Expressions.MethodName)?.getFirstToken();
    if (name === undefined) {
      return undefined;
    }
    const method = scope.getData().references.find(reference =>
      reference.referenceType === ReferenceType.MethodReference
      && reference.position.getStart().equals(name.getStart()))?.resolved;
    if (!(method instanceof MethodDefinition)) {
      return undefined;
    }
    return method.getParameters().getReturning()?.getType();
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
        return undefined;
      }
    }
    return type;
  }

}
