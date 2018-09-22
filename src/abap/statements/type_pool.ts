import {Statement} from "./statement";
import {verNot, str, seq, regex as reg, IRunnable} from "../combi";
import {Version} from "../../version";

// type pool definition
export class TypePool extends Statement {

  public static get_matcher(): IRunnable {
    let fieldName = reg(/^\w+$/);

    let ret = seq(str("TYPE-POOL"), fieldName);

    return verNot(Version.Cloud, ret);
  }

}