import {Statement} from "./_statement";
import {IStatementRunnable} from "../combi";
import {SelectLoop as eSelectLoop} from "../expressions";

export class SelectLoop extends Statement {

  public getMatcher(): IStatementRunnable {
    return new eSelectLoop();
  }

}