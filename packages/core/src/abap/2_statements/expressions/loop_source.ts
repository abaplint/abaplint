import {alt, Expression, ver, AlsoIn} from "../combi";
import {SimpleSource2, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Release} from "../../../version";

export class LoopSource extends Expression {

  public getRunnable(): IStatementRunnable {
    return alt(SimpleSource2, ver(Release.v740sp02, Source, {also: AlsoIn.OpenABAP}));
  }

}