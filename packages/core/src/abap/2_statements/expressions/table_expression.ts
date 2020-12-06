import {seq, opts, tok, alt, altPrios, pluss, vers, Expression} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = pluss(seq(altPrios(ComponentChainSimple, Dynamic), "=", Source));
    const key = seq("KEY", SimpleName);
    const index = seq("INDEX", Source);
    const ret = seq(tok(BracketLeftW),
                    alt(Source, seq(opts(key), opts("COMPONENTS"), alt(fields, index))),
                    altPrios(tok(WBracketRight), tok(WBracketRightW)));
    return vers(Version.v740sp02, ret);
  }
}