import {seq, altPrio, optPrio, Expression, IStatementRunnable} from "../combi";
import {PassByValue, FormParamType, Field} from "./";
import {ExpressionNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(altPrio(new PassByValue(), new Field()),
                      optPrio(new FormParamType()));

    return field;
  }

  public runSyntax(node: ExpressionNode, _scope: CurrentScope, filename: string): TypedIdentifier {
    const token = node.findFirstExpression(Field)!.getFirstToken();
    return new TypedIdentifier(token, filename, new UnknownType("FormParam, todo"));
  }

}