import {StructureNode} from "../nodes";
import {Alias} from "./alias";
import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {Visibility} from "./visibility";

export class Aliases {
  private readonly aliases: Alias[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string) {
    this.aliases = [];
    this.filename = filename;
    this.parse(node);
  }

  public getAll(): Alias[] {
    return this.aliases;
  }

/////////////////////////

  private parse(node: StructureNode): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Visibility.Public);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Visibility.Private);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Visibility.Protected);
    }
  }

  private parseSection(node: StructureNode | undefined, visibility: Visibility): void {
    if (!node) { return; }

    const list = node.findAllStatements(Statements.Aliases);
    for (const a of list) {
      const name = a.findFirstExpression(Expressions.SimpleName)!.getFirstToken();
      const comp = a.findFirstExpression(Expressions.Field)!.getFirstToken();

      this.aliases.push(new Alias(name, visibility, comp.getStr(), this.filename));
    }
  }

}