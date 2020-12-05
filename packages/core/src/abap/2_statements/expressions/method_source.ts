import {seqs, alt, optPrio, tok, Expression, starPrio} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, FieldChain, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alt(new MethodName(), new Dynamic());
    const cname = alt(new FieldChain(), new MethodCallChain(), new Dynamic());

    const stati = seqs(ClassName, tok(StaticArrow));

    const part1 = seqs(cname, alt(tok(InstanceArrow), tok(StaticArrow)));

    return seqs(optPrio(stati), starPrio(part1), mname);
  }
}