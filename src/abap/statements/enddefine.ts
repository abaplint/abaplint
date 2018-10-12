import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class EndOfDefinition extends Statement {

  public get_matcher(): IRunnable {
    let ret = str("END-OF-DEFINITION");
    return verNot(Version.Cloud, ret);
  }

}