import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {Normal} from ".";
import {IStructureRunnable} from "./_structure_runnable";

export class Provide extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Provide),
                    star(sub(new Normal())),
                    sta(Statements.EndProvide));
  }

}