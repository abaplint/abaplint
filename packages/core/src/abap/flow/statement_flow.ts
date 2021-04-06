import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
// Exits: RETURN, EXIT, RAISE, MESSAGE, CONTINUE, REJECT, RESUME, STOP

// positive paths listed first

export type StatementFlowPath = {
  name: string;
  statements: (StatementNode | undefined)[];
};

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    return this.traverseStructure(stru, "top");
  }

  private traverseBody(n: StructureNode | undefined, name: string): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];
    const current: StatementNode[] = [];
    if (n === undefined) {
      return flows;
    }

    for (const c of n.getChildren()) {
      const type = c.get();
      if (type instanceof Structures.Normal) {
        const firstChild = c.getFirstChild();
        if (firstChild instanceof StatementNode) {
          current.push(firstChild);
          if (firstChild.get() instanceof Statements.Check) {
            flows.push({name: name, statements: [...current]});
          } else if (firstChild.get() instanceof Statements.Return) {
            break;
          }
        } else if(firstChild instanceof StructureNode) {
          const found = this.traverseStructure(firstChild, name);
          console.dir(found);
          flows.push(...found);
        }
      }
    }

    flows.push({name: name, statements: current});
    return flows;
  }

  private traverseStructure(n: StructureNode | undefined, name: string): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];
    if (n === undefined) {
      return flows;
    }

    for (const c of n.getChildren()) {
      if (c instanceof StatementNode) {
        flows.push({name, statements: [c]});
      } else {
        const type = c.get();
        if (type instanceof Structures.Normal) {
          flows.push(...this.traverseStructure(c, name));
        } else if (type instanceof Structures.Form) {
          const formst = c.findDirectStatement(Statements.Form);
          let bodyFlows = this.traverseBody(c.findDirectStructure(Structures.Body), name + "-form");
          bodyFlows = bodyFlows.map(a => {return {name: a.name, statements: [formst, ...a.statements]};});
          flows.push(...bodyFlows);
        } else if (type instanceof Structures.If) {
          const collect = [c.findDirectStatement(Statements.If)];

          const body = c.findDirectStructure(Structures.Body);
          if (body) {
            let bodyFlows = this.traverseBody(body, name + "-if_body");
            bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements]};});
            flows.push(...bodyFlows);
          } else {
            flows.push({name: name + "-if_emptybody", statements: [...collect]});
          }

          for (const e of c.findDirectStructures(Structures.ElseIf)) {
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

          const els = c.findDirectStructure(Structures.Else);
          const elsest = els?.findDirectStatement(Statements.Else);
          if (els && elsest) {
            const body = els.findDirectStructure(Structures.Body);
            let bodyFlows = this.traverseStructure(body, name + "-if_else");
            bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, elsest, ...b.statements]};});
            flows.push(...bodyFlows);
          } else {
            flows.push({name: name + "-if_no", statements: [...collect]});
          }
        } else {
          console.dir("todo, " + c.get().constructor.name);
        }
      }
    }

    return flows;
  }
}