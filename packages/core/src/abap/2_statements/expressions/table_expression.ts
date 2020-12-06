import {seqs, opt, tok, alts, altPrios, plus, ver, str, Expression} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(seqs(altPrios(ComponentChainSimple, Dynamic), "=", Source));
    const key = seqs("KEY", SimpleName);
    const index = seqs("INDEX", Source);
    const ret = seqs(tok(BracketLeftW),
                     alts(Source, seqs(opt(key), opt(str("COMPONENTS")), alts(fields, index))),
                     altPrios(tok(WBracketRight), tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}