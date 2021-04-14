import {Position} from "../../position";
import {TypedIdentifier} from "../types/_typed_identifier";
import {Identifier} from "../4_file_information/_identifier";
import {IClassDefinition} from "../types/_class_definition";
import {IInterfaceDefinition} from "../types/_interface_definition";
import {IFormDefinition} from "../types/_form_definition";
import {IScopeData, IScopeIdentifier, IScopeVariable, ISpaghettiScopeNode, ISpaghettiScope} from "./_spaghetti_scope";
import {ReferenceType} from "./_reference";

abstract class ScopeData {
  private readonly data: IScopeData;

  public constructor() {
    this.data = {
      vars: {},
      cdefs: [],
      idefs: [],
      forms: [],
      types: {},
      deferred: [],
      references: [],
    };
  }

  public getData(): IScopeData {
    return this.data;
  }
}

export class SpaghettiScopeNode extends ScopeData implements ISpaghettiScopeNode {
  private readonly identifier: IScopeIdentifier;
  private readonly children: SpaghettiScopeNode[];
  private readonly parent: SpaghettiScopeNode | undefined;

  public constructor(identifier: IScopeIdentifier, parent: SpaghettiScopeNode | undefined) {
    super();
    this.identifier = identifier;
    this.parent = parent;
    this.children = [];
  }

  public getParent(): SpaghettiScopeNode | undefined {
    return this.parent;
  }

  public addChild(node: SpaghettiScopeNode) {
    this.children.push(node);
  }

  public getChildren(): SpaghettiScopeNode[] {
    return this.children;
  }

  public getFirstChild(): SpaghettiScopeNode | undefined {
    return this.children[0];
  }

  public getIdentifier(): IScopeIdentifier {
    return this.identifier;
  }

  /*
  private getNextSibling(): SpaghettiScopeNode | undefined {
    const parent = this.getParent();
    if (parent === undefined) {
      return undefined;
    }

    let returnNext = false;
    for (const sibling of parent.getChildren()) {
      if (sibling.getIdentifier().stype === this.getIdentifier().stype
          && sibling.getIdentifier().sname === this.getIdentifier().sname) {
        returnNext = true;
      } else if (returnNext === true) {
        return sibling;
      }
    }

    return undefined;
  }
  */

  public calcCoverage(): {start: Position, end: Position} {
    /*
    let end: Position | undefined;

    // assumption: children start positions in ascending order
    const sibling = this.getNextSibling();
    if (sibling !== undefined && sibling.getIdentifier().filename === this.getIdentifier().filename) {
      end = sibling.getIdentifier().start;
    } else {
      end = new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    }
    */

    if (this.identifier.end === undefined) {
      throw new Error("internal error, caclCoverage");
    }
    return {start: this.identifier.start, end: this.identifier.end};
  }

  public setEnd(end: Position): void {
    this.identifier.end = end;
  }

  public findDeferred(name: string): Identifier | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const d of search.getData().deferred) {
        if (d.getStr().toUpperCase() === name.toUpperCase()) {
          return new Identifier(d, search.identifier.filename);
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findClassDefinition(name: string): IClassDefinition | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const cdef of search.getData().cdefs) {
        if (cdef.getName().toUpperCase() === name.toUpperCase()) {
          return cdef;
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findFormDefinition(name: string): IFormDefinition | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const form of search.getData().forms) {
        if (form.getName().toUpperCase() === name.toUpperCase()) {
          return form;
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public listFormDefinitions(): IFormDefinition[] {
    let search: SpaghettiScopeNode | undefined = this;
    const ret: IFormDefinition[] = [];

    while (search !== undefined) {
      for (const form of search.getData().forms) {
        ret.push(form);
      }
      search = search.getParent();
    }

    return ret;
  }

  // todo, optimize
  public findInterfaceDefinition(name: string): IInterfaceDefinition | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const idef of search.getData().idefs) {
        if (idef.getName().toUpperCase() === name.toUpperCase()) {
          return idef;
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findType(name: string): TypedIdentifier | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const lname in search.getData().types) {
        if (lname.toUpperCase() === name.toUpperCase()) {
          return search.getData().types[lname];
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findVariable(name: string): TypedIdentifier | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const local in search.getData().vars) {
        if (local === name.toUpperCase()) {
          return search.getData().vars[local];
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findScopeForVariable(name: string): IScopeIdentifier | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const local in search.getData().vars) {
        if (local === name.toUpperCase()) {
          return search.getIdentifier();
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

}

export class SpaghettiScope implements ISpaghettiScope {
  private readonly node: SpaghettiScopeNode;

  public constructor(top: SpaghettiScopeNode) {
    this.node = top;
  }

  // list variable definitions across all nodes
  public listDefinitions(filename: string): IScopeVariable[] {
    const ret: IScopeVariable[] = [];

    for (const n of this.allNodes()) {
      if (n.getIdentifier().filename === filename) {
        const vars = n.getData().vars;
        for (const v in vars) {
          if (vars[v].getFilename() === filename) {
            ret.push({name: v, identifier: vars[v]});
          }
        }
      }
    }

    return ret;
  }

  public listReadPositions(filename: string): Identifier[] {
    const ret: Identifier[] = [];

    for (const n of this.allNodes()) {
      if (n.getIdentifier().filename === filename) {
        for (const v of n.getData().references) {
          if (v.referenceType === ReferenceType.DataReadReference && v.position.getFilename() === filename) {
            ret.push(v.position);
          }
        }
      }
    }

    return ret;
  }

  public listWritePositions(filename: string): Identifier[] {
    const ret: Identifier[] = [];

    for (const n of this.allNodes()) {
      if (n.getIdentifier().filename === filename) {
        for (const v of n.getData().references) {
          if (v.referenceType === ReferenceType.DataWriteReference && v.position.getFilename() === filename) {
            ret.push(v.position);
          }
        }
      }
    }

    return ret;
  }

  public lookupPosition(p: Position, filename: string): SpaghettiScopeNode | undefined {
    return this.lookupPositionTraverse(p, filename, this.node);
  }

  public getTop(): SpaghettiScopeNode {
    return this.node;
  }

/////////////////////////////

  private allNodes(): SpaghettiScopeNode[] {
    const ret: SpaghettiScopeNode[] = [];
    const stack: SpaghettiScopeNode[] = [this.node];

    while (stack.length > 0) {
      const current = stack.pop()!;
      ret.push(current);
      stack.push(...current.getChildren());
    }

    return ret;
  }

  private lookupPositionTraverse(p: Position, filename: string, node: SpaghettiScopeNode): SpaghettiScopeNode | undefined {
    const coverage = node.calcCoverage();
    if (node.getIdentifier().filename === filename && p.isBetween(coverage.start, coverage.end) === false) {
      return undefined;
    }

    // possible optimization: binary search the nodes
    for (const c of node.getChildren()) {
      const result = this.lookupPositionTraverse(p, filename, c);
      if (result !== undefined) {
        return result;
      }
    }

    if (node.getIdentifier().filename === filename
        && p.isBetween(coverage.start, coverage.end)) {
      return node;
    }

    return undefined;
  }

}