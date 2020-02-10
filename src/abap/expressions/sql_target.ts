import {alt, seq, ver, tok, Expression, IStatementRunnable} from "../combi";
import {Version} from "../../version";
import {WAt, At} from "../tokens/";
import {Target} from "./";

export class SQLTarget extends Expression {
  public getRunnable(): IStatementRunnable {
    const at = ver(Version.v740sp05, seq(alt(tok(WAt), tok(At)), new Target()));

    return alt(new Target(), at);
  }
}