import {IStatement} from "./_statement";
import {optPrio, seq, str, ver, AlsoIn} from "../combi";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";
import {Source} from "../expressions";

export class Return implements IStatement {

  public getMatcher(): IStatementRunnable {
    return seq(str("RETURN"), optPrio(ver(Release.v758, Source, {also: AlsoIn.OpenABAP})));
  }

}