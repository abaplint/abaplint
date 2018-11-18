import {Statement} from "./_statement";
import {verNot, str, IRunnable, alt, seq} from "../combi";
import {Version} from "../../version";

export class SetBlank extends Statement {

  public getMatcher(): IRunnable {
    const onOff = alt(str("ON"), str("OFF"));

    const ret = seq(str("SET BLANK LINES"), onOff);

    return verNot(Version.Cloud, ret);
  }

}