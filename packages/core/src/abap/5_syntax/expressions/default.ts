import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {Constant} from "./constant";
import {SyntaxInput} from "../_syntax_input";

export class Default {
  public static runSyntax(node: ExpressionNode, input: SyntaxInput) {

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      return FieldChain.runSyntax(chain, input, ReferenceType.DataReadReference);
    }

    const constant = node.findDirectExpression(Expressions.Constant);
    if (constant) {
      return Constant.runSyntax(constant);
    }

    return undefined;
  }
}