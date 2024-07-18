import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {Source} from "./source";
import {MethodCallChain} from "./method_call_chain";
import {SourceFieldSymbol} from "./source_field_symbol";
import {SyntaxInput} from "../_syntax_input";

export class Compare {
  public runSyntax(node: ExpressionNode, input: SyntaxInput): void {

    for (const t of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(t, input);
    }

    for (const t of node.findDirectExpressions(Expressions.SourceFieldSymbol)) {
      new SourceFieldSymbol().runSyntax(t, input);
    }

    for (const t of node.findDirectExpressions(Expressions.MethodCallChain)) {
      new MethodCallChain().runSyntax(t, input);
    }

  }
}