import {IStatement} from "./_statement";
import {verNot, seq} from "../combi";
import {FieldSub} from "../expressions";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class Fields implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq("FIELDS", FieldSub);

    return verNot(Version.Cloud, ret);
  }

}