import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";
import {IStatement} from "../2_statements/statements/_statement";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, (MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE)
//
// Branching: IF, LOOP, DO, WHILE, CASE, CASE TYPE OF, TRY, ON, SELECT(loop), WITH, PROVIDE
//            CATCH(remember CLEANUP), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
//
// Exits: RETURN, EXIT, ASSERT, RAISE(not RESUMABLE), MESSAGE(type E and A?), CONTINUE, REJECT, RESUME, STOP
//
// Not handled? INCLUDE + malplaced macro calls

export type StatementFlowPath = {
  statements: StatementNode[];
};

export function dumpFlow(flows: StatementFlowPath[]): string {
  const ret = "[" + flows.map(f => "[" + f.statements.map(b => b?.get().constructor.name).join(",") + "]").join(",");
  return ret + "]";
}

function findBody(f: StructureNode): readonly (StatementNode | StructureNode)[] {
  return f.findDirectStructure(Structures.Body)?.getChildren() || [];
}

function removeDuplicates(flows: StatementFlowPath[]): StatementFlowPath[] {
  const result: StatementFlowPath[] = [];
  for (const f of flows) {
    let duplicate = false;
    for (const r of result) {
      if (f.statements.length !== r.statements.length) {
        continue;
      }

      duplicate = true;
      for (let index = 0; index < f.statements.length; index++) {
        if (f.statements[index] !== r.statements[index]) {
          duplicate = false;
          break;
        }
      }
    }
    if (duplicate === false) {
      result.push(f);
    }
  }
  return result;
}

function pruneByStatement(flows: StatementFlowPath[], type: new () => IStatement): StatementFlowPath[] {
  const result: StatementFlowPath[] = [];
  for (const f of flows) {
    const nodes: StatementNode[] = [];
    for (const n of f.statements) {
      nodes.push(n);
      if (n.get() instanceof type) {
        break;
      }
    }
    result.push({statements: nodes});
  }
  return removeDuplicates(result);
}

////////////////////////////////////////////////////////////////

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    const ret: StatementFlowPath[] = [];
    const forms = stru.findAllStructures(Structures.Form);
    for (const f of forms) {
      ret.push(...this.traverseBody(findBody(f)));
    }
    return ret;
  }

  private traverseBody(children: readonly (StatementNode | StructureNode)[]): StatementFlowPath[] {
    let flows: StatementFlowPath[] = [{statements: []}];
    if (children.length === 0) {
      return [];
    }

    for (let i = 0; i < children.length; i++) {
      const c = children[i];
//      console.dir(c);
      if (c.get() instanceof Structures.Normal) {
        const firstChild = c.getFirstChild(); // "Normal" only has one child
        if (firstChild instanceof StatementNode) {
          flows.forEach(f => f.statements.push(firstChild));
//          current.push(firstChild);
//          console.dir("push: " + firstChild.constructor.name);
          if (firstChild.get() instanceof Statements.Check) {
            // todo
            const after = children.slice(i + 1, children.length);
            for (const b of this.traverseBody(after)) {
              for (const f of [...flows]) {
                flows.push({statements: [...f.statements, ...b.statements]});
              }
            }
            break;
          } else if (firstChild.get() instanceof Statements.Exit) {
            break;
          } else if (firstChild.get() instanceof Statements.Return) {
            break;
          }
        } else if(firstChild instanceof StructureNode) {
//          console.dir("firstch: " + firstChild.get().constructor.name);
          const found = this.traverseStructure(firstChild);
//          console.dir("found: " + dump(found));

          const n: StatementFlowPath[] = [];
          for (const existing of flows) {
            for (const fo of found) {
              const add = {statements: [...existing.statements, ...fo.statements]};
              n.push(add);
            }
          }
//          console.dir(dump(n));
          flows = n;
        }
      }
    }

    return flows;
  }

  private traverseStructure(n: StructureNode | undefined): StatementFlowPath[] {
    let flows: StatementFlowPath[] = [];
    if (n === undefined) {
      return flows;
    }

    const type = n.get();
    if (type instanceof Structures.Form) {
      const formst = n.findDirectStatement(Statements.Form)!;
      let bodyFlows = this.traverseBody(findBody(n));
//      console.dir(bodyFlows);
      bodyFlows = bodyFlows.map(a => {return {statements: [formst, ...a.statements]};});
      flows.push(...bodyFlows);
    } else if (type instanceof Structures.Any) {
      for (const c of n.getChildren()) {
//        console.dir("yep");
        if (c instanceof StructureNode && c.get() instanceof Structures.Form) {
          flows.push(...this.traverseStructure(c));
        } else if (c instanceof StructureNode && c.get() instanceof Structures.If) {
          flows.push(...this.traverseStructure(c));
        } else {
          console.dir("any, todo, " + c.constructor.name + ", " + c.get().constructor.name);
        }
      }
    } else if (type instanceof Structures.If) {
      const collect = [n.findDirectStatement(Statements.If)!];
      let bodyFlows = this.traverseBody(findBody(n));
      bodyFlows = bodyFlows.map(b => {return {statements: [...collect, ...b.statements]};});
      flows.push(...bodyFlows);
      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }
        collect.push(elseifst);
        let bodyFlows = this.traverseBody(findBody(e));
        bodyFlows = bodyFlows.map(b => {return {statements: [...collect, ...b.statements]};});
        flows.push(...bodyFlows);
      }
      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        let bodyFlows = this.traverseBody(findBody(els));
        bodyFlows = bodyFlows.map(b => {return {statements: [...collect, elsest, ...b.statements]};});
        flows.push(...bodyFlows);
      } else {
        flows.push({statements: [...collect]});
      }
    } else if (type instanceof Structures.Case) {
      const cas = n.getFirstStatement()!;
      let othersFound = false;
      for (const w of n.findDirectStructures(Structures.When)) {
        const first = w.getFirstStatement();
        if (first === undefined) {
          continue;
        }
        if (first.get() instanceof Statements.WhenOthers) {
          othersFound = true;
        }

        let bodyFlows = this.traverseBody(findBody(w));
        bodyFlows = bodyFlows.map(b => {return {statements: [cas, first, ...b.statements]};});
        flows.push(...bodyFlows);
      }
      if (othersFound === false) {
        flows.push({statements: [cas]});
      }
    } else if (type instanceof Structures.Loop
        || type instanceof Structures.While
        || type instanceof Structures.With
        || type instanceof Structures.Provide
        || type instanceof Structures.Select
        || type instanceof Structures.Do) {
      const loop = n.getFirstStatement()!;
      const bodyFlows = this.traverseBody(findBody(n));
      for (const b of bodyFlows) {
        flows.push({statements: [loop, ...b.statements]});
      }
      for (const b1 of bodyFlows) {
        for (const b2 of bodyFlows) {
          const add = [loop, ...b1.statements, ...b2.statements];
          flows.push({statements: add});
        }
      }
      flows.push({statements: [loop]});
      flows = pruneByStatement(flows, Statements.Exit);
      flows = pruneByStatement(flows, Statements.Continue);
      flows = pruneByStatement(flows, Statements.Return);
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return flows;
  }
}