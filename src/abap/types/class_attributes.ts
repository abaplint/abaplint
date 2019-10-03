import * as Structures from "../../abap/structures";
import * as Statements from "../../abap/statements";
import * as Expressions from "../../abap/expressions";
import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {StructureNode, StatementNode} from "../../abap/nodes";
import {Visibility} from "./visibility";
import {Type} from "../../abap/expressions";
import {FieldChain} from "../../abap/expressions";

export class Attributes {
  private static: ClassAttribute[];
  private instance: ClassAttribute[];
  private constants: ClassConstant[];

  constructor(node: StructureNode) {
    this.static = [];
    this.instance = [];
    this.constants = [];
    this.parse(node);
  }

  public getStatic(): ClassAttribute[] {
    return this.static;
  }

  public getInstance(): ClassAttribute[] {
    return this.instance;
  }

  public getConstants(): ClassConstant[] {
    return this.constants;
  }

  public findByName(name: string): ClassAttribute | ClassConstant | undefined {
    for (const a of this.getStatic()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    for (const a of this.getInstance()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    for (const a of this.getConstants()) {
      if (a.getName().toUpperCase() === name.toUpperCase()) {
        return a;
      }
    }
    return undefined;
  }

/////////////////////////////

  private parse(node: StructureNode): void {
    const cdef = node.findFirstStructure(Structures.ClassDefinition);
    if (cdef) {
      this.parseSection(cdef.findFirstStructure(Structures.PublicSection), Visibility.Public);
      this.parseSection(cdef.findFirstStructure(Structures.PrivateSection), Visibility.Private);
      this.parseSection(cdef.findFirstStructure(Structures.ProtectedSection), Visibility.Protected);
      return;
    }

    const idef = node.findFirstStructure(Structures.Interface);
    if (idef) {
      this.parseSection(idef.findFirstStructure(Structures.SectionContents), Visibility.Public);
      return;
    }

    throw new Error("MethodDefinition, expected ClassDefinition or InterfaceDefinition");
  }

  private parseSection(node: StructureNode | undefined, visibility: Visibility): void {
    if (!node) { return; }

    let defs = node.findAllStatements(Statements.Data).concat(node.findAllStatements(Statements.DataBegin));
    for (const def of defs) {
      this.instance.push(this.parseAttribute(def, visibility));
    }

    defs = node.findAllStatements(Statements.ClassData).concat(node.findAllStatements(Statements.ClassDataBegin));
    for (const def of defs) {
      this.static.push(this.parseAttribute(def, visibility));
    }

    defs = node.findAllStatements(Statements.Constant).concat(node.findAllStatements(Statements.ConstantBegin));
    for (const def of defs) {
      this.constants.push(new ClassConstant(def, visibility));
    }
  }

  private parseAttribute(node: StatementNode, visibility: Visibility): ClassAttribute {
    if (!(node.get() instanceof Statements.Data)
        && !(node.get() instanceof Statements.DataBegin)
        && !(node.get() instanceof Statements.ClassData)
        && !(node.get() instanceof Statements.ClassDataBegin)) {
      throw new Error("ClassAttribute, unexpected node, 1");
    }
    const found = node.findFirstExpression(Expressions.NamespaceSimpleName);
    if (found === undefined) {
      throw new Error("ClassAttribute, unexpected node, 2");
    }
    const token = found.getFirstToken();

    let type;
    const foundType = node.findFirstExpression(Type);
    if (foundType) {
      type = "";
      for (const typeToken of foundType.findFirstExpression(FieldChain)!.getAllTokens()) {
        type = type + typeToken.getStr();
      }
    }

    return new ClassAttribute(token, visibility, type);
  }

}