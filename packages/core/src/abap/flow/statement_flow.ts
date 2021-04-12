import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
// Exits: RETURN, EXIT, RAISE, MESSAGE, CONTINUE, REJECT, RESUME, STOP

// positive paths listed first

/** good for debugging, and used in unit tests */
export function dump(flows: StatementFlowPath[]): string {
  const ret = "[" + flows.map(f => "[" + f.statements.map(b => b?.get().constructor.name).join(",") + "]").join(",");
  return ret + "]";
}

export type StatementFlowPath = {
  name: string;
  statements: (StatementNode | undefined)[];
};

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    return this.traverseStructure(stru, "top");
  }

  private traverseBody(n: StructureNode | undefined, name: string): StatementFlowPath[] {
    let flows: StatementFlowPath[] = [{name, statements: []}];
    if (n === undefined) {
      return flows;
    }

//    console.dir("input: " + n.get().constructor.name);
    for (const c of n.getChildren()) {
      const type = c.get();
      if (type instanceof Structures.Normal) {
        const firstChild = c.getFirstChild();
        if (firstChild instanceof StatementNode) {
          flows.forEach(f => f.statements.push(firstChild));
//          current.push(firstChild);
          console.dir("push: " + firstChild.constructor.name);

          if (firstChild.get() instanceof Statements.Check) {
//            flows.push({name: name, statements: [...current]});
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
      let bodyFlows = this.traverseBody(n.findDirectStructure(Structures.Body), name + "-form");
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
      const body = n.findDirectStructure(Structures.Body);
      if (body) {
        let bodyFlows = this.traverseBody(body, name + "-if_body");
        bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements]};});
        flows.push(...bodyFlows);
      } else {
        flows.push({name: name + "-if_emptybody", statements: [...collect]});
      }
      for (const e of n.findDirectStructures(Structures.ElseIf)) {
        const elseifst = e.findDirectStatement(Statements.ElseIf);
        if (elseifst === undefined) {
          continue;
        }
        collect.push(elseifst);
        const body = e.findDirectStructure(Structures.Body);
        let bodyFlows = this.traverseBody(body, name + "-if_elseif");
        bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements]};});
        flows.push(...bodyFlows);
      }
      const els = n.findDirectStructure(Structures.Else);
      const elsest = els?.findDirectStatement(Statements.Else);
      if (els && elsest) {
        const body = els.findDirectStructure(Structures.Body);
        let bodyFlows = this.traverseBody(body, name + "-if_else");
        bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, elsest, ...b.statements]};});
        flows.push(...bodyFlows);
      } else {
        flows.push({name: name + "-if_no", statements: [...collect]});
      }
    } else {
      console.dir("todo, " + n.get().constructor.name);
    }

    return flows;
  }
}