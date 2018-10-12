import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOn extends Statement {

  public get_matcher(): IRunnable {
    let ret = str("ENDON");
    return verNot(Version.Cloud, ret);
  }

}