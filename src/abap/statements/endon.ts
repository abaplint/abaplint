import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOn extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}