import {Expression, seq, plus, altPrio, tok, ver, alt} from "../combi";
import {SimpleTarget, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {WDash, WPlus} from "../../1_lexer/tokens";
import {Version} from "../../../version";

export class ReduceNext extends Expression {
  public getRunnable(): IStatementRunnable {
    const calcAssign = ver(Version.v754,
                           alt(seq(tok(WPlus), "="),
                               seq(tok(WDash), "="),
                               "/=",
                               "*=",
                               "&&="));

    const fields = seq(SimpleTarget, altPrio("=", calcAssign), Source);
    return seq("NEXT", plus(fields));
  }
}