import {StructureNode} from "../nodes";
import {Alias} from "./alias";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import * as Expressions from "../2_statements/expressions";
import {Visibility} from "../4_file_information/visibility";
import {IAliases} from "./_aliases";
import {CurrentScope} from "../5_syntax/_current_scope";
import {ReferenceType} from "../5_syntax/_reference";

export class Aliases implements IAliases {
  private readonly aliases: Alias[];
  private readonly filename: string;

  public constructor(node: StructureNode, filename: string, scope: CurrentScope) {
    this.aliases = [];
    this.filename = filename;
    this.parse(node, scope, filename);
  }

  public getAll(): readonly Alias[] {
    return this.aliases;
  }

/////////////////////////

  private parse(node: StructureNode, scope: CurrentScope, filename: string): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Visibility.Public, scope, filename);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Visibility.Private, scope, filename);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Visibility.Protected, scope, filename);
    }

    const idef = node.findFirstStructure(Structures.Interface);
    if (idef) {
      this.parseSection(idef, Visibility.Public, scope, filename);
    }
  }

  private parseSection(node: StructureNode | undefined, visibility: Visibility, scope: CurrentScope, filename: string): void {
    if (!node) {
      return;
    }

    const list = node.findAllStatements(Statements.Aliases);
    for (const a of list) {
      const name = a.findFirstExpression(Expressions.SimpleName)!.getFirstToken();
      const compToken = a.findFirstExpression(Expressions.Field)!.getFirstToken();
      const compName = compToken.getStr();

      this.aliases.push(new Alias(name, visibility, compName, this.filename));

      if (compName.includes("~")) {
        const name = compName.split("~")[0];
        const idef = scope.findInterfaceDefinition(name);
        if (idef) {
          scope.addReference(compToken, idef, ReferenceType.ObjectOrientedReference, filename, {ooName: name.toUpperCase(), ooType: "INTF"});
        }
      }
    }
  }

}