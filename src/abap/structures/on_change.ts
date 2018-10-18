import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";

export class OnChange extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.OnChange),
                    star(sub(new Normal())),
                    sta(Statements.EndOn));
  }

}