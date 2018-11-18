import {Statement} from "./_statement";
import {verNot, str, seq, opt, plus, IRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../version";

export class SetTitlebar extends Statement {

  public getMatcher(): IRunnable {
    const wit = seq(str("WITH"), plus(new Source()));

    const program = seq(str("OF PROGRAM"), new Source());

    const ret = seq(str("SET TITLEBAR"), new Source(), opt(program), opt(wit));

    return verNot(Version.Cloud, ret);
  }

}