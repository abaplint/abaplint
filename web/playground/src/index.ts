// @ts-ignore
self.MonacoEnvironment = {
  globalAPI: true,
  getWorker: function (_moduleId: string, label: string) {
    if (label === "json") {
      // @ts-ignore
      return new Worker(new URL("monaco-editor/esm/vs/language/json/json.worker.js", import.meta.url));
    }
    // @ts-ignore
    return new Worker(new URL("monaco-editor/esm/vs/editor/editor.worker.js", import.meta.url));
  },
};

import "../node_modules/@phosphor/default-theme/style/index.css";
import "./index.less";
import "../public/img/favicon-16x16.png";
import "../public/img/favicon-32x32.png";
import schema from "../../../packages/core/scripts/schema.json";
import * as monaco from "monaco-editor";
import {BoxPanel, DockPanel, Widget} from "@phosphor/widgets";
import {WelcomeWidget, ProblemsWidget} from "./widgets";
import {FileSystem} from "./filesystem";
import {IRegistry} from "@abaplint/core";
import * as monacoABAP from "@abaplint/monaco";

function main(): void {
  const problems = new ProblemsWidget();
  problems.id = "problems";

  const dock = new DockPanel();
  dock.id = "dock";
  BoxPanel.setStretch(dock, 1);

  const reg = FileSystem.setup(problems, dock);

  dock.addWidget(new WelcomeWidget());
  FileSystem.openFile("file:///abaplint.json");
  FileSystem.openFile("file:///zfoo.ddls.asddls");
  FileSystem.openFile("file:///zfoo.prog.screen_0100.abap");
  FileSystem.openFile("file:///zfoo.prog.abap");

  const left = new BoxPanel({direction: "top-to-bottom", spacing: 0});
  left.id = "left";
  left.addWidget(dock);
  left.addWidget(problems);

  const mainBox = new BoxPanel({direction: "left-to-right", spacing: 0});
  mainBox.id = "main";
  mainBox.addWidget(left);

  window.onresize = () => { mainBox.update(); };
  Widget.attach(mainBox, document.body);

  registerMonacoSettings(reg);
}

function registerMonacoSettings(reg: IRegistry) {
  monacoABAP.registerABAP(reg);

  monaco.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: "https://schema.abaplint.org/schema.json",
      fileMatch: ["abaplint.json"],
      schema: schema,
    }],
  });
}

window.onload = main;