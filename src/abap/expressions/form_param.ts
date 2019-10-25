import {seq, altPrio, optPrio, regex as reg, Expression, IStatementRunnable} from "../combi";
import {PassByValue, FormParamType} from "./";
import {ExpressionNode} from "../nodes";
import {Scope} from "../syntax/_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {UnknownType} from "../types/basic";

export class FormParam extends Expression {
  public getRunnable(): IStatementRunnable {
    const name = reg(/^[\w$]+$/);
    const field = seq(altPrio(new PassByValue(), name),
                      optPrio(new FormParamType()));

    return field;
  }

  public runSyntax(node: ExpressionNode, _scope: Scope, filename: string): TypedIdentifier {
    return new TypedIdentifier(node.getFirstToken(), filename, new UnknownType());
  }

}