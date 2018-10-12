import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class Tables extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("TABLES"), new Field());

    return verNot(Version.Cloud, ret);
  }

}