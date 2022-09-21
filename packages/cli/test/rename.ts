import {expect} from "chai";
import * as memfs from "memfs";
import {MemoryFile, Registry} from "@abaplint/core";
import {Rename} from "../src/rename";

describe("Apply rename", () => {

  it.only("test 1", async () => {
    const intf = `INTERFACE zif_intf PUBLIC.
  TYPES: BEGIN of ty,
           sdfsdf TYPE i,
         END OF ty.
ENDINTERFACE.`;

    const clas = `CLASS zcl_clas DEFINITION PUBLIC FINAL CREATE PUBLIC.
  PUBLIC SECTION.
    METHODS foo IMPORTING field TYPE zif_intf=>ty.
ENDCLASS.
CLASS zcl_clas IMPLEMENTATION.
  METHOD foo.
  ENDMETHOD.
ENDCLASS.`;

    const file1 = new MemoryFile("zif_intf.intf.abap", intf);
    const file2 = new MemoryFile("zcl_clas.clas.abap", clas);
    const reg = new Registry().addFiles([file1, file2]).parse();

    const jsonFiles: any = {};
    jsonFiles[file1.getFilename()] = file1.getRaw();
    jsonFiles[file2.getFilename()] = file2.getRaw();

    const volume = memfs.Volume.fromJSON(jsonFiles);
    const mockFS = memfs.createFsFromVolume(volume);
    // patch rmSync in, https://github.com/streamich/fs-monkey/issues/320
    mockFS.rmSync = function (name: string) {
      volume.rmSync(name);
    };

    const config = reg.getConfig().get();
    config.rename = {"patterns": [{"type": "CLAS|INTF", "oldName": "zif_intf", "newName": "yif_sdfsdf"}]};

    new Rename(reg).run(config, "base", mockFS, true);

    const intfNew = mockFS.readFileSync("yif_sdfsdf.intf.abap").toString();
    expect(intfNew).to.include("INTERFACE yif_sdfsdf");
    const clasNew = mockFS.readFileSync(file2.getFilename()).toString();
    expect(clasNew).to.include("TYPE yif_sdfsdf=>");
  });

});