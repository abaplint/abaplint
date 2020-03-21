import {IStatement} from "./_statement";
import {verNot, str, seq, per, altPrio} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetCursor implements IStatement {

  public getMatcher(): IStatementRunnable {
    const line = seq(str("LINE"), new Source());
    const offset = seq(str("OFFSET"), new Source());
    const field = seq(str("FIELD"), new Source());
    const pos = seq(new Source(), new Source());
    const ret = seq(str("SET CURSOR"), altPrio(per(field, offset, line), pos));
    return verNot(Version.Cloud, ret);
  }

}