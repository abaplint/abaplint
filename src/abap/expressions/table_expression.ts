import {seq, opt, tok, alt, plus, ver, str, Reuse, IRunnable} from "../combi";
import {BracketLeftW, WBracketRight, WBracketRightW} from "../tokens/";
import {Source, Field} from "./";
import {Version} from "../../version";

export class TableExpression extends Reuse {
  public get_runnable(): IRunnable {
    let fields = plus(seq(new Field(), str("="), new Source()));
    let key = seq(str("KEY"), new Field());
    let ret = seq(tok(BracketLeftW),
                  alt(new Source(), seq(opt(key), opt(str("COMPONENTS")), fields)),
                  alt(tok(WBracketRight),
                      tok(WBracketRightW)));
    return ver(Version.v740sp02, ret);
  }
}