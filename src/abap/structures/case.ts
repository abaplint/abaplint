import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {When} from "./when";

export class Case implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Case),
                    star(sub(new When())),
                    sta(Statements.EndCase));
  }

}