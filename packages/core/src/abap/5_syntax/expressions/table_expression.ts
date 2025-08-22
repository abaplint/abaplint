import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput} from "../_syntax_input";
import {AbstractType} from "../../..";
import {TableType} from "../../types/basic";
import {ComponentChain} from "./component_chain";

export class TableExpression {
  public static runSyntax(node: ExpressionNode | undefined, input: SyntaxInput, rowType: AbstractType | undefined) {
    if (node === undefined) {
      return;
    }

    let context = rowType;
    if (context instanceof TableType) {
      context = context.getRowType();
    }

    if (node.getChildren().length === 3) {
      const s = node.findDirectExpression(Expressions.Source);
      Source.runSyntax(s, input, context);
    } else if (node.findDirectTokenByText("INDEX")) {
      const s = node.findDirectExpression(Expressions.Source);
      Source.runSyntax(s, input);
    } else {
      let fieldType: AbstractType | undefined = undefined;
      for (const c of node.getChildren()) {
        if (c instanceof ExpressionNode && c.get() instanceof Expressions.ComponentChainSimple) {
          fieldType = ComponentChain.runSyntax(context, c, input);
        } else if (c instanceof ExpressionNode && c.get() instanceof Expressions.Source) {
          Source.runSyntax(c, input, fieldType);
        }
      }
    }
  }
}