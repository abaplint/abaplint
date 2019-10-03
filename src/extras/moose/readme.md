# Analyse your ABAP software with moose

Moose (https://moosetechnology.org) is a opensource platform for expressing analyses of software systems and of data in general.
Its main goal is to assist and enable a human in the process of understanding large amounts of data.
Moose is primarily not for clickers, but for programmers. To get the most out of it, you have to program it (smallTalk).

For installation und learn more about moose, read the official website https://moosetechnology.org or the moose book
http://www.themoosebook.org

## Extracting the model file with abaplint
1. you need the abap source code in a local git repository
2. open a terminal od shell window in the root folder of this git repository
3. create your abaplint configuration (if not done already)
4. execute `abaplint -m --outfile <projectname>.mse`

## Importing the model file in moose
1. launch moose
2. open the moose panel
3. click on the MSE button and choose the currently created MSE file
4. set the root folder to connect the model with source code (right click on the model name, choose `Utilities/Set root folder` and point to the the git
repository folder)

## Documentations
 * a good description about the MSE file format and the FAMIX model https://www.researchgate.net/publication/265428652
 * slide deck about the idea of using abaplint for extracting the famix meta model @ SAP Stammtisch Luzern https://de.slideshare.net/Pascal_Erni/abap-software-analysis-with-abaplint-and-moose-technoloige
 
## Links
* [SAP2Moose](https://github.com/SAP2Moose/SAP2Moose): An other project to extract model data from a SAP system using FAMIX to import into the Moose Analysis platform


