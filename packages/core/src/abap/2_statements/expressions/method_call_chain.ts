import {seqs, tok, star, Expression, optPrio, altPrio} from "../combi";
import {InstanceArrow, StaticArrow, Dash} from "../../1_lexer/tokens";
import {ClassName, NewObject, ComponentName, FieldChain, MethodCall, Cast, AttributeName} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodCallChain extends Expression {
  public getRunnable(): IStatementRunnable {
    const attr = seqs(tok(InstanceArrow), AttributeName);
    const comp = seqs(tok(Dash), ComponentName);

    const fields = star(altPrio(attr, comp));

    const after = star(seqs(fields, tok(InstanceArrow), MethodCall));

    const localVariable = seqs(FieldChain, tok(InstanceArrow));
    const staticClass = seqs(ClassName, tok(StaticArrow));

    const ret = seqs(altPrio(seqs(optPrio(altPrio(localVariable, staticClass)), MethodCall),
                             new NewObject(),
                             new Cast()),
                     after);

    return ret;
  }
}