import * as Statements from "../statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class Select implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.SelectLoop),
                    star(sub(new Normal())),
                    sta(Statements.EndSelect));
  }

}