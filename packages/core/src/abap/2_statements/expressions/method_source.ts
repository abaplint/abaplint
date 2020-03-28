import {seq, alt, altPrio, opt, tok, Expression} from "../combi";
import {InstanceArrow, StaticArrow} from "../../1_lexer/tokens";
import {ClassName, MethodName, Dynamic, FieldChain, MethodCallChain} from ".";
import {IStatementRunnable} from "../statement_runnable";

export class MethodSource extends Expression {
  public getRunnable(): IStatementRunnable {
    const mname = alt(new MethodName(), new Dynamic());
    const cname = alt(new FieldChain(), new MethodCallChain(), new Dynamic());

    const stati = seq(new ClassName(), tok(StaticArrow));

    const part1 = seq(cname, alt(tok(InstanceArrow), tok(StaticArrow)));

    return seq(opt(altPrio(stati, part1)), mname);
  }
}