import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfSelection extends Statement {

  public static get_matcher(): IRunnable {
    let ret = str("END-OF-SELECTION");

    return verNot(Version.Cloud, ret);
  }

}