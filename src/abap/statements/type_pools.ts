import {Statement} from "./statement";
import {verNot, str, seq, regex as reg, IRunnable} from "../combi";
import {Version} from "../../version";

// type pool usage
export class TypePools extends Statement {

  public get_matcher(): IRunnable {
    let fieldName = reg(/^\w+$/);

    let ret = seq(str("TYPE-POOLS"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}