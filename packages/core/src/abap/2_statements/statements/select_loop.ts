import {IStatement} from "./_statement";
import {SelectLoop as eSelectLoop} from "../expressions";
import {IStatementRunnable} from "../statement_runnable";

export class SelectLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new eSelectLoop();
  }

}