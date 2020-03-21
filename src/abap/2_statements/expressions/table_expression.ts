import {seq, opt, tok, alt, plus, ver, str, Expression, IStatementRunnable} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../../1_lexer/tokens";
import {Dynamic, Source, SimpleName, ComponentChainSimple} from ".";
import {Version} from "../../../version";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(seq(alt(new ComponentChainSimple(), new Dynamic()), str("="), new Source()));
    const key = seq(str("KEY"), new SimpleName());
    const index = seq(str("INDEX"), new Source());
    const ret = seq(tok(BracketLeftW),
                    alt(new Source(), seq(opt(key), opt(str("COMPONENTS")), alt(fields, index))),
                    alt(tok(WBracketRight), tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}