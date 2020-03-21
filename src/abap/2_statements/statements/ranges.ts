import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Source, SimpleName, FieldSub} from "../expressions";
import {Version} from "../../../version";

export class Ranges implements IStatement {

  public getMatcher(): IStatementRunnable {
    const occurs = seq(str("OCCURS"), new Source());

    const ret = seq(str("RANGES"),
                    new SimpleName(),
                    str("FOR"),
                    new FieldSub(),
                    opt(occurs));

    return verNot(Version.Cloud, ret);
  }

}