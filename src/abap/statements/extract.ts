import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../version";

export class Extract extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("EXTRACT"), new Field());

    return verNot(Version.Cloud, ret);
  }

}