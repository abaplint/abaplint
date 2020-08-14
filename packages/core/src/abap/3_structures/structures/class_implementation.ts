import * as Statements from "../../2_statements/statements";
import {IStructure} from "./_structure";
import * as Structures from ".";
import {star, sta, alt, beginEnd, sub} from "./_combi";
import {IStructureRunnable} from "./_structure_runnable";

export class ClassImplementation implements IStructure {

  public getMatcher(): IStructureRunnable {
// the DEFINE statement is allowed between local method implementations, but not global?
    const body = star(alt(sub(new Structures.Define()), sta(Statements.Include), sub(new Structures.Method())));

    return beginEnd(sta(Statements.ClassImplementation),
                    body,
                    sta(Statements.EndClass));
  }

}