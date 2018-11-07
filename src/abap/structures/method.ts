import * as Statements from "../statements";
import {Structure} from "./_structure";
import * as Structures from "./";
import {star, IStructureRunnable, sta, beginEnd, sub} from "./_combi";

export class Method extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Method),
                    star(sub(new Structures.Normal())),
                    sta(Statements.Endmethod));
  }

}