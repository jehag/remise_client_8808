import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { MapDataSetup } from '../interfaces/map-data-setup';
import { QuestionDataHelper } from '../interfaces/question-data-helper';
import { ExcelQuestions } from '../interfaces/excel-questions';
import { CheckboxChoices } from '../interfaces/checkbox-choices';
import { Margin } from '../interfaces/margin';
import { PreprocessService } from '../services/preprocess/preprocess.service';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';
import * as d3 from 'd3';
import { QuestionData } from '../interfaces/question-data';
import { ScalesDataSetup } from '../interfaces/scales-data-setup';

enum GraphType {
  Map = 0,
  Jars = 1,
  Pyramid = 2,
  Tupperware = 3,
  Scales = 4,
  Circles = 5,
  Images = 6
}
enum Province {
  BritishColumbia = 0,
  Alberta = 1,
  Saskatchewan = 2,
  Manitoba = 3,
  Ontario = 4,
  Quebec = 5,
  NewBrunswick = 6,
  NovaScotia = 7,
  PrinceEdward = 8,
  NewFoundLand = 9,
  NorthwestTerritories = 10,
  Yukon = 11,
  Nunavut = 12,
}
@Component({
  selector: 'app-client-wall',
  templateUrl: './client-wall.component.html',
  styleUrls: ['./client-wall.component.css'],
  encapsulation: ViewEncapsulation.Emulated,
})
export class ClientWallComponent implements OnInit {

  graphType: GraphType = GraphType.Map;
  questionsList: ExcelQuestions[] = [];
  mapData: any = [];
  checkBoxChoices: CheckboxChoices = {
    myGender: false,
    myProvince: false,
    myAge: false,
    myScolarity: false,
    myLanguage: false,
    myMoney: false,
    myCivilState: false,
    myCitySize: false
  }

  margin: Margin = {
    top: 100,
    right: 200,
    bottom: 100,
    left: 250
  }
  
  svgSize = {
    width: 1100,
    height: 600
  }

  graphSize = {
    width: this.svgSize.width - this.margin.right - this.margin.left,
    height: this.svgSize.height - this.margin.bottom - this.margin.top
  }

