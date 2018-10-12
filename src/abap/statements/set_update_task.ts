import {Statement} from "./statement";
import {verNot, str, IRunnable} from "../combi";
import {Version} from "../../version";

export class SetUpdateTask extends Statement {
  public getMatcher(): IRunnable {
    return verNot(Version.Cloud, str("SET UPDATE TASK LOCAL"));
  }
}