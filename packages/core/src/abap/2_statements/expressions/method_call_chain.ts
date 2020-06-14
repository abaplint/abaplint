import {seq, tok, star, alt, Expression, optPrio, altPrio} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {ClassName, NewObject, ComponentName, FieldChain, MethodCall, Cast, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), new AttributeName());
    const comp = seq(tok(Dash), new ComponentName());

    const fields = star(alt(attr, comp));

    const after = star(seq(fields, tok(InstanceArrow), new MethodCall()));

    const localVariable = seq(new FieldChain(), tok(InstanceArrow));
    const staticClass = seq(new ClassName(), tok(StaticArrow));

    const ret = seq(alt(seq(optPrio(altPrio(localVariable, staticClass)), new MethodCall()),
                        new NewObject(),
                        new Cast()),
                    after);

    return ret;
  }
}