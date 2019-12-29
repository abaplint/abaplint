import * as Statements from "../statements";
import * as Expressions from "../expressions";
import {Structure} from "./_structure";
import {star, IStructureRunnable, sta, beginEnd, alt, sub} from "./_combi";
import {StructureNode, StatementNode} from "../nodes";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../types/_typed_identifier";
import {IStructureComponent} from "../types/basic";
import * as Basic from "../types/basic";

export class ClassData extends Structure {

  public getMatcher(): IStructureRunnable {
    return beginEnd(sta(Statements.ClassDataBegin),
                    star(alt(sta(Statements.ClassData), sub(new ClassData()))),
                    sta(Statements.ClassDataEnd));
  }

  public runSyntax(node: StructureNode, scope: CurrentScope, filename: string): TypedIdentifier | undefined {
    const name = node.findFirstExpression(Expressions.NamespaceSimpleName)!.getFirstToken();

    const components: IStructureComponent[] = [];
    for (const c of node.getChildren()) {
      const ctyp = c.get();
      if (c instanceof StatementNode && ctyp instanceof Statements.ClassData) {
        const found = ctyp.runSyntax(c, scope, filename);
        if (found) {
          components.push({name: found.getName(), type: found.getType()});
        }
      }
      // todo, nested structures and INCLUDES
    }

    return new TypedIdentifier(name, filename, new Basic.StructureType(components));
  }

}