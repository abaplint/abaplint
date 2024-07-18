import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {FieldChain} from "./field_chain";
import {ReferenceType} from "../_reference";
import {Constant} from "./constant";
import {SyntaxInput} from "../_syntax_input";

export class Default {
  public runSyntax(node: ExpressionNode, input: SyntaxInput) {

    const chain = node.findDirectExpression(Expressions.FieldChain);
    if (chain) {
      return new FieldChain().runSyntax(chain, input, ReferenceType.DataReadReference);
    }

    const constant = node.findDirectExpression(Expressions.Constant);
    if (constant) {
      return new Constant().runSyntax(constant);
    }

    return undefined;
  }
}