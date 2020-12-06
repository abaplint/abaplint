import {seq, tok, stars, Expression, optPrios, altPrios} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {ClassName, NewObject, ComponentName, FieldChain, MethodCall, Cast, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seq(tok(InstanceArrow), AttributeName);
    const comp = seq(tok(Dash), ComponentName);

    const fields = stars(altPrios(attr, comp));

    const after = stars(seq(fields, tok(InstanceArrow), MethodCall));

    const localVariable = seq(FieldChain, tok(InstanceArrow));
    const staticClass = seq(ClassName, tok(StaticArrow));

    const ret = seq(altPrios(seq(optPrios(altPrios(localVariable, staticClass)), MethodCall),
                             NewObject,
                             Cast),
                    after);

    return ret;
  }
}