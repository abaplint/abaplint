import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {Chain} from "./chain";

export class DynproLoop implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.DynproLoop),
                    star(alt(sta(Statements.Module), sta(Statements.Field), sub(Chain))),
                    sta(Statements.EndLoop));
  }

}