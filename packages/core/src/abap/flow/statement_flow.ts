import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, (MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE)
//
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH(remember CLEANUP), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
//
// Exits: RETURN, EXIT, RAISE(not RESUMABLE), MESSAGE(type E and A?), CONTINUE, REJECT, RESUME, STOP

// todo: RETURN inside structures?

export type StatementFlowPath = {
  name: string; // todo, this should be the same as scope information
  statements: (StatementNode | undefined)[];
};

function findBody(f: StructureNode): readonly (StatementNode | StructureNode)[] {
  return f.findDirectStructure(Structures.Body)?.getChildren() || [];
//function findBody(f: StructureNode): StructureNode | undefined {
//  return f.findDirectStructure(Structures.Body);
}

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    const ret: StatementFlowPath[] = [];
    const forms = stru.findAllStructures(Structures.Form);
    for (const f of forms) {
      ret.push(...this.traverseBody(findBody(f), "form:name"));
    }
    return ret;
  }

  private traverseBody(children: readonly (StatementNode | StructureNode)[], name: string): StatementFlowPath[] {
    let flows: StatementFlowPath[] = [{name, statements: []}];
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
            for (const b of this.traverseBody(after, name)) {
              for (const f of [...flows]) {
                flows.push({name: b.name, statements: [...f.statements, ...b.statements]});
              }
            }
            break;
          } else if (firstChild.get() instanceof Statements.Return) {
            break;
          }
        } else if(firstChild instanceof StructureNode) {
//          console.dir("firstch: " + firstChild.get().constructor.name);
          const found = this.traverseStructure(firstChild, name);
//          console.dir("found: " + dump(found));

          const n: StatementFlowPath[] = [];
          for (const existing of flows) {
            for (const fo of found) {
              const add = {name, statements: [...existing.statements, ...fo.statements]};
              n.push(add);
            }
          }
//          console.dir(dump(n));
          flows = n;
//          found.forEach(fo => flows.forEach(f => f.statements.push(...fo.statements)));
        }
      }
    }

    return flows;
  }

  private traverseStructure(n: StructureNode | undefined, name: string): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];
    if (n === undefined) {
      return flows;
    }

    const type = n.get();
    if (type instanceof Structures.Form) {
      const formst = n.findDirectStatement(Statements.Form);
      let bodyFlows = this.traverseBody(findBody(n), name + "-form");
//      console.dir(bodyFlows);
      bodyFlows = bodyFlows.map(a => {return {name: a.name, statements: [formst, ...a.statements]};});
      flows.push(...bodyFlows);
    } else if (type instanceof Structures.Any) {
      // TODO TODO
      for (const c of n.getChildren()) {
//        console.dir("yep");
        if (c instanceof StructureNode && c.get() instanceof Structures.Form) {
          flows.push(...this.traverseStructure(c, name));
        } else if (c instanceof StructureNode && c.get() instanceof Structures.If) {
          flows.push(...this.traverseStructure(c, name));
        } else {
          console.dir("any, todo, " + c.constructor.name + ", " + c.get().constructor.name);
        }
      }
    } else if (type instanceof Structures.If) {
      const collect = [n.findDirectStatement(Statements.If)];
      let bodyFlows = this.traverseBody(findBody(n), name + "-if_body");
      bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements]};});
      flows.push(...bodyFlows);
      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }
        collect.push(elseifst);
        let bodyFlows = this.traverseBody(findBody(e), name + "-if_elseif");
        bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements]};});
        flows.push(...bodyFlows);
      }
      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        let bodyFlows = this.traverseBody(findBody(els), name + "-if_else");
        bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, elsest, ...b.statements]};});
        flows.push(...bodyFlows);
      } else {
        flows.push({name: name + "-if_no", statements: [...collect]});
      }
    } else if (type instanceof Structures.Loop) {
      const loop = n.findDirectStatement(Statements.Loop);
      const bodyFlows = this.traverseBody(findBody(n), name + "-loop_body");
      for (const b of bodyFlows) {
        flows.push({name: name + "-loop1", statements: [loop, ...b.statements]});
      }
      for (const b1 of bodyFlows) {
        for (const b2 of bodyFlows) {
          flows.push({name: name + "-loop2", statements: [loop, ...b1.statements, ...b2.statements]});
        }
      }
      flows.push({name: name + "-loop", statements: [loop]});
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return flows;
  }
}