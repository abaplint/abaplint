import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

// type pool definition
export class TypePool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq(str("TYPE-POOL"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}