import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {Normal} from "./normal";
import {IStructureRunnable} from "./_structure_runnable";

export class FunctionModule implements IStructure {

  public getMatcher(): IStructureRunnable {
    const body = alt(sta(Statements.Tables),
                     sta(Statements.TypePools),
                     sta(Statements.Ranges),
                     sub(new Normal()));

    return beginEnd(sta(Statements.FunctionModule),
                    star(body),
                    sta(Statements.EndFunction));
  }

}