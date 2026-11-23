import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../nodes";
import {Source} from "./source";
import {MethodCallChain} from "./method_call_chain";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CGenericType, CharacterType, CLikeType, CSequenceType, DateType, HexType, IntegerType, NGenericType, NumericType,
  StringType, StructureType, TimeType, XGenericType, XSequenceType, XStringType} from "../../types/basic";
import {TypeUtils} from "../_type_utils";
import {BuiltIn} from "../_builtin";
import {BuiltInCall} from "../_builtin_call";

export class Compare {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    const sources = node.findDirectExpressions(Expressions.Source);

    // reported before the operands are checked, which then skip the more general predicate function message
    const initialMessage = this.checkInitialOperand(node, input);
    const predicateMessage = this.checkPredicateOperand(sources, input);
    const operandMessage = initialMessage ?? predicateMessage;
    if (operandMessage !== undefined) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), operandMessage));
    }

    // the operands are always checked, for their own errors and references
    const sourceTypes: (AbstractType | undefined)[] = [];
    for (const t of sources) {
      sourceTypes.push(Source.runSyntax(t, input));
    }

    for (const t of node.findDirectExpressions(Expressions.SourceFieldSymbolChain)) {
      SourceFieldSymbol.runSyntax(t, input);
    }

    for (const t of node.findDirectExpressions(Expressions.MethodCallChain)) {
      MethodCallChain.runSyntax(t, input);
    }

    if (operandMessage !== undefined) {
      return;
    }

    const arithmeticMessage = this.checkArithmeticOperands(node, sources, sourceTypes);
    if (arithmeticMessage !== undefined) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), arithmeticMessage));
      return;
    }

    const typeUtils = new TypeUtils(input.scope);
    const compareOperator = node.findDirectExpression(Expressions.CompareOperator)?.concatTokens().toUpperCase();

    if (compareOperator === "CS"
        && sourceTypes.length === 2
        && sourceTypes.some((type) => typeUtils.isCharLikeForCompare(type) === false)) {
      const message = "CS operands must be character-like (data type C, N, D, T, or STRING)";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    } else if (node.findDirectExpression(Expressions.CompareOperator)
        && typeUtils.isCompareable(sourceTypes[0], sourceTypes[1], sources[0], sources[1]) === false
        && sourceTypes.length === 2) {
      let message = "Incompatible types for comparison";
      if ((sourceTypes[0] instanceof DateType
          && sourceTypes[1] instanceof IntegerType
          && sources[1].findFirstExpression(Expressions.ArithOperator))
          || (sourceTypes[1] instanceof DateType
          && sourceTypes[0] instanceof IntegerType
          && sources[0].findFirstExpression(Expressions.ArithOperator))) {
        message = "Date cannot be compared with arithmetic result of type Integer";
      }
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }
  }

  // a built-in function with a character-like result cannot be the operand of IS [NOT] INITIAL,
  // "Unexpected operator IS" on a system, while one with a numeric result, lines( ), can
  private static checkInitialOperand(node: ExpressionNode, input: SyntaxInput): string | undefined {
    if (input.scope.getOpenABAP()) {
      return undefined;
    }
    const tokens = node.getChildren().filter(c => c instanceof TokenNode).map(c => c.getFirstToken().getStr().toUpperCase());
    if (tokens.includes("IS") === false || tokens[tokens.length - 1] !== "INITIAL") {
      return undefined;
    }
    const chain = node.findDirectExpression(Expressions.Source)?.getChildren();
    // xsdbool( ) and boolc( ) are their own form in the Source grammar, a condition in parentheses
    const first = chain?.[0]?.getFirstToken().getStr().toUpperCase();
    if (chain?.length === 4 && chain[0] instanceof TokenNode && (first === "XSDBOOL" || first === "BOOLC")) {
      return `Built-in function "${chain[0].getFirstToken().getStr()}" cannot be the operand of IS INITIAL`;
    }
    const name = this.builtinCallName(node.findDirectExpression(Expressions.Source), input);
    const returning = BuiltIn.searchBuiltin(name)?.getParameters().getReturning()?.getType();
    if (returning instanceof StringType || returning instanceof CharacterType) {
      return `Built-in function "${name}" cannot be the operand of IS INITIAL`;
    }
    return undefined;
  }

  // a predicate function, contains( ) or line_exists( ), is a relational expression and not a value,
  // it can stand alone as a condition or inside boolc( ) or xsdbool( ), but cannot be an operand of a comparison
  private static checkPredicateOperand(sources: readonly ExpressionNode[], input: SyntaxInput): string | undefined {
    if (input.scope.getOpenABAP()) {
      return undefined;
    }
    let message: string | undefined = undefined;
    for (const source of sources) {
      const name = this.builtinCallName(source, input);
      if (BuiltIn.isPredicate(name) === true) {
        Source.predicateReported(source);
        message = message ?? `Predicate function "${name}" cannot be the operand of a comparison`;
      }
    }
    return message;
  }

  // the name of the built-in function when the source is exactly one call of it, not hidden by a method of the same name
  private static builtinCallName(source: ExpressionNode | undefined, input: SyntaxInput): string | undefined {
    const call = BuiltInCall.fromSource(source, input);
    return call === undefined ? undefined : BuiltInCall.callName(call);
  }

  // an arithmetic expression can only be compared with a numeric operand or another arithmetic expression,
  // a character-like, byte-like, date, time or structured operand is expected to be a syntax error,
  // the operand can be made an arithmetic expression with a "+" in front, "+ lv_c"
  private static checkArithmeticOperands(node: ExpressionNode, sources: readonly ExpressionNode[],
                                         types: readonly (AbstractType | undefined)[]): string | undefined {
    let pairs: [number, number][] = [];
    if (node.findDirectExpression(Expressions.CompareOperator) !== undefined && sources.length === 2) {
      pairs = [[0, 1]];
    } else if (node.findDirectTokenByText("BETWEEN") !== undefined && sources.length === 3) {
      pairs = [[0, 1], [0, 2]];
    }

    for (const [a, b] of pairs) {
      for (const [arith, other] of [[a, b], [b, a]]) {
        if (this.isArithmetic(sources[arith]) === true
            && this.isArithmetic(sources[other]) === false
            && this.isNonNumeric(types[other]) === true) {
          const operand = sources[other].concatTokens();
          return `Arithmetic expression cannot be compared with non-numeric operand "${operand}", use "+ ${operand}"`;
        }
      }
    }
    return undefined;
  }

  // "a + b", "- a", "( a * b )", but not "( a )", "a && b" or "a BIT-AND b"
  private static isArithmetic(source: ExpressionNode): boolean {
    const children = source.getChildren();
    const first = children[0];
    if (first instanceof TokenNode) {
      const str = first.getFirstToken().getStr();
      if (str === "+" || str === "-") {
        return true;
      } else if (str === "(" && children.length === 3 && children[1] instanceof ExpressionNode) {
        return this.isArithmetic(children[1]);
      }
    }
    for (const child of children) {
      if (child instanceof ExpressionNode
          && child.get() instanceof Expressions.ArithOperator
          && child.concatTokens().toUpperCase().startsWith("BIT-") === false) {
        return true;
      }
    }
    return false;
  }

  private static isNonNumeric(type: AbstractType | undefined): boolean {
    return type instanceof CharacterType
      || type instanceof StringType
      || type instanceof NumericType
      || type instanceof DateType
      || type instanceof TimeType
      || type instanceof HexType
      || type instanceof XStringType
      || type instanceof StructureType
      || type instanceof CLikeType
      || type instanceof CSequenceType
      || type instanceof CGenericType
      || type instanceof NGenericType
      || type instanceof XSequenceType
      || type instanceof XGenericType;
  }

}
