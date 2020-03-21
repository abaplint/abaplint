import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

// type pool usage
export class TypePools implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq(str("TYPE-POOLS"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}