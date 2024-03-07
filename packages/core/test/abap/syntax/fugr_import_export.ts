import {expect} from "chai";
import {runMulti} from "./syntax";

describe("syntax.ts, function module same import and export name", () => {

  it("function module same import and export name", () => {
    const xml =
      `<?xml version="1.0" encoding="utf-8"?>
      <abapGit version="v1.0.0" serializer="LCL_OBJECT_FUGR" serializer_version="v1.0.0">
       <asx:abap xmlns:asx="http://www.sap.com/abapxml" version="1.0">
        <asx:values>
         <AREAT>sdfsd</AREAT>
         <INCLUDES>
          <SOBJ_NAME>LZDFSTOP</SOBJ_NAME>
          <SOBJ_NAME>SAPLZDFS</SOBJ_NAME>
         </INCLUDES>
         <FUNCTIONS>
          <item>
           <FUNCNAME>ZSDFSD</FUNCNAME>
           <SHORT_TEXT>sdf</SHORT_TEXT>
           <IMPORT>
            <RSIMP>
             <PARAMETER>SDF</PARAMETER>
             <TYP>I</TYP>
            </RSIMP>
           </IMPORT>
           <EXPORT>
            <RSEXP>
             <PARAMETER>SDF</PARAMETER>
             <TYP>I</TYP>
            </RSEXP>
           </EXPORT>
           <DOCUMENTATION>
            <RSFDO>
             <PARAMETER>SDF</PARAMETER>
             <KIND>P</KIND>
            </RSFDO>
            <RSFDO>
             <PARAMETER>SDF</PARAMETER>
             <KIND>P</KIND>
            </RSFDO>
           </DOCUMENTATION>
          </item>
         </FUNCTIONS>
        </asx:values>
       </asx:abap>
      </abapGit>`;

    const code = `FUNCTION zsdfsd.
    *"----------------------------------------------------------------------
    *"*"Local Interface:
    *"  IMPORTING
    *"     VALUE(SDF) TYPE  I
    *"  EXPORTING
    *"     VALUE(SDF) TYPE  I
    *"----------------------------------------------------------------------

    ENDFUNCTION.`;

    const abap1 = `*******************************************************************
*   System-defined Include-files.                                 *
*******************************************************************
  INCLUDE LZDFSTOP.                          " Global Declarations
  INCLUDE LZDFSUXX.                          " Function Modules

*******************************************************************
*   User-defined Include-files (if necessary).                    *
*******************************************************************
* INCLUDE LZDFSF...                          " Subroutines
* INCLUDE LZDFSO...                          " PBO-Modules
* INCLUDE LZDFSI...                          " PAI-Modules
* INCLUDE LZDFSE...                          " Events
* INCLUDE LZDFSP...                          " Local class implement.
* INCLUDE LZDFST99.                          " ABAP Unit tests`;

    const abap2 = `FUNCTION-POOL ZDFS.                         "MESSAGE-ID ..

* INCLUDE LZDFSD...                          " Local class definition`;

    const issues = runMulti([
      {filename: "zdfs.fugr.xml", contents: xml},
      {filename: "zdfs.fugr.saplzdfs.abap", contents: abap1},
      {filename: "zdfs.fugr.lzdfstop.abap", contents: abap2},
      {filename: "zdfs.fugr.zsdfsd.abap", contents: code}]);
    expect(issues.length).to.equals(0);
  });

});