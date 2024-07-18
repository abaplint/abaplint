import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode, StatementNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput} from "../_syntax_input";
import {Source} from "./source";

export class SQLSource {

  public runSyntax(node: ExpressionNode | StatementNode, input: SyntaxInput): AbstractType | undefined {
    for (const s of node.findAllExpressions(Expressions.Source)) {
      return new Source().runSyntax(s, input);
    }
    for (const s of node.findAllExpressions(Expressions.SimpleSource3)) {
      return new Source().runSyntax(s, input);
    }
    return undefined;
  }

}