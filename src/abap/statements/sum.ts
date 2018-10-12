import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class Sum extends Statement {

  public get_matcher(): IRunnable {
    return verNot(Version.Cloud, str("SUM"));
  }

}