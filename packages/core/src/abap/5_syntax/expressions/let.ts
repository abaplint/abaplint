import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {InlineFieldDefinition} from "./inline_field_definition";
import {ScopeType} from "../_scope_type";
import {SyntaxInput} from "../_syntax_input";

export class Let {
  public static runSyntax(node: ExpressionNode | undefined, input: SyntaxInput, skipScope = false): boolean {
    if (node === undefined) {
      return false;
    }

    if (skipScope !== true) {
      input.scope.push(ScopeType.Let, "LET", node.getFirstToken().getStart(), input.filename);
    }

    for (const f of node.findDirectExpressions(Expressions.InlineFieldDefinition)) {
      InlineFieldDefinition.runSyntax(f, input);
    }

    return true;
  }
}