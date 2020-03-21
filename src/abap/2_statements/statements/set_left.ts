import {IStatement} from "./_statement";
import {verNot, str, IStatementRunnable, opt, seq} from "../combi";
import {Version} from "../../../version";
import {Source} from "../expressions";

export class SetLeft implements IStatement {

  public getMatcher(): IStatementRunnable {
    const column = seq(str("COLUMN"), new Source());
    return verNot(Version.Cloud, seq(str("SET LEFT SCROLL-BOUNDARY"), opt(column)));
  }

}