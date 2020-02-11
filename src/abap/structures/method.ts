import * as Statements from "../statements";
import {Structure} from "./_structure";
import * as Structures from "./";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Method extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Method),
                    star(sub(new Structures.Normal())),
                    sta(Statements.EndMethod));
  }

}