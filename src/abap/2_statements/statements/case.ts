import {Statement} from "./_statement";
import {str, seq, opt, ver, IStatementRunnable} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";

export class Case extends Statement {

  public getMatcher(): IStatementRunnable {
    return seq(str("CASE"),
               opt(ver(Version.v750, str("TYPE OF"))),
               new Source());
  }

}