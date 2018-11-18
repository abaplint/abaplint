import {Statement} from "./_statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Version} from "../../version";
import {Field} from "../expressions";

export class Put extends Statement {

  public getMatcher(): IRunnable {
    const ret = seq(str("PUT"), new Field());

    return verNot(Version.Cloud, ret);
  }

}