import {alt, Expression, ver} from "../combi";
import {SimpleSource2, Source} from ".";
import {IStatementRunnable} from "../statement_runnable";
import {Version} from "../../../version";

export class LoopSource extends Expression {

  public getRunnable(): IStatementRunnable {
    return alt(SimpleSource2, ver(Version.v740sp02, Source, Version.OpenABAP));
  }

}