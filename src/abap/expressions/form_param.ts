import {seq, altPrio, optPrio, Expression, IStatementRunnable} from "../combi";
import {PassByValue, FormParamType, Field} from "./";
import {ExpressionNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const field = seq(altPrio(new PassByValue(), new Field()),
                      optPrio(new FormParamType()));

    return field;
  }

  public runSyntax(node: ExpressionNode, _scope: Scope, filename: string): TypedIdentifier {
    const token = node.findFirstExpression(Field)!.getFirstToken();
    return new TypedIdentifier(token, filename, new UnknownType("FormParam, todo"));
  }

}