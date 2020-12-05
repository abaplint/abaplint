import {seqs, opt, tok, alt, altPrio, plus, ver, str, Expression} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(seqs(altPrio(new ComponentChainSimple(), new Dynamic()), "=", Source));
    const key = seqs("KEY", SimpleName);
    const index = seqs("INDEX", Source);
    const ret = seqs(tok(BracketLeftW),
                     alt(new Source(), seqs(opt(key), opt(str("COMPONENTS")), alt(fields, index))),
                     altPrio(tok(WBracketRight), tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}