import {IStatement} from "./_statement";
import {verNot, str, alt, seqs} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetBlank implements IStatement {

  public getMatcher(): IStatementRunnable {
    const onOff = alt(str("ON"), str("OFF"));

    const ret = seqs("SET BLANK LINES", onOff);

    return verNot(Version.Cloud, ret);
  }

}