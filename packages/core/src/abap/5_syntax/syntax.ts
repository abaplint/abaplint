import * as Statements from "../2_statements/statements";
import * as Structures from "../3_structures/structures";
import {Issue} from "../../issue";
import {INode} from "../nodes/_inode";
import {Token} from "../1_lexer/tokens/_token";
import {StatementNode, StructureNode} from "../nodes";
import {ABAPFile} from "../../files";
import {IRegistry} from "../../_iregistry";
import {ABAPObject} from "../../objects/_abap_object";
import {CurrentScope} from "./_current_scope";
import {ScopeType} from "./_scope_type";
import {ObjectOriented} from "./_object_oriented";
import {Procedural} from "./_procedural";
import {Inline} from "./_inline";
import {Program} from "../../objects";
import {Position} from "../../position";

import {Perform} from "./statements/perform";
import {Type} from "./statements/type";
import {Constant} from "./statements/constant";
import {Static} from "./statements/static";
import {Data as DataStatement} from "./statements/data";
import {Parameter} from "./statements/parameter";
import {FieldSymbol} from "./statements/fieldsymbol";
import {Tables} from "./statements/tables";
import {SelectOption} from "./statements/selectoption";
import {InterfaceDeferred} from "./statements/interface_deferred";
import {ClassDeferred} from "./statements/class_deferred";
import {Call} from "./statements/call";
import {ClassImplementation} from "./statements/class_implementation";
import {MethodImplementation} from "./statements/method_implementation";
import {Move} from "./statements/move";
import {Catch} from "./statements/catch";
import {Loop} from "./statements/loop";
import {ReadTable} from "./statements/read_table";
import {Select} from "./statements/select";
import {InsertInternal} from "./statements/insert_internal";
import {Split} from "./statements/split";
import {Assign} from "./statements/assign";
import {Convert} from "./statements/convert";
import {Describe} from "./statements/describe";
import {Find} from "./statements/find";
import {Message} from "./statements/message";
import {GetTime} from "./statements/get_time";
import {GetParameter} from "./statements/get_parameter";
import {WhenType} from "./statements/when_type";
import {If} from "./statements/if";
import {ElseIf} from "./statements/else_if";
import {Append} from "./statements/append";
import {SelectionScreen} from "./statements/selection_screen";
import {Ranges} from "./statements/ranges";

import {Data as DataStructure} from "./structures/data";
import {TypeEnum} from "./structures/type_enum";
import {Types} from "./structures/types";
import {Statics} from "./structures/statics";
import {Constants} from "./structures/constants";

import {ClassDefinition} from "../types/class_definition";
import {InterfaceDefinition} from "../types/interface_definition";
import {ISyntaxResult} from "./_spaghetti_scope";
import {Write} from "./statements/write";

export class SyntaxLogic {
  private currentFile: ABAPFile;
  private issues: Issue[];

  private readonly object: ABAPObject;
  private readonly reg: IRegistry;

  private readonly scope: CurrentScope;

  private readonly helpers: {
    oooc: ObjectOriented,
    proc: Procedural,
    inline: Inline,
  };

  public constructor(reg: IRegistry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.scope = CurrentScope.buildDefault(this.reg);

    this.helpers = {
      oooc: new ObjectOriented(this.scope),
      proc: new Procedural(this.reg, this.scope),
      inline: new Inline(this.scope),
    };
  }

  public run(): ISyntaxResult {
    if (this.object.syntaxResult !== undefined) {
      return this.object.syntaxResult;
    }

    this.issues = [];

    if (this.object instanceof Program && this.object.isInclude()) {
// todo, show some kind of error?
      return {issues: [], spaghetti: this.scope.pop()};
    }

    this.traverseObject();

    for (;;) {
      const spaghetti = this.scope.pop(); // pop built-in scopes
      if (spaghetti.getTop().getIdentifier().stype === ScopeType.BuiltIn) {
        const result: ISyntaxResult = {issues: this.issues, spaghetti};
        this.object.syntaxResult = result;
        return result;
      }
    }

  }

/////////////////////////////

  private traverseObject(): CurrentScope {
    const traversal = this.object.getSequencedFiles();

    const main = this.object.getMainABAPFile();
    if (main !== undefined) {
      this.helpers.proc.addAllFormDefinitions(main, this.object);
    }

    if (this.object instanceof Program && main !== undefined) {
      // todo, this seems like a hack?
      this.scope.push(ScopeType.Program,
                      this.object.getName(),
                      new Position(1, 1),
                      main.getFilename());
    }

    for (const file of traversal) {
      this.currentFile = file;
      const structure = this.currentFile.getStructure();
      if (structure === undefined) {
        return this.scope;
      } else if (structure.get() instanceof Structures.Interface) {
        // special case for global interfaces, todo, look into if the case can be removed
        try {
          this.updateScopeStructure(structure);
        } catch (e) {
          this.newIssue(structure.getFirstToken(), e.message);
          break;
        }
      } else {
        this.traverse(structure);
      }
    }

    return this.scope;
  }

