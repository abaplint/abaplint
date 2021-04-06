import {StatementNode, StructureNode} from "../nodes";
import * as Structures from "../3_structures/structures";
import * as Statements from "../2_statements/statements";

// Levels: top, FORM, METHOD, FUNCTION-MODULE, MODULE, AT, END-OF-*, GET, START-OF-SELECTION, TOP-OF-PAGE
// Branching: IF, LOOP, DO, WHILE, CASE, TRY, ON, SELECT(loop), CATCH SYSTEM-EXCEPTIONS, AT, CHECK, PROVIDE
// Exits: RETURN, EXIT, RAISE, MESSAGE, CONTINUE, REJECT, RESUME, STOP

// all statements must be part of a flow
// positive paths listed first

export type StatementFlowPath = {
  name: string;
  statements: (StatementNode | undefined)[];
};

export class StatementFlow {
  public build(stru: StructureNode): StatementFlowPath[] {
    return this.traverseStructure(stru, "top");
  }

  private traverseStructure(n: StructureNode | undefined, name: string): StatementFlowPath[] {
    const flows: StatementFlowPath[] = [];
    if (n === undefined) {
      return flows;
    }

    for (const c of n.getChildren()) {
      const type = c.get();
      if (c instanceof StatementNode) {
        flows.push({name, statements: [c]});
      } else {
        if (type instanceof Structures.Normal) {
          flows.push(...this.traverseStructure(c, name));
        } else if (type instanceof Structures.Form) {
          const res = this.traverseStructure(c, name + "-form").map(a => a.statements);
          const flat = res.reduce((acc, val) => acc.concat(val), []);
          flows.push({name: name + "-form", statements: flat});
        } else if (type instanceof Structures.If) {
          const collect = [c.findDirectStatement(Statements.If)];
          const endif = c.findDirectStatement(Statements.EndIf);

          const body = c.findDirectStructure(Structures.Body);
          if (body) {
            let bodyFlows = this.traverseStructure(body, name + "-if_body");
            bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements, endif]};});
            flows.push(...bodyFlows);
          } else {
            flows.push({name: name + "-if_emptybody", statements: [...collect, endif]});
          }

          for (const e of c.findDirectStructures(Structures.ElseIf)) {
            const elseifst = e.findDirectStatement(Statements.ElseIf);
            if (elseifst === undefined) {
              continue;
            }
            collect.push(elseifst);
            const body = e.findDirectStructure(Structures.Body);
            let bodyFlows = this.traverseStructure(body, name + "-if_elseif");
            bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, ...b.statements, endif]};});
            flows.push(...bodyFlows);
          }

          const els = c.findDirectStructure(Structures.Else);
          const elsest = els?.findDirectStatement(Statements.Else);
          if (els && elsest) {
            const body = els.findDirectStructure(Structures.Body);
            let bodyFlows = this.traverseStructure(body, name + "-if_else");
            bodyFlows = bodyFlows.map(b => {return {name: b.name, statements: [...collect, elsest, ...b.statements, endif]};});
            flows.push(...bodyFlows);
          } else {
            flows.push({name: name + "-if_no", statements: [...collect, endif]});
          }
        } else {
          console.dir("todo, " + c.get().constructor.name);
        }
      }
    }

    return flows;
  }
}