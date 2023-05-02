import { Component, OnInit } from '@angular/core';
import { QuestionData } from '../interfaces/question-data';
import { PreprocessService } from './../services/preprocess/preprocess.service';
import { CheckboxChoices } from '../interfaces/checkbox-choices';
import { Margin } from '../interfaces/margin';
import { VizService } from '../services/viz/viz.service';
import { ScalesService } from '../services/scales/scales.service';
import { QuestionDataHelper } from '../interfaces/question-data-helper';

@Component({
  selector: 'app-phone',
  templateUrl: './phone.component.html',
  styleUrls: ['./phone.component.css']
})
export class PhoneComponent implements OnInit {

  selectedQuestion: string = "";
  characterChosen: boolean = false;
  isMan: boolean = false;
  isThemeQuestion: boolean = false;
  themeQuestionsList: string[] = [];
  selectedSubQuestion: string = "";
  user: any = null;
  isShowingGraph: boolean = false;
  amountOfData: number = 0;
  checkboxChoices: CheckboxChoices = {
    myGender: true,
    myProvince: true,
    myAge: true,
    myScolarity: true,
    myLanguage: true,
    myMoney: true,
    myCivilState: true,
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

  constructor(private preprocessService: PreprocessService, 
    private vizService: VizService,
    private scalesService: ScalesService
  ) {}

  ngOnInit(): void {
  }

  /**
 * Gets the questions list for the phone
 *
 * @returns {string[]} The string list of questions
 */
  get questions(){
    return this.preprocessService.questionsList;
  }

  /**
 * Chooses what to do when a checkbox is altered
 */
  checkBoxChanged(){
    if(this.isShowingGraph){
      if(this.isThemeQuestion){
        this.getSubQuestionData();
      } else{
        this.getQuestionData();
      }
    }
  }

  /**
 * Defines the user that is currently chosen and resets the graph if necessary
 *
 * @param {boolean} man The sex of the user that has been chosen
 */
  findUserData(man: boolean) {
    this.characterChosen = true;
    this.isMan = man;
    this.user = this.preprocessService.getUserData(man);
    if(this.isShowingGraph){
      this.getQuestionData();
    }
  }

  /**
 * Gets the data of the question that has been selected
 */
  getQuestionData(){
    const symbol = this.preprocessService.getFormattedSymbolWithQuestion(this.selectedQuestion);
    if(symbol.includes('r')){
      this.themeQuestionsList = this.preprocessService.getThemeQuestions(symbol);
      this.isThemeQuestion = true;
      this.selectedSubQuestion = this.themeQuestionsList[0];
      this.getSubQuestionData();
    } else if (symbol.includes('n')) {
      this.isThemeQuestion = false;
      let questionDataHelper: QuestionDataHelper = this.preprocessService.getNoToQuestionData(symbol.substring(0, symbol.indexOf('n')), this.user, this.checkboxChoices);
      let processedSymbol = this.preprocessService.getUserProcessedSymbolWithFormattedQuestion(this.selectedQuestion, this.user);
      this.createGraph(questionDataHelper, this.selectedQuestion, processedSymbol);
    } else {
      this.isThemeQuestion = false;
      let questionDataHelper: QuestionDataHelper = this.preprocessService.getQuestionData(this.selectedQuestion, this.user, this.checkboxChoices);
      let processedSymbol = this.preprocessService.getUserProcessedSymbolWithFormattedQuestion(this.selectedQuestion, this.user);
      this.createGraph(questionDataHelper, this.selectedQuestion, processedSymbol);
    }
  }

  /**
 * Gets the data of the question that has been selected if the questions is a sub question
 */
  getSubQuestionData() {
    let subQuestionName: string = this.preprocessService.getSubQuestionRealName(this.selectedQuestion, this.selectedSubQuestion);
    let questionDataHelper: QuestionDataHelper = this.preprocessService.getQuestionData(subQuestionName, this.user, this.checkboxChoices);
    this.createGraph(questionDataHelper, this.selectedQuestion + ' ' + this.selectedSubQuestion, this.preprocessService.getProcessedSymbolWithSubQuestionName(subQuestionName));
  }

  /**
 * Creates a bar graph
 *
 * @param {QuestionDataHelper} questionDataHelper The data to be shown
 * @param {string} questionName The name of the question
 * @param {string} symbol The symbol of the question
 */
  createGraph(questionDataHelper: QuestionDataHelper, questionName: string, symbol: string){
    this.isShowingGraph = true;
    this.vizService.deleteGraph('#bar-chart');

    this.vizService.setCanvasSize(this.svgSize.width, this.svgSize.height, '#bar-chart');

    const g = this.vizService.generateG(this.margin, '.graph');
    this.vizService.appendAxes(g);
    this.vizService.appendGraphLabels(g);
    this.vizService.placeTitle(g, questionName, this.graphSize.width);
    this.vizService.positionLabels(g, this.graphSize.width, this.graphSize.height);

    const choice = this.preprocessService.getChoiceFromData(symbol, this.user[symbol])

    const xScale = this.scalesService.setXScale(this.graphSize.width);
    const yScale = this.scalesService.setYScale(this.graphSize.height, questionDataHelper.questionData);
    const colorScale = this.scalesService.setColorScale(['Votre réponse'], ['orange']);
    this.vizService.drawXAxis(xScale, this.graphSize.height);
    this.vizService.drawYAxis(yScale);
    this.vizService.drawLegend(g, this.graphSize.width, colorScale);
    this.vizService.drawBars(g, questionDataHelper.questionData, xScale, yScale, choice);
    this.amountOfData = questionDataHelper.sumOfValues;
  }

}
