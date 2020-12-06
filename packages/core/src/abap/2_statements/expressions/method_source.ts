import {seq, alt, optPrio, tok, Expression, starPrio} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, FieldChain, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alt(MethodName, Dynamic);
    const cname = alt(FieldChain, MethodCallChain, Dynamic);

    const stati = seq(ClassName, tok(StaticArrow));

    const part1 = seq(cname, alt(tok(InstanceArrow), tok(StaticArrow)));

    return seq(optPrio(stati), starPrio(part1), mname);
  }
}