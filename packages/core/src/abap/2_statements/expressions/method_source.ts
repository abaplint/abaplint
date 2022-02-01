import {seq, alt, tok, Expression, starPrio} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, FieldChain, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alt(MethodName, Dynamic);
    const cname = alt(FieldChain, MethodCallChain, Dynamic);

    // this is a bit tricky, this part is required as FieldChain takes a AttributeName
    const stati = seq(ClassName, tok(StaticArrow), MethodName);

    const part1 = seq(cname, alt(tok(InstanceArrow), tok(StaticArrow)));

    return alt(stati, seq(starPrio(part1), mname));
  }
}