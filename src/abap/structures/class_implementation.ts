import * as Statements from "../statements";
import {Structure} from "./_structure";
import * as Structures from "./";
import {star, sta, alt, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassImplementation extends Structure {

  public getMatcher(): IStructureRunnable {
    /*
    let method = beginEnd(sta(Statements.Method),
                          star(sub(new Structures.Normal())),
                          sta(Statements.Endmethod));
                          */

// the DEFINE statement is allowed between local method implementations, but not global?
    const body = star(alt(sub(new Structures.Define()), sub(new Structures.Method())));

    return beginEnd(sta(Statements.ClassImplementation),
                    body,
                    sta(Statements.EndClass));
  }

}