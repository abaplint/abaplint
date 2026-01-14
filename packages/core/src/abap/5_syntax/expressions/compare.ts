import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Source} from "./source";
import {MethodCallChain} from "./method_call_chain";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../types/basic/_abstract_type";
import {TypeUtils} from "../_type_utils";

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

    if (node.findDirectExpression(Expressions.CompareOperator)
        && new TypeUtils(input.scope).isCompareable(sourceTypes[0], sourceTypes[1], sources[0], sources[1]) === false
        && sourceTypes.length === 2) {
      const message = "Incompatible types for comparison";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
    }
  }
}