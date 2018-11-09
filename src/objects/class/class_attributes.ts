import {ClassAttribute} from "./class_attribute";
import {ClassConstant} from "./class_constant";
import {ClassDefinition} from "../../abap/structures";
import {StructureNode} from "../../abap/nodes";


export class ClassAttributes {
  private static: ClassAttribute[];
  private instance: ClassAttribute[];
  private constants: ClassConstant[];

  constructor(node: StructureNode) {
    if (!(node instanceof ClassDefinition)) {
      throw new Error("ClassAttributes, unexpected node type");
    }

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

  private parse(_node: StructureNode) {
    throw new Error("todo");
    /*
    let pri = node.findFirstStructure(PrivateSection);
    if (pri) {
      let defs = pri.findAllStatements(Statements.Data);
      for (let def of defs) {
        this.instance.push(new ClassAttribute());
      }
    }
    */

// todo
  }

}