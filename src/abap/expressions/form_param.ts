import {seq, altPrio, optPrio, regex as reg, Expression, IRunnable} from "../combi";
import {PassByValue, FormParamType} from "./";

export class FormParam extends Expression {
  public getRunnable(): IRunnable {
//    let fieldName = seq(reg(/^\w+$/), optPrio(seq(tok(Dash), reg(/^\w+$/))));
    let name = reg(/^[\w$]+$/);
//    let dashed = seq(reg(/^\w+$/), tok(Dash), reg(/^\w+$/));
    let field = seq(altPrio(new PassByValue(), name),
                    optPrio(new FormParamType));

    return field;
  }
}