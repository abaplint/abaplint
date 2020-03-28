import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Statics implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.StaticBegin),
                    star(alt(sta(Statements.Static), sta(Statements.IncludeType))),
                    sta(Statements.StaticEnd));
  }

}