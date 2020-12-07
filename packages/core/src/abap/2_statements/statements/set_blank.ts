import {IStatement} from "./_statement";
import {verNot, alt, seq} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class SetBlank implements IStatement {

  public getMatcher(): IStatementRunnable {
    const onOff = alt("ON", "OFF");

    const ret = seq("SET BLANK LINES", onOff);

    return verNot(Version.Cloud, ret);
  }

}