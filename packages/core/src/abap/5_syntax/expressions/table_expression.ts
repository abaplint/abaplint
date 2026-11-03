import {ExpressionNode} from "../../nodes";
import * as Expressions from "../../2_statements/expressions";
import {Source} from "./source";
import {SyntaxInput, syntaxIssue} from "../_syntax_input";
import {AbstractType} from "../../..";
import {TableType} from "../../types/basic";
import {ComponentChain} from "./component_chain";
import {AbstractToken} from "../../1_lexer/tokens/abstract_token";
import {LanguageVersion, Release, releaseAtLeast} from "../../../version";

export class TableExpression {
  /** below v750 the object component selector "->" cannot follow a table expression, eg. "itab[ 1 ]-ref->meth( )",
   *  returns true and adds an issue if not allowed */
  public static checkArrowAfter(input: SyntaxInput, arrow: AbstractToken): boolean {
    if (releaseAtLeast(input.scope.getRelease(), Release.v750)
        || input.scope.getLanguageVersion() === LanguageVersion.Cloud
        || input.scope.getOpenABAP()) {
      return false;
    }
    const message = "Object component selector \"->\" after table expression not possible below v750";
    input.issues.push(syntaxIssue(input, arrow, message));
    return true;
  }

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