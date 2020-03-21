import {IStatement} from "./_statement";
import {IStatementRunnable} from "../combi";
import {SelectLoop as eSelectLoop} from "../expressions";

export class SelectLoop implements IStatement {

  public getMatcher(): IStatementRunnable {
    return new eSelectLoop();
  }

}