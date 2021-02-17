import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {NativeSQL} from "../../2_statements/statements/_statement";
import {Normal} from "./normal";

export class Method implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.Method),
                    star(alt(sub(Normal), sta(NativeSQL))),
                    sta(Statements.EndMethod));
  }

}