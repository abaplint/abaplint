import {Statement} from "./_statement";
import {verNot, str, seq, regex as reg, IStatementRunnable} from "../combi";
import {Version} from "../../version";

// type pool usage
export class TypePools extends Statement {

  public getMatcher(): IStatementRunnable {
    const fieldName = reg(/^\w+$/);

    const ret = seq(str("TYPE-POOLS"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}