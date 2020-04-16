import "../node_modules/@phosphor/default-theme/style/index.css";
import "./index.less";
import "../public/img/favicon-16x16.png";
import "../public/img/favicon-32x32.png";
import schema from "../../../packages/core/scripts/schema.json";
import * as monaco from "monaco-editor";
import {BoxPanel, DockPanel, Widget} from "@phosphor/widgets";
import {WelcomeWidget, ProblemsWidget} from "./widgets/";
import {FileSystem} from "./filesystem";
import {IRegistry} from "abaplint/_iregistry";
import * as monacoABAP from "monaco-abap";

function main(): void {
  const problems = new ProblemsWidget();
  problems.id = "problems";

  const dock = new DockPanel();
  dock.id = "dock";
  BoxPanel.setStretch(dock, 1);

  const reg = FileSystem.setup(problems, dock);

  dock.addWidget(new WelcomeWidget());
  FileSystem.openFile("file:///abaplint.json");
  FileSystem.openFile("file:///zfoobar.prog.abap");

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
  // @ts-ignore
  monacoABAP.registerABAP(reg);

  monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
    validate: true,
    schemas: [{
      uri: "https://schema.abaplint.org/schema.json",
      fileMatch: ["abaplint.json"],
      schema: schema,
    }],
  });
}

window.onload = main;