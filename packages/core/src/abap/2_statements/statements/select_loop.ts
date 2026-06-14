import {IStatement} from "./_statement";
import {Select as eSelect} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

// same matcher as Select, reclassified post-parse by isSelectLoop()
export class SelectLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new eSelect();
  }

}