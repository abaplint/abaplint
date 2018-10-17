import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";

export class At extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.At),
                    star(sub(new Normal())),
                    sta(Statements.Endat));
  }

}