import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Margin } from 'src/app/interfaces/margin';
import { legendColor, legendSymbol } from 'd3-svg-legend';
import { QuestionData } from 'src/app/interfaces/question-data';
import { QuestionDataHelper } from 'src/app/interfaces/question-data-helper';
import { GenderDataSetup } from 'src/app/interfaces/gender-data-setup';
import { MapDataSetup } from 'src/app/interfaces/map-data-setup';
import { ScalesDataSetup } from 'src/app/interfaces/scales-data-setup';

@Injectable({
  providedIn: 'root'
})
export class VizService {

  constructor() { }
  generateG (margin: Margin, graphClass: string) {
    return d3.select(graphClass)
      .select('svg')
      .append('g')
      .attr('transform',
        'translate(' + margin.left + ',' + margin.top + ')')
  }

  setCanvasSize (width: number, height: number, graphId: string) {
    d3.select(graphId)
      .attr('width', width)
      .attr('height', height)
      .attr("xmlns", "http://www.w3.org/2000/svg")
  }

  unSetCanvasSize (graphId: string) {
    d3.select(graphId)
      .attr('width', 0)
      .attr('height', 0)
  }

  appendAxes (g: any) {
    g.append('g')
      .attr('class', 'x axis')
  
    g.append('g')
      .attr('class', 'y axis')
      .style('width', 150)
  }

  appendGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'x axis-text')
      .attr('font-size', 12)
  }

  appendTupperwareGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'y axis-text')
      .attr('font-size', 12)

    g.append('text')
      .text("Tranches d'âge")
      .attr('class', 'x axis-text')
      .attr('font-size', 12)
  }

  placeTitle (g: any, title: string, width: number) {
    if(title.length > 60){

      let words: string[] = title.split(' ');
      let i: number = 0;
      let j: number = -55;
      while(i <= words.length - 1){
        let line: string = words[i];
        i++;
        while(line.length < 60 && i <= words.length - 1){
          line = line + ' ' + words[i];
          i++;
        }

        if(words[i] && words[i].match(/[.,:!?]/)){
          line += words[i];
          i++;
        }

        g.append('text')
        .attr('class', 'title')
        .attr('x', width/2)
        .attr('y', j)
        .attr('font-size', '20px')
        .attr('text-anchor', 'middle')
        .text(line)
        j = j + 20;
      }
    } else {
      g.append('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', -20)
      .attr('font-size', '20px')
      .attr('text-anchor', 'middle')
      .text(title)
    }
  }

  positionLabels (g: any, width: number, height: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + height / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + width / 2 + ',' + (height + 50) + ')')
  }

  drawXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
      .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  drawYAxis (yScale: any) {
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.y.axis').selectAll('.tick').select('text').text(function(d: any) {
      if(d.length <= 30){
        return d;
      } else {
        const splitLabel = d.split(' ');
        let labelStart: string = '';
        let i: number = 0;
        while(labelStart.length + splitLabel[i].length < 30){
          labelStart += ' ' + splitLabel[i];
          i++;
        }
        return labelStart;
      }
    }).each(function(d: any, i: any, nodes: any) {
      if(d.length > 30){
        let words: string[] = d.split(' ');
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < 30){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        let j: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < 30 && currentWordIndex <= words.length - 1){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && words[currentWordIndex].match(/[.,:!?]/)){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
          .append("text")
          .text(function() {
            return line;
          })
          .attr('fill', 'black')
          .attr('y', j)
          .attr('x', -9)
          .attr('dy', '0.32em')
          j = j + 12;
        }
        const lines: number = (j/12);
        let currentLineHeight: number = -(((lines-1)/2)*12) - 12;
        d3.select(nodes[i].parentNode).selectAll('text').attr('y', function() {
          currentLineHeight += 12;
          return currentLineHeight;
        })
      }
    })
  }

  drawLegend (g: any, width: number, colorScale: any) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width + 20) + ', 200)')
  
    var legendOrdinal = legendColor()
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale);
    
  
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }

  drawBars(g:any, data: QuestionData[], xScale:any, yScale:any, userChoice: string) {
    g.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("y", function(d: QuestionData) { return yScale(d.label); })
      .style('fill', function (d: QuestionData) { return d.label == userChoice? 'orange': 'green'; })
      .attr("width", function(d: QuestionData) { return xScale(d.value); })
      .attr("height", yScale.bandwidth());
  }

  drawTupperwareBars(g:any, data: QuestionData[], xScale:any, yScale:any) {
    const ware = `
    <div class="ware"></div>
    <div class="tup"></div>
    <div class="per"></div>`

    g.selectAll(".bar")
      .data(data)
      .enter().append("foreignObject")
      .attr("x", function(d: QuestionData) { return xScale(d.label) - xScale.bandwidth() / 2; })
      .attr("y", function(d: QuestionData) { return yScale(100); })
      .attr("width", function(d: QuestionData) { return xScale.bandwidth() * 2; })
      .attr("height", function(d: QuestionData) { return yScale(0); })
      .append("xhtml:div")
      .style("display", "flex")
      .style("position", "relative")
      .style("transform", "translateX(50%)")
      .style("width", function(d: QuestionData) { return xScale.bandwidth() + "px"; })
      .style("height", function(d: QuestionData) { return yScale(0) + "px"; })
      // .style("background", function(d: any, i: any) { return "red"; })
      .attr("class", "column")
      .each(function (this: any, d: any, index: any) {
        let container_sizes: any[] = [];
        if (d.value > 0) {
          container_sizes.push({index: 0, size: d.value % 10});
          for (let i = 1; i < d.value / 10; i++) {
            container_sizes.push({index: i , size: 10});
          }
        }

        d3.select(this).selectAll("div")
          .data(container_sizes)
          .enter()
          .append("div")
          .attr("class", "tupperware")
          .style('height', function (d: any) { return (d.size) + "%"})
          .html(ware)
          .style('animation', function(d: any) { return (Math.random() < 0.5 ? "fall-right": "fall-left") + " 2s linear backwards"})
          .style('animation-delay', function(d: any) { return ((container_sizes.length - d.index -1) * 0.6) + "s"})
      });
      
  }

  deleteGraph(graphId: string){
    const g = d3.select(graphId).selectAll('*').remove();
    g.remove();
  }

  drawWallBars(g:any, data: any, xScale:any, yScale:any, colors: string[], groupLabels: string[]){
    let currentGroup = 0;
    var groups = g
      .selectAll("g.bars")
      .data(data)
      .enter().append("g")
      .attr("class", "bars")
      .style("fill", function(d: any, i: any) { return colors[i]; })
      .style("stroke", "#000");
    
    groups.selectAll("rect")
      .data(function(d: any) { return d; })
      .enter()
      .append("rect")
      .attr("x", function(d: any) { return xScale(Math.round(d[0])); })
      .attr("y", function(d: any) { return yScale(d.data.label); })
      .attr("height", yScale.bandwidth())
      .attr("width", function(d: any) { return xScale(Math.round(d[1])) - xScale(Math.round(d[0]));})
      .each(function(d: any, i: any, nodes: any) {
        if(Math.round(d.data[groupLabels[currentGroup]]) >= 3){
          d3.select(nodes[i].parentNode)
          .append("text")
          .text(function() {
            return Math.round(d.data[groupLabels[currentGroup]]) + "%"
          })
          .attr("x", xScale(d[0]) + (xScale(d[1]) - xScale(d[0])) / 2)
          .attr("y", yScale(d.data.label) + yScale.bandwidth() / 2)
          .attr("text-anchor", "middle")
          .attr("dy", ".35em")
          .style("fill", "white");
        }
        if(i == data[0].length - 1){
          currentGroup++;
        }
      });

  }

  stackData(data: any[], keys: string[]) {
    return d3.stack().keys(keys)(data);
  }

