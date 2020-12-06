import {seqs, tok, star, Expression, optPrio, altPrios} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {ClassName, NewObject, ComponentName, FieldChain, MethodCall, Cast, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seqs(tok(InstanceArrow), AttributeName);
    const comp = seqs(tok(Dash), ComponentName);

    const fields = star(altPrios(attr, comp));

    const after = star(seqs(fields, tok(InstanceArrow), MethodCall));

    const localVariable = seqs(FieldChain, tok(InstanceArrow));
    const staticClass = seqs(ClassName, tok(StaticArrow));

    const ret = seqs(altPrios(seqs(optPrio(altPrios(localVariable, staticClass)), MethodCall),
                              NewObject,
                              Cast),
                     after);

    return ret;
  }
}