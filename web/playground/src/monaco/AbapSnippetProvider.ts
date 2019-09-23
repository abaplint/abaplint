import * as monaco from "monaco-editor";

export class AbapSnippetProvider implements monaco.languages.CompletionItemProvider {
  public triggerCharacters?: string[] | undefined;

  public provideCompletionItems(
        model: monaco.editor.ITextModel,
        position: monaco.Position,
        context: monaco.languages.CompletionContext,
        token: monaco.CancellationToken): any {

    const suggestions: any[] = [
      {
        label: "method",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Empty method implementation",
        insertText: "METHOD ${1:method_name}.\r\n\t$0\r\nENDMETHOD.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "tbo",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Type definition (types begin of)",
        insertText: "TYPES BEGIN OF ${1:type_name},\r\n\tcomponent TYPE string,\r\nEND OF ${1:type_name}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "bool",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "abap_bool",
        insertText: "abap_bool",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "true",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "abap_true",
        insertText: "abap_true",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "false",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "abap_false",
        insertText: "abap_false",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "imp",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "importing parameter",
        insertText: "IMPORTING\r\n\t$0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "exp",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "exporting parameter",
        insertText: "EXPORTING\r\n\t$0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "cha",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "changing parameter",
        insertText: "CHANGING\r\n\t$0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ret",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "returning parameter",
        insertText: "RETURNING VALUE(${1:name}) TYPE $0.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "trycatch",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Try/Catch block",
        insertText: "TRY.\r\n\t${TM_SELECTED_TEXT}$0\r\n\tCATCH cx_root INTO DATA(cx).\r\n\t\" handle error\r\nENDTRY.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "alias",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Interface method alias",
        insertText: "${1:method_name} FOR ${2:if_name}~${1:method_name},",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "trt",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Type ref to",
        insertText: "TYPE REF TO $0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "tt",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "General table snippet",
        insertText: "TYPE ${1|STANDARD,SORTED,HASHED|} TABLE OF ${2:type} WITH ${3|UNIQUE,NON-UNIQUE|} KEY ${4:table_line}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ttt",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Standard table definition",
        insertText: "TYPE STANDARD TABLE OF ${1:type} WITH KEY ${2:table_line}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "tst",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Sorted table definition",
        insertText: "TYPE SORTED TABLE OF ${1:type} WITH UNIQUE KEY ${2:table_line}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "tht",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Hashed table definition",
        insertText: "TYPE HASHED TABLE OF ${1:type} WITH UNIQUE KEY ${2:table_line}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ii",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Is initial",
        insertText: "IS INITIAL",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ini",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Is not initial",
        insertText: "IS NOT INITIAL",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ib",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Is bound",
        insertText: "IS BOUND",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "inb",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Is not bound",
        insertText: "IS NOT BOUND",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "loop",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Loop into data",
        insertText: "LOOP AT ${1:itab} INTO DATA(x).\r\n\t$0\r\nENDLOOP.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "loopfs",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Loop into field symbol",
        insertText: "LOOP AT ${1:itab} ASSIGNING FIELD-SYMBOL(<x>).\r\n\t$0\r\nENDLOOP.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "assert",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Assert (ABAP Unit)",
        insertText: "cl_abap_unit_assert=>$0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "if",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "IF block",
        insertText: "IF ${1:log_exp}.\r\n\t${TM_SELECTED_TEXT}$0\r\nENDIF.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "cond",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "COND expression",
        insertText: "COND #( WHEN ${1:log_exp}\r\n\tTHEN ${2:abap_true}\r\n\tELSE ${3:abap_false} )",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "forw",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "FOR expression with where clause",
        insertText: "FOR x IN ${1:itab} WHERE ( ${2:cond} )\r\n\t( x$0 )",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "for",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "FOR expression",
        insertText: "FOR x IN ${1:itab}\r\n\t( x$0 )",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "value",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "VALUE expression",
        insertText: "VALUE ${1:#}( $0 )",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "var",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Variable declaration (inline data style)",
        insertText: "DATA(${1:x}) = $0.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "data",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Variable declaration (legacy style)",
        insertText: "DATA: ${1:x} $0",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "class",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Class declaration",
        insertText: `CLASS $\{1:class_name\} DEFINITION PUBLIC FINAL.
\tPUBLIC SECTION.
\t$0
ENDCLASS.

CLASS $\{1:class_name\} IMPLEMENTATION.
ENDCLASS.
          `,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "case",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Case block",
        insertText: `CASE $\{1:var_name\}.
\tWHEN $\{2:value\}.
\t\t$\{TM_SELECTED_TEXT\}$0
\tWHEN OTHERS.
ENDCASE.`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "throw",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Raise exception new",
        insertText: "RAISE EXCEPTION NEW ${1:cx_type}( $2 ).",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ro",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Read-only",
        insertText: "READ-ONLY.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "this",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "me->",
        insertText: "me->",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "self",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "me->",
        insertText: "me->",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "gwt",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Test method template (given-when-then)",
        insertText: `METHOD test.
\t" given
\t$0
\t" when
\t" then
ENDMETHOD.`,
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "ctor",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Constructor definition",
        insertText: "METHODS constructor.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "cctor",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Class constructor definition",
        insertText: "CLASS-METHODS class_constructor.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
      {
        label: "enum",
        kind: monaco.languages.CompletionItemKind.Snippet,
        documentation: "Enum definition",
        insertText: "TYPES:\r\n\tBEGIN OF ENUM ${1:enum_name},\r\n\t\t${2:value},\r\n\tEND OF ENUM ${1:enum_name}.",
        insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet,
      },
    ];
    return {
      suggestions: suggestions,
    };
  }
}
