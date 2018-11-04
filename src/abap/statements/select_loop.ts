import {Statement} from "./_statement";
import {IRunnable} from "../combi";
import {SelectLoop as eSelectLoop} from "../expressions";

export class SelectLoop extends Statement {

  public getMatcher(): IRunnable {
    return new eSelectLoop();
  }

}