mapBackground (g:any, data: any, path: any, colorScale: any, provinceAnswers: MapDataSetup[]) {
    g.append('g')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', function(d: any){ 
      const province = provinceAnswers.find((province) => {
        return province.province == d.properties.name;
      })
      return colorScale(province!.answer)})
    .style('stroke', 'black')
  }

  getProjection (data: any, width: number, height:number) {
    return d3.geoAzimuthalEquidistant()
      .fitSize([width, height], data)
      .rotate([90, 0])
      .translate([(width/2) - 150, height + height/2 + 50])
  }
  
  getPath (projection: d3.GeoProjection) {
    return d3.geoPath()
      .projection(projection)
  }

  drawMapLegend (g:any, width: number, colorScale: any) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width - 100) + ', 40)')
      .append('text')
      .text('Légende')
      .attr('x', 20)
      .attr('y', -20)
      .attr('font-size', 20)
      .attr('font-weight', 'bold')
  
    var legendOrdinal = (legendColor() as any)
      .shape('path', d3.symbol().type(d3.symbolCircle).size(300)()!)
      .shapePadding(2)
      .scale(colorScale)

    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
      .selectAll('.swatch')
      .style('stroke', '#000');

    let offset = 0;
    g.selectAll('.legendOrdinal')
      .selectAll('.label')
      .text(function(d: any, i: any, nodes: any){
        const transform: string = d3.select(nodes[i].parentNode).attr('transform');
        const parsedY: string = transform.split(',')[1].substring(0, transform.split(',')[1].length - 2);
        const maxLineLength: number = 35;
        if(parsedY != ' '){
          d3.select(nodes[i].parentNode)
          .attr('transform', 'translate( 0 , '+ (parseInt(parsedY) + offset)+')')
        }
        if(d.length < maxLineLength){
          return d;
        }
        let words: string[] = d.split(' ');
        for(let i = 0; i < words.length;i++){
          if(words[i] == ''){
            words.splice(i,1);
          }
        }
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < maxLineLength){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        
        let substringOffset: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < maxLineLength){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && (words[currentWordIndex].match(/[.,:!?]/))){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
            .append("text")
            .text(function() {
              return line;
            })
            .attr('y', substringOffset)
            .attr('x', 20)
            .attr('dy', '0.64em')
          offset += 16;
          substringOffset += 16;
        }
        return labelStart;
      })
      .each(function(d:any, i:any, nodes:any) {
        d3.select(nodes[i].parentNode)
            .attr('dy', '-0.32em')
      })

    
  }

  drawWallLegend (g: any, width: number, colorScale: any, title: string) {
    g.append('g')
      .attr('class', 'legendOrdinal')
      .attr('transform', 'translate(' + (width - 20) + ', ' + 50 +')')
      .append('text')
      .text(title)
      .attr('x',  -10)
      .attr('y', -20)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
  
    var legendOrdinal = (legendColor() as any)
      .shape('path', d3.symbol().type(d3.symbolSquare).size(200)()!)
      .scale(colorScale)
    
    g.selectAll('.legendOrdinal')
      .call(legendOrdinal)
  }

  drawPyramid(data: string[], colorScale: any){
    const numElements = data.length;

    const pyramid = d3.select(".pyramid-container");

    pyramid.append('text')

    let currentWidth: number = 0;

    pyramid.selectAll(".pyramid-level")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "pyramid-level")
      .style("border-top", (d, i) => "50px solid " + colorScale(i))
      .style("width", (d, i) => {
        return (numElements - i) * 60 + "px";
      })
      .style("border-left", "30px solid transparent")
      .style("border-right", "30px solid transparent")
      .style("height", 0)
      .append("span")
      .text((d: any, i: any , nodes: any) => {
        const letterSize: number = 6;
        const currentWidth: number = parseInt(nodes[i].parentNode.style.width.split('p')[0]);
        if(d.length * letterSize < currentWidth){
          return d;
        }
        let words: string[] = d.split(' ');
        for(let i = 0; i < words.length;i++){
          if(words[i] == ''){
            words.splice(i,1);
          }
        }
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while((labelStart.length + words[currentWordIndex].length) * letterSize < currentWidth){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        
        let substringOffset: number = 70;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && (line.length + words[currentWordIndex].length) * letterSize < currentWidth){
            line = line + ' ' + words[currentWordIndex];
            currentWordIndex++;
          }
          
          if(words[currentWordIndex] && (words[currentWordIndex].match(/[.,:!?]/))){
            line += words[currentWordIndex];
            currentWordIndex++;
          }
          d3.select(nodes[i].parentNode)
            .append("span")
            .text(function() {
              return line;
            })
            .style("color", "#000")
            .style("font-size", "16px")
            .style("position", "absolute")
            .style("left", "0")
            .style("right", "0")
            .style("transform", "translateY(-" + (200 - substringOffset) + "%)")
            .attr('dy', '0.64em')
          substringOffset += 70;
        }
        return labelStart;

      })
      .style("color", "#000")
      .style("font-size", "16px")
      .style("position", "absolute")
      .style("left", "0")
      .style("right", "0")
      .style("transform", "translateY(-200%)");
  
    pyramid.append("div")
      .style('width', '0')
      .style('height', '0')
      .style('border-left', '30px solid transparent')
      .style('border-right', '30px solid transparent')
      .style('border-bottom', '50px solid' + colorScale(numElements - 1))
      .style('transform', 'rotate(180deg)')
  }

  drawJars(data: QuestionData[], title: string) {
    d3.select('#title')
      .append('text')
      .text(title)
      
    d3.selectAll('.water-level')
      .data(data)
      .style('top', function(d: any) {return (100 - d.value)+'%'});

    d3.selectAll('.wave')
      .data(data)
      .append('div')
      .attr('class', 'name')
      .style('position', 'absolute')
      .style('left', '50%')
      .style('transform', 'translate(-50%, 0)')
      .style('font-size', '20px')
      .style('color', 'white')
      .style('font-weight', 'bold')
      .text((d) => Math.round(d.value) + '%')
  }

  clientMapBackground (g:any, data: any, path: any, color: string, provinceAnswers: MapDataSetup[]) {
    g.append('g')
    .selectAll('path')
    .data(data.features)
    .enter()
    .append('path')
    .attr('d', path)
    .each((d: any, i: any) => {
      const centroid = path.centroid(d.geometry)

      g.append('g')
        .attr('id', 'map-label')
        .attr('transform', 'translate(' + centroid[0] + ',' + centroid[1] + ')')
        .append('text')
        .attr('class','name')
        .text(function(){
          return Math.round(provinceAnswers[i].value) + '%';
        })
        .attr('text-anchor', 'middle')
        .style('stroke-width', '0.1')
        .style('font-size', '14')
        .style('font-weight', 'bold')
        .style('stroke', 'black')
    })
    // .attr('fill', function(d: any){ 
    //   const province = provinceAnswers.find((province) => {
    //     return province.province == d.properties.name;
    //   })
    //   return colorScale(province!.answer)})
    .attr('fill', function(d: any) {
      const province = provinceAnswers.find((province) => {
        return province.province == d.properties.name;
      })
      if(province!.answer == "Aucune réponse"){
        return 0;
      }
      const opacity = d3.scaleLinear().domain([30, 60]).range([0, 100]);
      return 'rgba(0, 154, 0,' + (opacity(province!.value) / 100) + ')';
    })
    .style('stroke', 'black')
    .style('stroke-width', '0.5')
  }


  drawTupperwareYAxis (yScale: any) {
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  drawTupperwareXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
    .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.x.axis').selectAll('.tick').select('text').text(function(d: any) {
        return d;
    })
  }

  createScale() {
    // Select the body element
    // var body = d3.select(".allScales .scales");
    // console.log(body)

    // // Create the scale container
    // var scale = body.append("div")
    //     .attr("class", "scale");

    // // Create the left plate
    // var leftPlate = scale.append("div")
    //     .attr("class", "plate");

    // // Create the left dish and piles
    // var leftDish = leftPlate.append("div")
    //     .attr("class", "dish");

    // leftDish.append("div")
    //     .attr("class", "pile0");

    // leftDish.append("div")
    //     .attr("class", "pile1");

    // // Create the beam image
    // scale.append("img")
    //     .attr("class", "beam")
    //     .attr("src", "assets/images/Accolade.png");

    // // Create the right plate
    // var rightPlate = scale.append("div")
    //     .attr("class", "plate");

    // // Create the right dish and piles
    // var rightDish = rightPlate.append("div")
    //     .attr("class", "dish");

    // rightDish.append("div")
    //     .attr("class", "pile2");

    // rightDish.append("div")
    //     .attr("class", "pile3");

    // // Create the bar container
    // var bar = body.append("div")
    //     .attr("class", "bar");

    // // Create the stand and stander elements
    // bar.append("div")
    //     .attr("class", "stand");

    // bar.append("div")
    //     .attr("class", "stander");

    // // Create the image container
    // var imageContainer = body.append("div")
    //     .style("position", "absolute")
    //     .style("top", "150px")
    //     .style("left", "50%")
    //     .style("transform", "translateX(-50%)");

    // // Create the image element
    // imageContainer.append("img")
    //     .attr("src", "assets/images/velo.png")
    //     .style("width", "200px")
    //     .style("height", "50px");

  }

  drawScale(data: ScalesDataSetup) {
    
      this.createScale();

      const yes = data.vracReturnValue + data.nonVracReturnValue;
      const no = 2 - yes;
      
      const deg = 7 * (no - yes) /*7 looks to be the perfect value*/
      this.rotateScale(deg)
    /* Faut rajouter sur le scale un pouce vers le haut à droite et un vers le bas à gauche
      ou un oui/non */
      
      const numberOfElements = 5
      
      const vracYes = Math.round(data.vracReturnValue * numberOfElements)
      const noVracYes = Math.round(data.nonVracReturnValue * numberOfElements)

      d3.select('.allScales').attr('y', 300);
      
      
      this.addImages(vracYes, "pile0", "assets/images/happy_tupperware.png")
      
      this.addImages(noVracYes, "pile1", "assets/images/garbage.png")
      
      this.addImages(5 - vracYes, "pile2", "assets/images/happy_tupperware.png")
      
      this.addImages(5 - noVracYes, "pile3", "assets/images/garbage.png")
  }
  
  
  rotateScale(degrees: number) {
    const scale = d3.select(".scale");
    // const beam = d3.select("#scale .beam");
    const plates = d3.selectAll(".scale .plate");
    // if(scale && scale.node()){
    //   const middleX = ((scale.node()! as any).getBoundingClientRect().right + (scale.node()! as any).getBoundingClientRect().left) / 2 - (scale.node()! as any).getBoundingClientRect().width / 2;
    //   const middleY = ((scale.node()! as any).getBoundingClientRect().top + (scale.node()! as any).getBoundingClientRect().bottom) / 2 - (scale.node()! as any).getBoundingClientRect().height / 2;
    // }
  
    scale.style("transform-origin", "top left")
         .style("transform", `rotate(${degrees}deg) translate(-50%, -50%)`);
  
    plates.each(function() {
      d3.select(this).style("transform", `rotate(${-degrees}deg)`);
    });
  }
  
  addImages(number: number, id: string, src: string) {
    const container = d3.select(`.${id}`);
    let marginTop = -20;
  
    container.selectAll("img")
      .data(d3.range(number))
      .enter()
      .append("img")
      .attr("src", src)
      .attr("width", 20)
      .attr("height", 20)
      .style("margin-top", d => {
        const currentMarginTop = marginTop;
        marginTop = -40;
        return `${currentMarginTop}px`;
      })
      .style("display", "block");
  }
}
