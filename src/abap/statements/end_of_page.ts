import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfPage extends Statement {

  public getMatcher(): IRunnable {
    let ret = str("END-OF-PAGE");

    return verNot(Version.Cloud, ret);
  }

}