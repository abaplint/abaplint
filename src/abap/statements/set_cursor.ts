import {Statement} from "./_statement";
import {verNot, str, seq, per, opt, altPrio, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const line = seq(str("LINE"), new Source());
    const offset = seq(str("OFFSET"), new Source());
    const field = seq(str("FIELD"), new Source());
    const pos = seq(new Source(), new Source());
    const ret = seq(str("SET CURSOR"), altPrio(seq(field, opt(per(offset, line))), pos));
    return verNot(Version.Cloud, ret);
  }

}