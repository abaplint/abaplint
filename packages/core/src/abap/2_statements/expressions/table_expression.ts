import {seqs, opts, tok, alts, altPrios, pluss, vers, Expression} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = pluss(seqs(altPrios(ComponentChainSimple, Dynamic), "=", Source));
    const key = seqs("KEY", SimpleName);
    const index = seqs("INDEX", Source);
    const ret = seqs(tok(BracketLeftW),
                     alts(Source, seqs(opts(key), opts("COMPONENTS"), alts(fields, index))),
                     altPrios(tok(WBracketRight), tok(WBracketRightW)));
    return vers(Version.v740sp02, ret);
  }
}