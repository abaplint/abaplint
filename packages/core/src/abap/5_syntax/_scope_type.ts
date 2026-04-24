export enum ScopeType {
  BuiltIn = "_builtin",
  Dummy = "_dummy",
  // definitions inside this one are local
  SelectionEvent = "selection_event",
  Global = "_global",
  Program = "_program",
  TypePool = "_type_pool",
  FunctionGroup = "_function_group",

  ClassDefinition = "class_definition",
  Interface = "interface",
  ClassImplementation = "class_implementation",
  Form = "form",
  FunctionModule = "function",
  Method = "method",
  MethodInstance = "method_instance",
  MethodDefinition = "method_definition",
  For = "for",
  Let = "let",
  OpenSQL = "open_sql",
}
