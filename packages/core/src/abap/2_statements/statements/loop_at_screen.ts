import {IStatement} from "./_statement";
import {opt, seq, verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";
import {Target} from "../expressions";

export class LoopAtScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    const l = seq("LOOP AT SCREEN", opt(seq("INTO", Target)));
    return verNot(Version.Cloud, l);
  }

}