import {seq, opt, tok, alt, altPrio, plus, ver, str, Expression} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(seq(altPrio(new ComponentChainSimple(), new Dynamic()), str("="), new Source()));
    const key = seq(str("KEY"), new SimpleName());
    const index = seq(str("INDEX"), new Source());
    const ret = seq(tok(BracketLeftW),
                    alt(new Source(), seq(opt(key), opt(str("COMPONENTS")), alt(fields, index))),
                    altPrio(tok(WBracketRight), tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}