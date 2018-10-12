import {Statement} from "./statement";
import {verNot, str, seq, alt, IRunnable} from "../combi";
import {Version} from "../../version";

export class SetExtendedCheck extends Statement {

  public get_matcher(): IRunnable {
    let ret = seq(str("SET EXTENDED CHECK"), alt(str("OFF"), str("ON")));

    return verNot(Version.Cloud, ret);
  }

}