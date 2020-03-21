import {IStatement} from "./_statement";
import {verNot, str, seq, opt, IStatementRunnable} from "../combi";
import {Field} from "../expressions";
import {Version} from "../../../version";

export class EnhancementSection implements IStatement {

  public getMatcher(): IStatementRunnable {
    const ret = seq(str("ENHANCEMENT-SECTION"),
                    new Field(),
                    str("SPOTS"),
                    new Field(),
                    opt(str("STATIC")));

    return verNot(Version.Cloud, ret);
  }

}