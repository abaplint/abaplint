import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Constant} from "../expressions";
import {Version} from "../../version";

export class Infotypes extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("INFOTYPES"), new Constant());

    return verNot(Version.Cloud, ret);
  }

}