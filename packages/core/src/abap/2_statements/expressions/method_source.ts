import {seq, alts, optPrios, tok, Expression, starPrios} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, FieldChain, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alts(MethodName, Dynamic);
    const cname = alts(FieldChain, MethodCallChain, Dynamic);

    const stati = seq(ClassName, tok(StaticArrow));

    const part1 = seq(cname, alts(tok(InstanceArrow), tok(StaticArrow)));

    return seq(optPrios(stati), starPrios(part1), mname);
  }
}