import {IStatement} from "./_statement";
import {With} from "./with";
import {IStatementRunnable} from "../statement_runnable";

// same matcher as With, reclassified post-parse by isWithLoop()
export class WithLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new With().getMatcher();
  }

}
