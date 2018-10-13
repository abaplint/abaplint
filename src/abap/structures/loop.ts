import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";

export class Loop extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Loop),
                    star(sub(new Normal)),
                    sta(Statements.EndLoop));
  }

}