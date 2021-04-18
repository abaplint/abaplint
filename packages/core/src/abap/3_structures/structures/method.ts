import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import {opt, sta, beginEnd, sub, alt, star} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";
import {NativeSQL} from "../../2_statements/statements/_statement";
import {Body} from "./body";

export class Method implements IStructure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.MethodImplementation),
                    opt(alt(sub(Body), star(sta(NativeSQL)))),
                    sta(Statements.EndMethod));
  }

}