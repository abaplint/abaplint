import {Statement} from "./_statement";
import {verNot, str, seq, per, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetCursor extends Statement {

  public getMatcher(): IStatementRunnable {
    const line = seq(str("LINE"), new Source());
    const offset = seq(str("OFFSET"), new Source());
    const field = seq(str("FIELD"), new Source());
    const pos = seq(new Source(), new Source());
    const ret = seq(str("SET CURSOR"), per(pos, field, offset, line));
    return verNot(Version.Cloud, ret);
  }

}