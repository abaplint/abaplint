import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, seq, beginEnd} from "./_combi";

export class Case extends Structure {
  private body: IStructureRunnable;

  public constructor(body: IStructureRunnable) {
    super();
    this.body = body;
  }

  public getMatcher(): IStructureRunnable {
    const when = seq(sta(Statements.When), this.body);

    return beginEnd(sta(Statements.Case),
                    star(when),
                    sta(Statements.EndCase));
  }

}