  private newIssue(token: Token, message: string): void {
    const issue = Issue.atToken(this.currentFile, token, message, "check_syntax");
    this.issues.push(issue);
  }

  private traverse(node: INode): void {
    if (node instanceof StatementNode) {
      this.helpers.inline.addReadWriteReferences(node, this.currentFile.getFilename());
    }

    for (const child of node.getChildren()) {
      try {
        if (child instanceof StructureNode) {
          const gotoNext = this.updateScopeStructure(child);
          if (gotoNext === true) {
            continue;
          }
        } else if (child instanceof StatementNode) {
          this.updateScopeStatement(child);
        }
      } catch (e) {
        this.newIssue(child.getFirstToken(), e.message);
        break;
      }

      // walk into INCLUDEs
      if (child instanceof StatementNode && child.get() instanceof Statements.Include) {
        const file = this.helpers.proc.findInclude(child, this.object);
        if (file !== undefined && file.getStructure() !== undefined) {
          const old = this.currentFile;
          this.currentFile = file;
          this.traverse(file.getStructure()!);
          this.currentFile = old;
        }
      }

      this.traverse(child);
    }
  }

  // if this returns true, then the traversal should continue with next child
  private updateScopeStructure(node: StructureNode): boolean {
    const filename = this.currentFile.getFilename();
    const stru = node.get();
    if (stru instanceof Structures.ClassDefinition) {
      this.scope.addClassDefinition(new ClassDefinition(node, filename, this.scope));
      return true;
    } else if (stru instanceof Structures.Interface) {
      this.scope.addInterfaceDefinition(new InterfaceDefinition(node, filename, this.scope));
      return true;
    } else if (stru instanceof Structures.Types) {
      this.scope.addType(new Types().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.Constants) {
      this.scope.addIdentifier(new Constants().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.Data) {
      this.scope.addIdentifier(new DataStructure().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.Statics) {
      this.scope.addIdentifier(new Statics().runSyntax(node, this.scope, filename));
      return true;
    } else if (stru instanceof Structures.TypeEnum) {
      this.scope.addList(new TypeEnum().runSyntax(node, this.scope, filename));
      return true;
    }
    return false;
  }

// todo, yes, this will have to be refactored
  private updateScopeStatement(node: StatementNode): void {
    const filename = this.currentFile.getFilename();
    const s = node.get();
    if (s instanceof Statements.Type) {
      this.scope.addType(new Type().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Constant) {
      this.scope.addIdentifier(new Constant().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Static) {
      this.scope.addIdentifier(new Static().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Data) {
      this.scope.addIdentifier(new DataStatement().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Parameter) {
      this.scope.addIdentifier(new Parameter().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.FieldSymbol) {
      this.scope.addIdentifier(new FieldSymbol().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.Tables) {
      this.scope.addIdentifier(new Tables().runSyntax(node, this.scope, filename));
    } else if (s instanceof Statements.SelectOption) {
      this.scope.addIdentifier(new SelectOption().runSyntax(node, this.scope, filename));

    } else if (s instanceof Statements.InterfaceDeferred) {
      new InterfaceDeferred().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ClassDeferred) {
      new ClassDeferred().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Perform) {
      new Perform().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Call) {
      new Call().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ClassImplementation) {
      new ClassImplementation().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Method) {
      new MethodImplementation().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Move) {
      new Move().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Catch) {
      new Catch().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Loop) {
      new Loop().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ReadTable) {
      new ReadTable().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Select) {
      new Select().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.InsertInternal) {
      new InsertInternal().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Split) {
      new Split().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Assign) {
      new Assign().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Convert) {
      new Convert().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Describe) {
      new Describe().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Find) {
      new Find().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Message) {
      new Message().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetTime) {
      new GetTime().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetParameter) {
      new GetParameter().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.WhenType) {
      new WhenType().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.If) {
      new If().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ElseIf) {
      new ElseIf().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Append) {
      new Append().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Write) {
      new Write().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SelectionScreen) {
      new SelectionScreen().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Ranges) {
      new Ranges().runSyntax(node, this.scope, filename);

    } else if (s instanceof Statements.Form) {
      this.helpers.proc.findFormScope(node, filename);
    } else if (s instanceof Statements.FunctionModule) {
      this.helpers.proc.findFunctionScope(this.object, node, filename);

    } else if (s instanceof Statements.EndMethod) {
      this.scope.pop();
    } else if (s instanceof Statements.EndForm
        || s instanceof Statements.EndFunction
        || s instanceof Statements.EndClass) {
      this.scope.pop();
    }
  }

}