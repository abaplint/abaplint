import * as Statements from "../statements";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd} from "./_combi";

export class TestInjection extends Structure {
  private body: IStructureRunnable;

  public constructor(body: IStructureRunnable) {
    super();
    this.body = body;
  }

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.TestInjection),
                    star(this.body),
                    sta(Statements.EndTestInjection));
  }

}