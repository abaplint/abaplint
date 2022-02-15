import {IStatement} from "./_statement";
import {verNot} from "../combi";
import {Version} from "../../../version";
import {IStatementRunnable} from "../statement_runnable";

export class LoopAtScreen implements IStatement {

  public getMatcher(): IStatementRunnable {
    return verNot(Version.Cloud, "LOOP AT SCREEN");
  }

}