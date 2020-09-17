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
import {Program} from "../../objects";
import {Position} from "../../position";
import {Data as DataStructure} from "./structures/data";
import {TypeEnum} from "./structures/type_enum";
import {Types} from "./structures/types";
import {Statics} from "./structures/statics";
import {Constants} from "./structures/constants";
import {ClassDefinition} from "../types/class_definition";
import {InterfaceDefinition} from "../types/interface_definition";
import {ISyntaxResult} from "./_spaghetti_scope";

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
import {Write} from "./statements/write";
import {Case} from "./statements/case";
import {CreateObject} from "./statements/create_object";
import {Do} from "./statements/do";
import {Concatenate} from "./statements/concatenate";
import {CallFunction} from "./statements/call_function";
import {Clear} from "./statements/clear";
import {Replace} from "./statements/replace";
import {GetBit} from "./statements/get_bit";
import {Raise} from "./statements/raise";
import {DeleteInternal} from "./statements/delete_internal";
import {Receive} from "./statements/receive";
import {When} from "./statements/when";
import {CreateData} from "./statements/create_data";
import {CallTransformation} from "./statements/call_transformation";
import {GetLocale} from "./statements/get_locale";
import {SetLocale} from "./statements/set_locale";
import {Sort} from "./statements/sort";
import {ReadReport} from "./statements/read_report";
import {AuthorityCheck} from "./statements/authority_check";
import {InsertReport} from "./statements/insert_report";
import {GetReference} from "./statements/get_reference";
import {InsertDatabase} from "./statements/insert_database";
import {DeleteDatabase} from "./statements/delete_database";
import {ImportDynpro} from "./statements/import_dynpro";
import {SyntaxCheck} from "./statements/syntax_check";
import {Import} from "./statements/import";
import {Export} from "./statements/export";
import {Scan} from "./statements/scan";
import {Submit} from "./statements/submit";
import {OpenDataset} from "./statements/open_dataset";
import {CloseDataset} from "./statements/close_dataset";
import {GetRunTime} from "./statements/get_run_time";
import {UpdateDatabase} from "./statements/update_database";
import {Add} from "./statements/add";
import {Subtract} from "./statements/subtract";
import {AddCorresponding} from "./statements/add_corresponding";
import {SubtractCorresponding} from "./statements/subtract_corresponding";
import {Multiply} from "./statements/multiply";
import {Divide} from "./statements/divide";
import {Condense} from "./statements/condense";
import {Controls} from "./statements/controls";
import {While} from "./statements/while";
import {SelectLoop} from "./statements/select_loop";
import {Check} from "./statements/check";
import {LogPoint} from "./statements/log_point";
import {Severity} from "../../severity";

export class SyntaxLogic {
  private currentFile: ABAPFile;
  private issues: Issue[];

  private readonly object: ABAPObject;
  private readonly reg: IRegistry;

  private readonly scope: CurrentScope;

  private readonly helpers: {
    oooc: ObjectOriented,
    proc: Procedural,
  };

  public constructor(reg: IRegistry, object: ABAPObject) {
    this.reg = reg;
    this.issues = [];

    this.object = object;
    this.scope = CurrentScope.buildDefault(this.reg);

    this.helpers = {
      oooc: new ObjectOriented(this.scope),
      proc: new Procedural(this.reg, this.scope),
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
    const issue = Issue.atToken(this.currentFile, token, message, "check_syntax", Severity.Error);
    this.issues.push(issue);
  }

  private traverse(node: INode): void {
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
    } else if (s instanceof Statements.Replace) {
      new Replace().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Catch) {
      new Catch().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Loop) {
      new Loop().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Submit) {
      new Submit().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ReadTable) {
      new ReadTable().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SyntaxCheck) {
      new SyntaxCheck().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Import) {
      new Import().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Export) {
      new Export().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Scan) {
      new Scan().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Split) {
      new Split().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.CallFunction) {
      new CallFunction().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.DeleteInternal) {
      new DeleteInternal().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Clear) {
      new Clear().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Receive) {
      new Receive().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetBit) {
      new GetBit().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Select) {
      new Select().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.InsertInternal) {
      new InsertInternal().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Assign) {
      new Assign().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SetLocale) {
      new SetLocale().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Convert) {
      new Convert().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Controls) {
      new Controls().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.When) {
      new When().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.InsertDatabase) {
      new InsertDatabase().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.DeleteDatabase) {
      new DeleteDatabase().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.UpdateDatabase) {
      new UpdateDatabase().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Sort) {
      new Sort().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Condense) {
      new Condense().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.OpenDataset) {
      new OpenDataset().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.CloseDataset) {
      new CloseDataset().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ReadReport) {
      new ReadReport().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Do) {
      new Do().runSyntax(node, this.scope, filename);
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
    } else if (s instanceof Statements.LogPoint) {
      new LogPoint().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.While) {
      new While().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.CallTransformation) {
      new CallTransformation().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetLocale) {
      new GetLocale().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetReference) {
      new GetReference().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ElseIf) {
      new ElseIf().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.GetRunTime) {
      new GetRunTime().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.CreateObject) {
      new CreateObject().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.ImportDynpro) {
      new ImportDynpro().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.CreateData) {
      new CreateData().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Case) {
      new Case().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Raise) {
      new Raise().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Concatenate) {
      new Concatenate().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Append) {
      new Append().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SelectLoop) {
      new SelectLoop().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Write) {
      new Write().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.AuthorityCheck) {
      new AuthorityCheck().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.InsertReport) {
      new InsertReport().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SelectionScreen) {
      new SelectionScreen().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Ranges) {
      new Ranges().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Add) {
      new Add().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Subtract) {
      new Subtract().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.AddCorresponding) {
      new AddCorresponding().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.SubtractCorresponding) {
      new SubtractCorresponding().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Multiply) {
      new Multiply().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Divide) {
      new Divide().runSyntax(node, this.scope, filename);
    } else if (s instanceof Statements.Check) {
      new Check().runSyntax(node, this.scope, filename);


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