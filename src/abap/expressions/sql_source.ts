import {alt, seq, ver, tok, Expression, IRunnable} from "../combi";
import {Version} from "../../version";
import {WAt} from "../tokens/";
import {Source} from "./source";

export class SQLSource extends Expression {
  public getRunnable(): IRunnable {
    let at = ver(Version.v740sp05, seq(tok(WAt), new Source()));

    return alt(new Source(), at);
  }
}