import {IStatement} from "./_statement";
import {verNot, str, seq, IStatementRunnable} from "../combi";
import {FieldSub} from "../expressions";
import {Version} from "../../../version";

export class Fields implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("FIELDS"), new FieldSub());

    return verNot(Version.Cloud, ret);
  }

}