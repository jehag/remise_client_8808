import { Component, OnInit } from '@angular/core';
import { PreprocessService } from '../services/preprocess/preprocess.service';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';
import { CheckboxChoices } from '../interfaces/checkbox-choices';
import { ExcelQuestions } from '../interfaces/excel-questions';
import { QuestionData } from '../interfaces/question-data';
import { Margin } from '../interfaces/margin';
import { QuestionDataHelper } from '../interfaces/question-data-helper';
import { GenderDataSetup } from '../interfaces/gender-data-setup';
import { AgeDataSetup } from '../interfaces/age-data-setup';
import * as d3 from 'd3';
import { MapDataSetup } from '../interfaces/map-data-setup';

enum GraphType {
  Gender = 0,
  Age = 1,
  Map = 2
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
  selector: 'app-wall',
  templateUrl: './wall.component.html',
  styleUrls: ['./wall.component.css']
})
export class WallComponent implements OnInit {

  graphType: GraphType = GraphType.Gender;
  currentQuestion: number = 6;
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
  }

  margin: Margin = {
    top: 75,
    right: 200,
    bottom: 100,
    left: 150
  }
  
  svgSize = {
    width: 1000,
    height: 600
  }

  graphSize = {
    width: this.svgSize.width - this.margin.right - this.margin.left,
    height: this.svgSize.height - this.margin.bottom - this.margin.top
  }

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService) { }

  async ngOnInit() {
    this.mapData = await this.getCanadaData();
    this.questionsList = this.preprocessService.getWallQuestions();
    this.createGraph();
  }

  async getCanadaData() {
    return d3.json('assets/data/canada.json').then(function (data) {
      return data;
    })
  }

  nextGraph(){
    this.vizService.deleteGraph('#wall-chart');
    if(this.graphType == GraphType.Gender){
      this.graphType = GraphType.Age;
    } else if (this.graphType == GraphType.Age) {
      this.graphType = GraphType.Map;
    } else {
      if(this.currentQuestion == 49){
        this.currentQuestion = 0;
      } else {
        this.currentQuestion++;
      }
      this.graphType = GraphType.Gender;
    }
    this.createGraph();
  }

  previousGraph(){
    this.vizService.deleteGraph('#wall-chart');
    if(this.graphType == GraphType.Gender){
      this.graphType = GraphType.Map;
      if(this.currentQuestion == 0){
        this.currentQuestion = 49;
      } else {
        this.currentQuestion--;
      }
    } else if (this.graphType == GraphType.Age) {
      this.graphType = GraphType.Gender;
    } else {
      this.graphType = GraphType.Age;
    }
    this.createGraph();
  }

  createGraph() {
    if(this.graphType == GraphType.Gender){
      this.createGenderGraph();
    } else if (this.graphType == GraphType.Age) {
      this.createAgeGraph();
    } else {
      this.createMapGraph();
    }
  }

  createGenderGraph() {
    const genderData: GenderDataSetup[] = this.getGenderData();
    const groups: string[] = ['men', 'women'];
    const dataset = this.vizService.stackData(genderData, groups);
    const labels = this.preprocessService.getQuestionChoices(this.questionsList[this.currentQuestion]);
    const colors = ['#92D050', '#9DC3E6'];
    const legendItems = ['Hommes', 'Femmes'];
    const legendTitle = "Sexes :"

    this.buildGraph(labels, colors, legendItems, dataset, groups, legendTitle);
  }

  getGenderData(): GenderDataSetup[] {
    this.checkBoxChoices.myGender = true;
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('sexe', 2);
    this.checkBoxChoices.myGender = false;

    let data: GenderDataSetup[] = [];
    for(let i = 0; i < questionDataList[0].questionData.length; i++){
      const totalSum = questionDataList.reduce((total, current) => total + current.sumOfValues, 0);
      data.push({
        label: questionDataList[0].questionData[i].label,
        men: (questionDataList[0].questionData[i].value * questionDataList[0].sumOfValues) / totalSum,
        women: (questionDataList[1].questionData[i].value * questionDataList[1].sumOfValues) / totalSum,
      });
    }
    return data;
  }

  createAgeGraph(){
    const ageData: AgeDataSetup[] = this.getAgeData();
    const groups: string[] = ['firstBracket', 'secondBracket', 'thirdBracket', 'fourthBracket', 'fifthBracket'];
    const dataset = this.vizService.stackData(ageData, groups);
    const labels = this.preprocessService.getQuestionChoices(this.questionsList[this.currentQuestion]);
    const colors = ['#39aac6', '#E7E6E6', '#FFC000', '#92D050', '#00B0F0', '#ff9999'];
    const legendItems = ["18-24", "25-39", "40-54", "55-64", "65 et plus"];
    const legendTitle = "Tranches d'âge :"

    this.buildGraph(labels, colors, legendItems, dataset, groups, legendTitle);
  }

  getAgeData(): AgeDataSetup[] {
    this.checkBoxChoices.myAge = true;
    let questionDataList: QuestionDataHelper[] = this.getQuestionData('age', 5);
    this.checkBoxChoices.myAge = false;
    let data: AgeDataSetup[] = [];
    for(let i = 0; i < questionDataList[0].questionData.length; i++){
      const totalSum = questionDataList.reduce((total, current) => total + current.sumOfValues, 0);
      data.push({
        label: questionDataList[0].questionData[i].label,
        firstBracket: (questionDataList[0].questionData[i].value * questionDataList[0].sumOfValues) / totalSum,
        secondBracket: (questionDataList[1].questionData[i].value * questionDataList[1].sumOfValues) / totalSum,
        thirdBracket: (questionDataList[2].questionData[i].value * questionDataList[2].sumOfValues) / totalSum,
        fourthBracket: (questionDataList[3].questionData[i].value * questionDataList[3].sumOfValues) / totalSum,
        fifthBracket: (questionDataList[4].questionData[i].value * questionDataList[4].sumOfValues) / totalSum,
      });
    }
    return data;
  }

  createMapGraph(){
    const provinceAnswers: MapDataSetup[] = this.getMapData();
    let choices: string[] = this.preprocessService.getQuestionChoices(this.questionsList[this.currentQuestion]);
    choices.push('Aucune réponse');
    
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#wall-chart');
    var projection = this.vizService.getProjection(this.mapData, this.svgSize.width, this.svgSize.height);
    var path = this.vizService.getPath(projection);
    const g = this.vizService.generateG(this.margin, '.wall-graph');
    const colorscale = this.scalesService.setMapColorScale(choices);
    this.vizService.mapBackground(g, this.mapData, path, colorscale, provinceAnswers);
    this.vizService.placeTitle(g, this.questionsList[this.currentQuestion].question, this.graphSize.width);
    this.vizService.drawMapLegend(g, this.graphSize.width, colorscale);
  }

  getQuestionData(symbol: string, maxNumber: number) : QuestionDataHelper[] {
    let user: any = {
      [symbol]: 0
    };
    let questionDataList: QuestionDataHelper[] = [];
    for(let i = 1; i <= maxNumber; i++){
      user[symbol] = i;
      if(this.questionsList[this.currentQuestion].symbol.includes('n')){
        let symbolStart = this.questionsList[this.currentQuestion].symbol.substring(0,this.questionsList[this.currentQuestion].symbol.indexOf('n'));
        questionDataList.push(this.preprocessService.getNoToQuestionData(symbolStart, user, this.checkBoxChoices));
      } else {
        let questionName: string = '';
        
        if(this.questionsList[this.currentQuestion].symbol.includes('r')){
          let questionStart: string = this.questionsList[this.currentQuestion].question.split(' - ')[0].trim();
          for(let choice of this.questionsList[this.currentQuestion].choices.values()){
            if(choice.includes(questionStart)){
              questionName = choice;
            }
          }
        } else {
          questionName = this.questionsList[this.currentQuestion].question;
        }
        questionDataList.push(this.preprocessService.getQuestionData(questionName, user, this.checkBoxChoices))
      }
    }
    return questionDataList;
  }

  buildGraph(labels: string[], colors: string[], legendItems: string[], dataset: any, groupLabels: string[], legendTitle: string){
    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#wall-chart');

    const g = this.vizService.generateG(this.margin, '.wall-graph');
    this.vizService.appendAxes(g);
    this.vizService.appendGraphLabels(g);
    this.vizService.placeTitle(g, this.questionsList[this.currentQuestion].question, this.graphSize.width);
    this.vizService.positionLabels(g, this.graphSize.width, this.graphSize.height);

    const xScale = this.scalesService.setXScale(this.graphSize.width);
    const yScale = this.scalesService.setWallYScale(this.graphSize.height, labels);
    const colorScale = this.scalesService.setColorScale(legendItems, colors)
    this.vizService.drawXAxis(xScale, this.graphSize.height);
    this.vizService.drawYAxis(yScale);
    this.vizService.drawWallLegend(g, this.graphSize.width, colorScale, legendTitle);
    this.vizService.drawWallBars(g, dataset, xScale, yScale, colors, groupLabels);
  }

  getMapData(): MapDataSetup[]{
    this.checkBoxChoices.myProvince = true;
    const questionDataList: QuestionDataHelper[] = this.getQuestionData('PROV', 13);
    this.checkBoxChoices.myProvince = false;

    let mostPopularAnswers: string[] = [];
    for(let questionDataHelper of questionDataList){
      mostPopularAnswers.push(this.preprocessService.getMostPopularAnswer(questionDataHelper.questionData));
    }

    let mostPopularAnswersValue: number[] = [];
    for(let i = 0; i < questionDataList.length; i++){
      mostPopularAnswersValue.push(questionDataList[i].questionData.find((questionData) => {
        return questionData.label == mostPopularAnswers[i];
      })!.value);
    }

    let labels: string[] = [];
    for(let province of this.mapData.features){
      labels.push(province.properties.name);
    }

    let mapData:MapDataSetup[] = [];
    mapData.push({province: labels[0], answer: mostPopularAnswers[Province.Quebec], value: mostPopularAnswersValue[Province.Quebec]});
    mapData.push({province: labels[1], answer: mostPopularAnswers[Province.NewFoundLand], value: mostPopularAnswersValue[Province.NewFoundLand]});
    mapData.push({province: labels[2], answer: mostPopularAnswers[Province.BritishColumbia], value: mostPopularAnswersValue[Province.BritishColumbia]});
    mapData.push({province: labels[3], answer: mostPopularAnswers[Province.Nunavut], value: mostPopularAnswersValue[Province.Nunavut]});
    mapData.push({province: labels[4], answer: mostPopularAnswers[Province.NorthwestTerritories], value: mostPopularAnswersValue[Province.NorthwestTerritories]});
    mapData.push({province: labels[5], answer: mostPopularAnswers[Province.NewBrunswick], value: mostPopularAnswersValue[Province.NewBrunswick]});
    mapData.push({province: labels[6], answer: mostPopularAnswers[Province.NovaScotia], value: mostPopularAnswersValue[Province.NovaScotia]});
    mapData.push({province: labels[7], answer: mostPopularAnswers[Province.Saskatchewan], value: mostPopularAnswersValue[Province.Saskatchewan]});
    mapData.push({province: labels[8], answer: mostPopularAnswers[Province.Alberta], value: mostPopularAnswersValue[Province.Alberta]});
    mapData.push({province: labels[9], answer: mostPopularAnswers[Province.PrinceEdward], value: mostPopularAnswersValue[Province.PrinceEdward]});
    mapData.push({province: labels[10], answer: mostPopularAnswers[Province.Yukon], value: mostPopularAnswersValue[Province.Yukon]});
    mapData.push({province: labels[11], answer: mostPopularAnswers[Province.Manitoba], value: mostPopularAnswersValue[Province.Manitoba]});
    mapData.push({province: labels[12], answer: mostPopularAnswers[Province.Ontario], value: mostPopularAnswersValue[Province.Ontario]});
    return mapData;
  }



}
