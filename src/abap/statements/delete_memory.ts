import {Statement} from "./statement";
import {verNot, str, seq, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class DeleteMemory extends Statement {

  public getMatcher(): IRunnable {
    let ret = seq(str("DELETE FROM MEMORY ID"), new Source());

    return verNot(Version.Cloud, ret);
  }

}