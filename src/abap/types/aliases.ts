import {StructureNode} from "../nodes";
import {Alias} from "./alias";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Scope} from "./scope";

export class Aliases {
  private aliases: Alias[];

  constructor(node: StructureNode) {
    this.aliases = [];
    this.parse(node);
  }

  public getAll(): Alias[] {
    return this.aliases;
  }

  private parse(node: StructureNode): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Scope.Public);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Scope.Private);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Scope.Protected);
    }
  }

  private parseSection(node: StructureNode | undefined, scope: Scope): void {
    if (!node) { return; }

    const list = node.findAllStatements(Statements.Aliases);
    for (const a of list) {
      const names = a.findAllExpressions(Expressions.Field);
      if (names.length !== 2) {
        throw new Error("Unexpected ALIAS statement");
      }
      this.aliases.push(new Alias(names[0].getFirstToken(), scope, names[1].getFirstToken().getStr()));
    }

  }

}