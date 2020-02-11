import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {Structure} from "./_structure";
import {star, sta, beginEnd, sub, alt} from "./_combi";
import {StructureNode, StatementNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {IStructureComponent} from "../types/basic";
import * as Basic from "../types/basic";
import {IStructureRunnable} from "./_structure_runnable";

export class Constants extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ConstantBegin),
                    star(alt(sta(Statements.Constant), sub(new Constants()))),
                    sta(Statements.ConstantEnd));
  }

  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.Constant) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      } else if (c instanceof StructureNode && ctyp instanceof Constants) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
    }

    if (components.length === 0) {
      return undefined;
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}