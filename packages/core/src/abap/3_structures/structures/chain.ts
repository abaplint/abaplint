import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class Chain implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Chain),
                    star(alt(sta(Statements.Field), sta(Statements.Module))),
                    sta(Statements.EndChain));
  }

}