import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Endat extends Statement {

  public get_matcher(): IRunnable {
    let ret = str("ENDAT");
    return verNot(Version.Cloud, ret);
  }

}