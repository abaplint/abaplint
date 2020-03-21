import {IStatement} from "./_statement";
import {verNot, str, seq, opt, plus, IStatementRunnable} from "../combi";
import {Source} from "../expressions";
import {Version} from "../../../version";

export class SetTitlebar implements IStatement {

  public getMatcher(): IStatementRunnable {
    const wit = seq(str("WITH"), plus(new Source()));

    const program = seq(str("OF PROGRAM"), new Source());

    const ret = seq(str("SET TITLEBAR"), new Source(), opt(program), opt(wit));

    return verNot(Version.Cloud, ret);
  }

}