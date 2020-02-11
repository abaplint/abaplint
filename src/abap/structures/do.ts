import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Do extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Do),
                    star(sub(new Normal())),
                    sta(Statements.EndDo));
  }

}