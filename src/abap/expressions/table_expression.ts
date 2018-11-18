import {seq, opt, tok, alt, plus, ver, str, Expression, IRunnable} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../tokens/";
import {Source, Field} from "./";
import {Version} from "../../version";
import {FieldChain} from "./field_chain";

export class TableExpression extends Expression {
  public getRunnable(): IRunnable {
    const fields = plus(seq(new FieldChain(), str("="), new Source()));
    const key = seq(str("KEY"), new Field());
    const ret = seq(tok(BracketLeftW),
                    alt(new Source(), seq(opt(key), opt(str("COMPONENTS")), fields)),
                    alt(tok(WBracketRight),
                        tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}