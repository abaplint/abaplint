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
import {ObjectOriented} from "../_object_oriented";

export class Compare {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    const sourceTypes: (AbstractType | undefined)[] = [];
    const sources = node.findDirectExpressions(Expressions.Source);
    for (const t of sources) {
      sourceTypes.push(Source.runSyntax(t, input));
    }

    for (const t of node.findDirectExpressions(Expressions.SourceFieldSymbolChain)) {
      SourceFieldSymbol.runSyntax(t, input);
    }

    for (const t of node.findDirectExpressions(Expressions.MethodCallChain)) {
      MethodCallChain.runSyntax(t, input);
    }

    const initialMessage = this.checkInitialOperand(node, input);
    if (initialMessage !== undefined) {
      input.issues.push(syntaxIssue(input, node.getFirstToken(), initialMessage));
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
    if (chain?.length !== 1 || !(chain[0] instanceof ExpressionNode) || !(chain[0].get() instanceof Expressions.MethodCallChain)) {
      return undefined;
    }
    const calls = chain[0].getChildren();
    if (calls.length !== 1 || !(calls[0] instanceof ExpressionNode) || !(calls[0].get() instanceof Expressions.MethodCall)) {
      return undefined;
    }
    const name = calls[0].findDirectExpression(Expressions.MethodName)?.concatTokens();
    const builtin = BuiltIn.searchBuiltin(name);
    if (name === undefined || builtin === undefined) {
      return undefined;
    }
    // a method of the same name hides the built-in function
    const enclosing = input.scope.findClassDefinition(input.scope.getEnclosingClassName());
    if (enclosing !== undefined && new ObjectOriented(input.scope).searchMethodName(enclosing, name).method !== undefined) {
      return undefined;
    }
    const returning = builtin.getParameters().getReturning()?.getType();
    if (returning instanceof StringType || returning instanceof CharacterType) {
      return `Built-in function "${name}" cannot be the operand of IS INITIAL`;
    }
    return undefined;
  }

}
