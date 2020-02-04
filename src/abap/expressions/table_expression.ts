import {seq, opt, tok, alt, plus, ver, str, Expression, IStatementRunnable} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../tokens/";
import {Source, SimpleName, ComponentChainSimple} from "./";
import {Version} from "../../version";

export class TableExpression extends Expression {
  public getRunnable(): IStatementRunnable {
    const fields = plus(seq(new ComponentChainSimple(), str("="), new Source()));
    const key = seq(str("KEY"), new SimpleName());
    const index = seq(str("INDEX"), new Source());
    const ret = seq(tok(BracketLeftW),
                    alt(new Source(), seq(opt(key), opt(str("COMPONENTS")), alt(fields, index))),
                    alt(tok(WBracketRight),
                        tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}