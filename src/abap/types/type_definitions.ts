import {StructureNode, StatementNode} from "../../abap/nodes";
import * as Statements from "../../abap/statements";
import * as Structures from "../../abap/structures";
import {CurrentScope} from "../syntax/_current_scope";
import {TypedIdentifier} from "../..";
import {ScopeType} from "../syntax/_scope_type";
import {Position} from "../../position";

// todo: public + protected + private
export class TypeDefinitions {
  private readonly list: TypedIdentifier[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.list = [];
    this.filename = filename;
    this.parse(node, scope);
  }

  public getAll(): TypedIdentifier[] {
    return this.list;
  }

  private parse(node: StructureNode, scope: CurrentScope) {
// todo,   this.parseDirect(node, scope); // for interfaces

    const pub = node.findFirstStructure(Structures.PublicSection);
    if (pub) {
      this.parseDirect(pub, scope);
    }
    const pro = node.findFirstStructure(Structures.ProtectedSection);
    if (pro) {
      this.parseDirect(pro, scope);
    }
    const pri = node.findFirstStructure(Structures.PrivateSection);
    if (pri) {
      this.parseDirect(pri, scope);
    }
  }

  private parseDirect(node: StructureNode, scope: CurrentScope) {
    const contents = node.findFirstStructure(Structures.SectionContents);
    if (contents === undefined) {
      return;
    }

    // note that handling the sequence of handling the children is important
    // hmm, move this logic somewhere else?
    scope.push(ScopeType.Dummy, ScopeType.Dummy, new Position(1, 1), this.filename);
    for (const c of contents.getChildren()) {
      const get = c.get();
      if (c instanceof StatementNode && get instanceof Statements.Type) {
        const res = get.runSyntax(c, scope, this.filename);
        if (res) {
          scope.addType(res);
          this.list.push(res);
        }
      } else if (c instanceof StructureNode && get instanceof Structures.Types) {
        const res = get.runSyntax(c, scope, this.filename);
        if (res) {
          scope.addType(res);
          this.list.push(res);
        }
      }
    }
    scope.pop();

  }

}