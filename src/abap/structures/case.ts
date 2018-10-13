import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, seq, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";

export class Case extends Structure {

  public getMatcher(): IStructureRunnable {
    const when = seq(sta(Statements.When), sub(new Normal()));

    return beginEnd(sta(Statements.Case),
                    star(when),
                    sta(Statements.EndCase));
  }

}