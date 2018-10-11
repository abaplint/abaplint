import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class ClassImplementation extends Structure {

  public getMatcher(): IStructureRunnable {
    let methodBody = sta(Statements.Data);

    let method = beginEnd(sta(Statements.Method), methodBody, sta(Statements.Endmethod));

    let body = star(method);

    return beginEnd(sta(Statements.ClassImplementation),
                    body,
                    sta(Statements.Endclass));
  }

}