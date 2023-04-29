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
  Circles = 5
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

  async ngOnInit() {
    this.mapData = await this.getCanadaData();
    this.questionsList = this.preprocessService.getClientWallQuestions();
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#client-wall-chart');
    this.createGraphs();
  }

  async getCanadaData() {
    return d3.json('assets/data/canada.json').then(function (data) {
      return data;
    })
  }

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
        this.graphType = GraphType.Map
        break;
    }
  }

  previousGraph(){
    switch (this.graphType){
      case GraphType.Map:
        this.graphType = GraphType.Circles;
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
    }
  }

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
    this.graphType = GraphType.Map;
  }

  createMapGraph(){

    const provinceAnswers: MapDataSetup[] = this.getMapData();
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#client-wall-chart');
    var projection = this.vizService.getProjection(this.mapData, this.svgSize.width, this.svgSize.height);
    var path = this.vizService.getPath(projection);    
    const g = this.vizService.generateG(this.margin, '.client-wall-graph');
    const color: string = "#FF4136";
    this.vizService.clientMapBackground(g, this.mapData, path, color, provinceAnswers);
    this.vizService.placeClientWallTitle(g, "Combien de personnes font leur épicerie en vrac?", this.graphSize.width);
  }

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

  createJarsGraph() {
    const cityData: QuestionData[] = this.getJarsData();
    this.vizService.drawJars(cityData, 'Qui achète le plus en vrac?');
  }

  getJarsData() {
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

  createPyramidGraph() {
    const pyramidData: QuestionDataHelper = this.getPyramidData();
    const choices: string[] = pyramidData.questionData.map(function(d) {return d.label});
    const colors: string[] = ["#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9"];
    //const colors: string[] = ["#FF4136", "#FF851B", "#FFDC00", "#2ECC40", "#0074D9", "#B10DC9", "#FF007F", "#A0522D", "#AAAAAA", "#39CCCC"];
    const colorScale = this.scalesService.setColorScale(choices, colors);
    this.vizService.placeClientWallTitle(d3.select(".pyramid-container"), 'Les "excuses" pour ne pas faire du vrac', 1000)
    this.vizService.drawPyramid(choices, colorScale);
  }

  getPyramidData() {
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('Q10An1', 1);
    questionDataList[0].questionData.sort((a, b) => {
      return b.value - a.value;
    })
    return questionDataList[0];
  }

  createTupperwareGraph() {
    const labels = ["18-24", "25-39", "40-54", "55-64", "65 et plus"];
    const tupperwareData: QuestionData[] = this.getTupperwareData(labels);

    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#tupperware-chart');

    const g = this.vizService.generateG(this.margin, '.tupperware-graph');
    this.vizService.appendAxes(g);
    this.vizService.appendTupperwareGraphLabels(g);
    this.vizService.placeClientWallTitle(g, 'Combien de personnes font leur épicerie en vrac?', this.graphSize.width, -40);
    this.vizService.positionClientWallLabels(g, this.graphSize.height + 180, this.graphSize.width - 160, this.graphSize.height + 10);

    const xScale = this.scalesService.setTupperwareXScale(this.graphSize.width, labels);
    const yScale = this.scalesService.setTupperwareYScale(this.graphSize.height);
    this.vizService.drawTupperwareXAxis(xScale, this.graphSize.height);
    this.vizService.drawTupperwareYAxis(yScale);
    this.vizService.drawTupperwareBars(g, tupperwareData, xScale, yScale);
  }

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

  createScalesGraph(){
    const vehiculesData: ScalesDataSetup[] = this.getScalesData();
    let scaleXValue = -466;
    this.vizService.drawScale(vehiculesData);
    for(let i = 0; i < vehiculesData.length; i++){
      this.animations.push(this.vizService.createBalanceAnimation("#scale" + i, vehiculesData[i], scaleXValue));
      scaleXValue += 300;
    }
  }

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
        vracReturnValue: this.preprocessService.getCriseValue(separatedVehiculeData[0]),
        nonVracReturnValue: this.preprocessService.getCriseValue(separatedVehiculeData[1])
      })
    }
    return vehiculesData;
  }

  createCirclesGraph() {
    const circlesData: QuestionData[] = this.getCirclesData();
    const graph: any = d3.select('.donuts-graph');
    this.vizService.placeDonutsTitle(graph, "Les produits les plus simples à acheter sans emballage selon les Canadiens", this.graphSize.width, this.graphSize.height)
    this.vizService.drawCircles(circlesData);
  }

  getCirclesData(): QuestionData[] {
    const user: any = [];
    let circlesData: QuestionData[] = [];
    for(let choice of this.questionsList[this.graphType].choices.values()){
      const questionDataHelper: QuestionDataHelper = this.preprocessService.getQuestionData(choice, user, this.checkBoxChoices);
      circlesData.push({label: choice.split(' - ')[0], value: (questionDataHelper.questionData[3].value + questionDataHelper.questionData[4].value)})
    }
    return circlesData;
  }

  animate() {
    for (let animation of this.animations) {
      this.vizService.rotateScale(animation.id, 0, 0, animation.scaleX);
      for (let step of animation.queue) {
        this.vizService.rotateScale(animation.id, step.angle, step.delay, animation.scaleX);
      }
    }
  }
}
