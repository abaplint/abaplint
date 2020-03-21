import {IStatement} from "./_statement";
import {verNot, str, seq, regex as reg, IStatementRunnable} from "../combi";
import {Version} from "../../../version";

// type pool definition
export class TypePool implements IStatement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq(str("TYPE-POOL"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}