import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, (MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE)
//
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH(remember CLEANUP), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
//
// Exits: RETURN, EXIT, ASSERT, RAISE(not RESUMABLE), MESSAGE(type E and A?), CONTINUE, REJECT, RESUME, STOP

// todo: RETURN inside structures?

export type StatementFlowPath = {
  statements: StatementNode[];
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
//          found.forEach(fo => flows.forEach(f => f.statements.push(...fo.statements)));
        }
      }
    }

    return flows;
  }

  private traverseStructure(n: StructureNode | undefined): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];
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
      // TODO TODO
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
    } else if (type instanceof Structures.Loop) {
      const loop = n.findDirectStatement(Statements.Loop)!;
      const bodyFlows = this.traverseBody(findBody(n));
      for (const b of bodyFlows) {
        flows.push({statements: [loop, ...b.statements]});
      }
      for (const b1 of bodyFlows) {
        for (const b2 of bodyFlows) {
          flows.push({statements: [loop, ...b1.statements, ...b2.statements]});
        }
      }
      flows.push({statements: [loop]});
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return flows;
  }
}