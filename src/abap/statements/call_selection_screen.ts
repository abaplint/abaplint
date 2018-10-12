import {Statement} from "./statement";
import {verNot, str, seq, opt, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class CallSelectionScreen extends Statement {

  public getMatcher(): IRunnable {
    let ending = seq(str("ENDING AT"), new Source(), new Source());
    let starting = seq(str("STARTING AT"), new Source(), new Source());
    let using = seq(str("USING SELECTION-SET"), new Source());

    let at = seq(starting, opt(ending));

    let ret = seq(str("CALL SELECTION-SCREEN"), new Source(), opt(at), opt(using));

    return verNot(Version.Cloud, ret);
  }

}