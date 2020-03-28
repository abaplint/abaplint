import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub} from "./_combi";
import {Normal} from ".";
import {IStructureRunnable} from "./_structure_runnable";

export class Provide implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Provide),
                    star(sub(new Normal())),
                    sta(Statements.EndProvide));
  }

}