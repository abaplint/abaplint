import {IStatement} from "./_statement";
import {With} from "./with";
import {IStatementRunnable} from "../statement_runnable";

export class WithLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new With().getMatcher();
  }

}
