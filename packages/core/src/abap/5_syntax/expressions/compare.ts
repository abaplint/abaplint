import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, TokenNode} from "../../nodes";
import {Source} from "./source";
import {MethodCallChain} from "./method_call_chain";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {CharacterType, DateType, IntegerType, StringType} from "../../types/basic";
import {TypeUtils} from "../_type_utils";
import {BuiltIn} from "../_builtin";
import {BuiltInCall} from "../_builtin_call";

export class Compare {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    const sources = node.findDirectExpressions(Expressions.Source);

    // before the operands are checked, Source reports a predicate function operand in more general terms
    const initialMessage = this.checkInitialOperand(node, input);
    if (initialMessage !== undefined) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), initialMessage));
      return;
    }

    const predicateMessage = this.checkPredicateOperand(sources, input);
    if (predicateMessage !== undefined) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), predicateMessage));
      return;
    }

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
    for (const source of sources) {
      const name = this.builtinCallName(source, input);
      if (BuiltIn.isPredicate(name) === true) {
        return `Predicate function "${name}" cannot be the operand of a comparison`;
      }
    }
    return undefined;
  }

  // the name of the built-in function when the source is exactly one call of it, not hidden by a method of the same name
  private static builtinCallName(source: ExpressionNode | undefined, input: SyntaxInput): string | undefined {
    const call = BuiltInCall.fromSource(source, input);
    return call === undefined ? undefined : BuiltInCall.callName(call);
  }

}
