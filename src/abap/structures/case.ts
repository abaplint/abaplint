import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, seq, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Case implements IStructure {

  public getMatcher(): IStructureRunnable {
    const when = seq(sta(Statements.When), star(sub(new Normal())));

    return beginEnd(sta(Statements.Case),
                    star(when),
                    sta(Statements.EndCase));
  }

}