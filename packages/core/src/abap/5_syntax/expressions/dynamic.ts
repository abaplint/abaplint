import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {SyntaxInput} from "../_syntax_input";

export class Dynamic {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput) {

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      FieldChain.runSyntax(chain, input, ReferenceType.DataReadReference);
    }

  }
}