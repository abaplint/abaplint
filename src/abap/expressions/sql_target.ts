import {alt, seq, ver, tok, Expression, IRunnable} from "../combi";
import {Version} from "../../version";
import {WAt, At} from "../tokens/";
import {Target} from "./target";

export class SQLTarget extends Expression {
  public getRunnable(): IRunnable {
    let at = ver(Version.v740sp05, seq(alt(tok(WAt), tok(At)), new Target()));

    return alt(new Target(), at);
  }
}