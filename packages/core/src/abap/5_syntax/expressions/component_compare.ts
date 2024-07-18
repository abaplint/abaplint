import * as Expressions from "../../2_statements/expressions";
import {ExpressionNode} from "../../nodes";
import {AbstractType} from "../../types/basic/_abstract_type";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {ComponentChain} from "./component_chain";
import {Source} from "./source";

export class ComponentCompare {

  public runSyntax(node: ExpressionNode, input: SyntaxInput, type?: AbstractType): void {

    const chain = node.findDirectExpression(Expressions.ComponentChainSimple);
    if (chain === undefined) {
      const message = "ComponentCompare, chain not found";
      input.issues.push(syntaxIssue(input, node.getFirstToken(), message));
      return;
    }

    new ComponentChain().runSyntax(type, chain, input);

    for (const s of node.findDirectExpressions(Expressions.Source)) {
      new Source().runSyntax(s, input);
    }
  }

}