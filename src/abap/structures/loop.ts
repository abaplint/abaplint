import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt, sub} from "./_combi";
import {Normal, At} from ".";

export class Loop extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Loop),
                    star(alt(sub(new Normal), sub(new At))),
                    sta(Statements.EndLoop));
  }

}