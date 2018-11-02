import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub} from "./_combi";
import {Normal} from ".";

export class Provide extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Provide),
                    star(sub(new Normal())),
                    sta(Statements.EndProvide));
  }

}