import {Statement} from "./statement";
import {verNot, str, IRunnable, alt, seq} from "../combi";
import {Version} from "../../version";

export class SetBlank extends Statement {

  public get_matcher(): IRunnable {
    let onOff = alt(str("ON"), str("OFF"));

    let ret = seq(str("SET BLANK LINES"), onOff);

    return verNot(Version.Cloud, ret);
  }

}