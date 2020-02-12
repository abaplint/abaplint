import {Position} from "../../position";
import {TypedIdentifier} from "../types/_typed_identifier";
import {InterfaceDefinition, FormDefinition, ClassDefinition} from "../types";
import {ScopeType} from "./_scope_type";
import {Identifier} from "../types/_identifier";

export interface IScopeIdentifier {
  stype: ScopeType;
  sname: string;
  filename: string;
  start: Position; // stop position is implicit in the Spaghetti structure, ie start of the next child
}

export interface IScopeVariable {
  name: string;
  identifier: TypedIdentifier;
}

export interface IScopeData {
  vars: IScopeVariable[];
  cdefs: ClassDefinition[];
  idefs: InterfaceDefinition[];
  forms: FormDefinition[];
  types: TypedIdentifier[];

  reads: {position: Identifier, resolved: TypedIdentifier}[];
  writes: {position: Identifier, resolved: TypedIdentifier}[];
}

abstract class ScopeData {
  private readonly data: IScopeData;

  constructor() {
    this.data = {
      vars: [],
      cdefs: [],
      idefs: [],
      forms: [],
      types: [],
      reads: [],
      writes: [],
    };
  }

  public getData(): IScopeData {
    return this.data;
  }
}

export class SpaghettiScopeNode extends ScopeData {
  private readonly identifier: IScopeIdentifier;
  private readonly children: SpaghettiScopeNode[];
  private readonly parent: SpaghettiScopeNode | undefined;

  constructor(identifier: IScopeIdentifier, parent: SpaghettiScopeNode | undefined) {
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

  public getIdentifier(): IScopeIdentifier {
    return this.identifier;
  }

  public getNextSibling(): SpaghettiScopeNode | undefined {
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

  public calcCoverage(): {start: Position, end: Position} {
    let end: Position | undefined;

    // assumption: children start positions in ascending order
    const sibling = this.getNextSibling();
    if (sibling !== undefined && sibling.getIdentifier().filename === this.getIdentifier().filename) {
      end = sibling.getIdentifier().start;
    } else {
      end = new Position(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    }

    return {start: this.identifier.start, end};
  }

///////////////////////////

  public findClassDefinition(name: string): ClassDefinition | undefined {
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

  public findFormDefinition(name: string): FormDefinition | undefined {
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

  public findInterfaceDefinition(name: string): InterfaceDefinition | undefined {
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
      for (const local of search.getData().types) {
        if (local.getName().toUpperCase() === name.toUpperCase()) {
          return local;
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

  public findVariable(name: string): TypedIdentifier | undefined {
    let search: SpaghettiScopeNode | undefined = this;

    while (search !== undefined) {
      for (const local of search.getData().vars) {
        if (local.name.toUpperCase() === name.toUpperCase()) {
          return local.identifier;
        }
      }
      search = search.getParent();
    }

    return undefined;
  }

}

export class SpaghettiScope {
  private readonly node: SpaghettiScopeNode;

  constructor(top: SpaghettiScopeNode) {
    this.node = top;
  }

  // list variable definitions across all nodes
  public listDefinitions(filename: string): IScopeVariable[] {
    const ret: IScopeVariable[] = [];

    for (const n of this.allNodes()) {
      if (n.getIdentifier().filename === filename) {
        for (const v of n.getData().vars) {
          if (v.identifier.getFilename() === filename) {
            ret.push(v);
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
        for (const v of n.getData().reads) {
          if (v.position.getFilename() === filename) {
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
        for (const v of n.getData().writes) {
          if (v.position.getFilename() === filename) {
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
    let stack: SpaghettiScopeNode[] = [this.node];

    while (stack.length > 0) {
      const current = stack.pop()!;
      ret.push(current);
      stack = stack.concat(current.getChildren());
    }

    return ret;
  }

  private lookupPositionTraverse(p: Position, filename: string, node: SpaghettiScopeNode): SpaghettiScopeNode | undefined {
    for (const c of node.getChildren()) {
      const result = this.lookupPositionTraverse(p, filename, c);
      if (result !== undefined) {
        return result;
      }
    }

    if (node.getIdentifier().filename === filename) {
      const coverage = node.calcCoverage();
      if (p.isBetween(coverage.start, coverage.end)) {
        return node;
      }
    }

    return undefined;
  }

}