  animations: any[] = []

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService) { }

  /**
 * Gets the Canada data, the wall questions and creates all the graphs
 */
  async ngOnInit() {
    this.mapData = await this.getCanadaData();
    this.questionsList = this.preprocessService.getClientWallQuestions();
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#client-wall-chart');
    this.createGraphs();
  }

  /**
 * Gets the Canada data
 */
  async getCanadaData() {
    return d3.json('assets/data/canada.json').then(function (data) {
      return data;
    })
  }

  /**
 * Changes the wall to the next graph and creates it
 */
  nextGraph(){
    switch (this.graphType){
      case GraphType.Map:
        this.graphType = GraphType.Pyramid;
        break;
      case GraphType.Pyramid:
        this.graphType = GraphType.Jars;
        break;
      case GraphType.Jars:
        this.graphType = GraphType.Tupperware;
        break;
      case GraphType.Tupperware:
        this.graphType = GraphType.Scales;
        this.animate();
        break;
      case GraphType.Scales:
        this.graphType = GraphType.Circles
        break;
      case GraphType.Circles:
        this.graphType = GraphType.Images
        this.vizService.animateImagesGraph(this.getImagesData());
        break;
      case GraphType.Images:
        this.vizService.resetImagesGraph();
        this.graphType = GraphType.Map
        break;
    }
  }

  /**
 * Changes the wall to the previous graph and creates it
 */
  previousGraph(){
    switch (this.graphType){
      case GraphType.Map:
        this.graphType = GraphType.Images;
        this.vizService.animateImagesGraph(this.getImagesData());
        break;
      case GraphType.Pyramid:
        this.graphType = GraphType.Map;
        break;
      case GraphType.Jars:
        this.graphType = GraphType.Pyramid;
        break;
      case GraphType.Tupperware:
        this.graphType = GraphType.Jars;
        break;
      case GraphType.Scales:
        this.graphType = GraphType.Tupperware
        break;
      case GraphType.Circles:
        this.graphType = GraphType.Scales;
        this.animate();
        break;
      case GraphType.Images:
        this.vizService.resetImagesGraph();
        this.graphType = GraphType.Circles;
        break;
    }
  }

  /**
 * Creates all of the graphs
 */
  createGraphs() {
    this.createMapGraph();
    this.graphType = GraphType.Jars;
    this.createJarsGraph();
    this.graphType = GraphType.Pyramid;
    this.createPyramidGraph();
    this.graphType = GraphType.Tupperware;
    this.createTupperwareGraph();
    this.graphType = GraphType.Scales;
    this.createScalesGraph();
    this.graphType = GraphType.Circles;
    this.createCirclesGraph();
    this.graphType = GraphType.Images;
    this.createImagesGraph();
    this.graphType = GraphType.Map;
  }

  /**
 * Setups a map graph and creates it
 */
  createMapGraph(){
    const provinceAnswers: MapDataSetup[] = this.getMapData();
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#client-wall-chart');
    var projection = this.vizService.getProjection(this.mapData, this.svgSize.width, this.svgSize.height);
    var path = this.vizService.getPath(projection);    
    const g = this.vizService.generateG(this.margin, '.client-wall-graph');
    this.vizService.clientMapBackground(g, this.mapData, path, provinceAnswers);
    this.vizService.appendClientWallTitle(g, "Combien de personnes font leur épicerie en vrac?", this.graphSize.width);
  }

  /**
 * Gets a question's data 
 * 
 * @param {string} symbol The symbol of the question
 * @param {number} maxNumber The number of possible groups to get the data
 * @returns {QuestionDataHelper[]} The question's data
 */
  getQuestionData(symbol: string, maxNumber: number) : QuestionDataHelper[] {
    let user: any = {
      [symbol]: 0
    };
    let questionDataList: QuestionDataHelper[] = [];
    for(let i = 1; i <= maxNumber; i++){
      user[symbol] = i;
      if(this.questionsList[this.graphType].symbol.includes('n')){
        let symbolStart = this.questionsList[this.graphType].symbol.substring(0,this.questionsList[this.graphType].symbol.indexOf('n'));
        questionDataList.push(this.preprocessService.getNoToQuestionData(symbolStart, user, this.checkBoxChoices));
      } else {
        let questionName: string = '';
        
        if(this.questionsList[this.graphType].symbol.includes('r')){
          let questionStart: string = this.questionsList[this.graphType].question.split(' - ')[0].trim();
          for(let choice of this.questionsList[this.graphType].choices.values()){
            if(choice.includes(questionStart)){
              questionName = choice;
            }
          }
        } else {
          questionName = this.questionsList[this.graphType].question;
        }
        questionDataList.push(this.preprocessService.getQuestionData(questionName, user, this.checkBoxChoices))
      }
    }
    return questionDataList;
  }

  /**
 * Gets the map data 
 * 
 * @returns {MapDataSetup[]} The map data
 */
  getMapData(): MapDataSetup[]{
    this.checkBoxChoices.myProvince = true;
    const questionDataList: QuestionDataHelper[] = this.getQuestionData('PROV', 13);
    this.checkBoxChoices.myProvince = false;

    for(let i = 0; i < questionDataList.length; i++){
      questionDataList[i] = this.preprocessService.getYesOrNoQ5Data(questionDataList[i]);
    }

    let labels: string[] = [];
    for(let province of this.mapData.features){
      labels.push(province.properties.name);
    }

    let mapData:MapDataSetup[] = [];
    mapData.push({province: labels[0], answer: questionDataList[Province.Quebec].questionData[0].label, value: questionDataList[Province.Quebec].questionData[0].value});
    mapData.push({province: labels[1], answer: questionDataList[Province.NewFoundLand].questionData[0].label, value: questionDataList[Province.NewFoundLand].questionData[0].value});
    mapData.push({province: labels[2], answer: questionDataList[Province.BritishColumbia].questionData[0].label, value: questionDataList[Province.BritishColumbia].questionData[0].value});
    mapData.push({province: labels[3], answer: questionDataList[Province.Nunavut].questionData[0].label, value: questionDataList[Province.Nunavut].questionData[0].value});
    mapData.push({province: labels[4], answer: questionDataList[Province.NorthwestTerritories].questionData[0].label, value: questionDataList[Province.NorthwestTerritories].questionData[0].value});
    mapData.push({province: labels[5], answer: questionDataList[Province.NewBrunswick].questionData[0].label, value: questionDataList[Province.NewBrunswick].questionData[0].value});
    mapData.push({province: labels[6], answer: questionDataList[Province.NovaScotia].questionData[0].label, value: questionDataList[Province.NovaScotia].questionData[0].value});
    mapData.push({province: labels[7], answer: questionDataList[Province.Saskatchewan].questionData[0].label, value: questionDataList[Province.Saskatchewan].questionData[0].value});
    mapData.push({province: labels[8], answer: questionDataList[Province.Alberta].questionData[0].label, value: questionDataList[Province.Alberta].questionData[0].value});
    mapData.push({province: labels[9], answer: questionDataList[Province.PrinceEdward].questionData[0].label, value: questionDataList[Province.PrinceEdward].questionData[0].value});
    mapData.push({province: labels[10], answer: questionDataList[Province.Yukon].questionData[0].label, value: questionDataList[Province.Yukon].questionData[0].value});
    mapData.push({province: labels[11], answer: questionDataList[Province.Manitoba].questionData[0].label, value: questionDataList[Province.Manitoba].questionData[0].value});
    mapData.push({province: labels[12], answer: questionDataList[Province.Ontario].questionData[0].label, value: questionDataList[Province.Ontario].questionData[0].value});

    return mapData;
  }

  /**
 * Setups the jars graph and creates it
 */
  createJarsGraph() {
    const cityData: QuestionData[] = this.getJarsData();
    this.vizService.drawJars(cityData, 'Qui achète le plus en vrac?');
  }

  /**
 * Gets the jars data 
 * 
 * @returns {QuestionData[]} The jars data
 */
  getJarsData(): QuestionData[] {
    this.checkBoxChoices.myCitySize = true;
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('COL', 4);
    this.checkBoxChoices.myCitySize = false;
    for(let i = 0; i < questionDataList.length; i++){
      questionDataList[i] = this.preprocessService.getYesOrNoQ5Data(questionDataList[i]);
    }
    let data: QuestionData[] = [];
    data.push({
      label: "megaCity",
      value: questionDataList[0].questionData[0].value
    })
    data.push({
      label: "bigCity",
      value: questionDataList[1].questionData[0].value
    })
    data.push({
      label: "mediumcity",
      value: questionDataList[2].questionData[0].value
    })
    data.push({
      label: "village",
      value: questionDataList[3].questionData[0].value
    })
    return data;
  }

  /**
 * Setups the pyramid graph and creates it
 */
  createPyramidGraph() {
    const pyramidData: QuestionDataHelper = this.getPyramidData();
    const choices: string[] = pyramidData.questionData.map(function(d) {return d.label});
    const colors: string[] = ["#FF4136", "#FF851B", "#FFDC00", "#80D479", "#9EDBF0"];
    const colorScale = this.scalesService.setColorScale(choices, colors);
    this.vizService.appendClientWallTitle(d3.select(".pyramid-container"), 'Les "excuses" pour ne pas faire du vrac', 1000)
    this.vizService.drawPyramid(choices, colorScale);
  }

  /**
 * Gets the pyramid data 
 * 
 * @returns {QuestionDataHelper} The pyramid data
 */
  getPyramidData(): QuestionDataHelper {
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('Q10An1', 1);
    questionDataList[0].questionData.sort((a, b) => {
      return b.value - a.value;
    })
    return questionDataList[0];
  }

  /**
 * Setups the tupperware graph and creates it
 */
  createTupperwareGraph() {
    const labels = ["18-24", "25-39", "40-54", "55-64", "65 et plus"];
    const tupperwareData: QuestionData[] = this.getTupperwareData(labels);

    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#tupperware-chart');

    const g = this.vizService.generateG(this.margin, '.tupperware-graph');
    this.vizService.appendAxes(g);
    this.vizService.appendTupperwareGraphLabels(g);
    this.vizService.appendClientWallTitle(g, 'Combien de personnes font leur épicerie en vrac?', this.graphSize.width, -40);
    this.vizService.positionClientWallLabels(g, this.graphSize.height + 180, this.graphSize.width - 160, this.graphSize.height + 10);

    const xScale = this.scalesService.setTupperwareXScale(this.graphSize.width, labels);
    const yScale = this.scalesService.setTupperwareYScale(this.graphSize.height);
    this.vizService.drawTupperwareXAxis(xScale, this.graphSize.height);
    this.vizService.drawTupperwareYAxis(yScale);
    this.vizService.drawTupperwareBars(g, tupperwareData, xScale, yScale);
  }

  /**
 * Gets the tupperware data 
 * 
 * @returns {QuestionData[]} The tupperware data
 */
  getTupperwareData(labels: string[]): QuestionData[] {
    this.checkBoxChoices.myAge = true;
    const questionDataList: QuestionDataHelper[] = this.getQuestionData('age', 6);
    this.checkBoxChoices.myAge = false;

    for(let i = 1; i < questionDataList.length; i++){
      questionDataList[i] = this.preprocessService.getYesOrNoQ5Data(questionDataList[i]);
    }
    
    let data: QuestionData[] = [];
    for(let i = 1; i < labels.length + 1; i++){
      data.push({
        label: labels[i - 1],
        value: questionDataList[i].questionData[0].value
      })
    }
    return data;
  }

  /**
 * Setups the scales graph and creates it
 */
  createScalesGraph(){
    const vehiculesData: ScalesDataSetup[] = this.getScalesData();
    const graph: any = d3.select('.scales-graph');
    this.vizService.insertClientWallTitle(graph, "Quel est le mode de transport utilisé par les gens qui croient ou non que la terre contient une infinité de ressources?", this.graphSize.width, this.graphSize.height)
    this.vizService.drawScale(vehiculesData);
    for(let i = 0; i < vehiculesData.length; i++){
      this.animations.push(this.vizService.createBalanceAnimation("#scale" + i, vehiculesData[i]));
    }
  }

  /**
 * Gets the scales data 
 * 
 * @returns {ScalesDataSetup[]} The scales data
 */
  getScalesData(): ScalesDataSetup[]{
    let vehiculesData: ScalesDataSetup[] = [];
    const vehiculeNames: string[] = ['Véhicule Personnel', 'Véhicule autopartage', 'Transport en commun', 'Marche ou Vélo', 'Livraison à domicile']
    for(let i = 1; i <= 5; i++){
      if(i == 2 || i == 5){
        continue;
      }
      const vehiculeData: any[] = this.preprocessService.getVehiculeRows(i);
      const separatedVehiculeData: any[] = this.preprocessService.getVracRows(vehiculeData);
      vehiculesData.push({
        vehicule: vehiculeNames[i-1],
        vracInfiniteValue: this.preprocessService.getInfiniteResourcesValue(separatedVehiculeData[0]),
        nonVracInfiniteValue: this.preprocessService.getInfiniteResourcesValue(separatedVehiculeData[1])
      })
    }
    return vehiculesData;
  }

  /**
 * Setups the circles graph and creates it
 */
  createCirclesGraph() {
    const circlesData: QuestionData[] = this.getCirclesData();
    const graph: any = d3.select('.donuts-graph');
    this.vizService.insertClientWallTitle(graph, "Quels aliments sont les plus facilement accessibles en vrac selon les Canadiens?", this.graphSize.width, this.graphSize.height)
    this.vizService.drawCircles(circlesData);
  }

  /**
 * Gets the circles data 
 * 
 * @returns {QuestionData[]} The circles data
 */
  getCirclesData(): QuestionData[] {
    const user: any = [];
    let circlesData: QuestionData[] = [];
    for(let choice of this.questionsList[this.graphType].choices.values()){
      const questionDataHelper: QuestionDataHelper = this.preprocessService.getQuestionData(choice, user, this.checkBoxChoices);
      circlesData.push({label: choice.split(' - ')[0], value: (questionDataHelper.questionData[3].value + questionDataHelper.questionData[4].value)})
    }
    circlesData.sort((a, b) => {
      return b.value - a.value;
    })
    return circlesData;
  }

  /**
 * Animates the scales graph
 */
  animate() {
    for (let animation of this.animations) {
      this.vizService.rotateScale(animation.id, 0, 0);
      for (let step of animation.queue) {
        this.vizService.rotateScale(animation.id, step.angle, step.delay);
      }
    }
  }

  /**
 * Setups the images graph and creates it
 */
  createImagesGraph() {
    const imagesData: QuestionData[] = this.getImagesData();
    this.vizService.appendClientWallTitle(d3.select('.images-graph'), 'Combien de personnes font leur épicerie en vrac avec ces modes de transports?', this.graphSize.width)
    this.vizService.drawImagesGraph(imagesData);
  }

  /**
 * Gets the images data 
 * 
 * @returns {QuestionData[]} The images data
 */
  getImagesData(): QuestionData[] {
    const imagesSrc: string[] = ['assets/images/car_hor.png', 'assets/images/communauto.png', 'assets/images/bus_hor.png', 'assets/images/bike.jpg']
    let imagesData: QuestionData[] = [];
    for(let i = 1; i <= 4; i++){
      const vehiculeData: any[] = this.preprocessService.getVehiculeRows(i);
      const separatedVehiculeData: any[] = this.preprocessService.getVracRows(vehiculeData);
      imagesData.push({label: imagesSrc[i-1], value: (separatedVehiculeData[0].length/vehiculeData.length)})
    }
    return imagesData;
  }
}
