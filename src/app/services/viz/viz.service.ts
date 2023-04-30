import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import { Margin } from 'src/app/interfaces/margin';
import { legendColor } from 'd3-svg-legend';
import { QuestionData } from 'src/app/interfaces/question-data';
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

  appendAxes (g: any) {
    g.append('g')
      .attr('class', 'x axis')
  
    g.append('g')
      .attr('class', 'y axis')
      .style('transform', 'translate(10px, 0px)')
  }

  appendGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'x axis-text')
      .attr('font-size', 15)
  }

  appendTupperwareGraphLabels (g: any) {
    g.append('text')
      .text('Pourcentage (%)')
      .attr('class', 'y axis-text')
      .attr('font-size', 25)

    g.append('text')
      .text("Tranches d'âge")
      .attr('class', 'x axis-text')
      .attr('font-size', 25)
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

  placeClientWallTitle (g: any, title: string, width: number, height:number = -20) {
    g.append('text')
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', height)
      .style('font-size', '40px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('margin-bottom', '30px')
      .text(title)
  }

  placeDonutsTitle (g: any, title: string, width: number, height:number = -20) {
    g.insert("text",":first-child")
      .attr('class', 'title')
      .attr('x', width/2)
      .attr('y', height)
      .style('font-size', '40px')
      .style('font-weight', 'bold')
      .style('text-anchor', 'middle')
      .style('margin', '30px')
      .text(title)
  }

  positionLabels (g: any, width: number, height: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + height / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + width / 2 + ',' + (height + 50) + ')')
  }

  positionClientWallLabels (g: any, yHeight: number, xWidth : number, xHeight: number) {
    g.selectAll('.y.axis-text')
      .attr('transform', 'translate( -50 ,' + yHeight / 2 + '), rotate(-90)')
  
    g.selectAll('.x.axis-text')
      .attr('transform', 'translate(' + xWidth / 2 + ',' + (xHeight + 50) + ')')
  }

  drawXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
      .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)
  }

  drawYAxis (yScale: any) {
    const maxLineLength = 35;
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.y.axis').selectAll('.tick').select('text').text(function(d: any) {
      if(d.length <= maxLineLength){
        return d;
      } else {
        const splitLabel = d.split(' ');
        let labelStart: string = '';
        let i: number = 0;
        while(labelStart.length + splitLabel[i].length < maxLineLength){
          labelStart += ' ' + splitLabel[i];
          i++;
        }
        return labelStart;
      }
    }).each(function(d: any, i: any, nodes: any) {
      if(d.length > maxLineLength){
        let words: string[] = d.split(' ');
        let labelStart: string = '';
        let currentWordIndex: number = 0;
        while(labelStart.length + words[currentWordIndex].length < maxLineLength){
          labelStart += ' ' + words[currentWordIndex];
          currentWordIndex++;
        }
        let j: number = 12;
        while(currentWordIndex <= words.length - 1){
          let line: string = words[currentWordIndex];
          currentWordIndex++;
          while(words[currentWordIndex] && line.length + words[currentWordIndex].length < maxLineLength && currentWordIndex <= words.length - 1){
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
      .attr('transform', 'translate(' + (width + 30) + ', 200)')
  
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
      .attr("height", yScale.bandwidth())
      .attr('x', '10px')
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

      const images = ["apple.png", "brocolli.png", "chicken.png", "spaghetti.png"]

      d3.selectAll('.tup').style('background-color', '#BDE1FF');
      d3.selectAll('.per').style('background-color', 'red');

      d3.selectAll('.ware')
        .style('background-color', '#F5F5F5')
        .style('border', '3px solid #BDE1FF')
        .each(function(d: any, i:any, nodes:any) {
          if (parseInt(d3.select(nodes[i].parentNode).style('height').replace("%", "")) >= 5) {
            const randomNum = Math.floor(Math.random() * images.length);
            const imgPath = `assets/images/tup/${images[randomNum]}`;
            d3.select(this)
              .style('background-image', `url(${imgPath})`)
              .style('background-size', '25px 25px')
              .style('background-repeat', 'no-repeat')
              .style('background-position', 'center');
          }
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
      .attr("x", function(d: any) { return xScale(Math.round(d[0])) + 10; })
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
          .attr("x", (xScale(d[0]) + (xScale(d[1]) - xScale(d[0])) / 2) + 10)
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

    pyramid.style("margin-top", '50px')

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
        const letterSize: number = 7;
        const currentWidth: number = parseInt(nodes[i].parentNode.style.width.split('p')[0]);
        if(d.length * letterSize < currentWidth){
          d3.select(nodes[i])
            .style("transform", "translateY(-175%)")
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
        
        let substringOffset: number = 80;
        let stringOffset = 40;
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
            .style("font-size", "18px")
            .style("position", "absolute")
            .style("left", "0")
            .style("right", "0")
            .style("transform", "translateY(-" + (175 - substringOffset + stringOffset) + "%)")
            .attr('dy', '0.64em')

          d3.select(nodes[i])
            .style("transform", "translateY(-" + (175 + stringOffset) + "%)")
          stringOffset += 40;
          substringOffset += 80;
        }
        return labelStart;

      })
      .style("color", "#000")
      .style("font-size", "18px")
      .style("position", "absolute")
      .style("left", "0")
      .style("right", "0")
  
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
    .attr('transform', 'translate(-60,0)')
    .attr('d', path)
    .each((d: any, i: any) => {
      const centroid = path.centroid(d.geometry)
      if(provinceAnswers[i].value == 0){
        return;
      }

      g.append('g')
        .attr('id', 'map-label')
        .attr('transform', 'translate(' + (centroid[0] - 60) + ',' + centroid[1] + ')')
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
        .style('fill', 'black')
    })
    .attr('fill', function(d: any) {
      const province = provinceAnswers.find((province) => {
        return province.province == d.properties.name;
      })
      if(province!.value == 0){
        return 'white';
      }
      const R = d3.scaleLinear().domain([30, 60]).range([250, 0]);
      const G = d3.scaleLinear().domain([30, 60]).range([0, 220]);
      return 'rgba('+ (R(province!.value)) +', '+ (G(province!.value)) +', 0,1)';
    })
    .style('stroke', 'black')
    .style('stroke-width', '0.5')
  }


  drawTupperwareYAxis (yScale: any) {
    d3.select('.y.axis')
      .call(d3.axisLeft(yScale).tickSizeOuter(0).tickArguments([5, '~s']) as any)

    d3.select('.y.axis').selectAll('.tick').select('text').style('font-size', '20px');
  }

  drawTupperwareXAxis (xScale: any, height: number) {
    d3.select('.x.axis')
    .attr('transform', 'translate( 0, ' + height + ')')
      .call(d3.axisBottom(xScale).tickSizeOuter(0).tickArguments([5, '.0r']) as any);
    d3.select('.x.axis').selectAll('.tick').select('text').text(function(d: any) {
        return d;
    }).style('font-size', '20px');
  }


  drawScale(data: ScalesDataSetup[]) {
    d3.select('.allScales')
      .attr('y', 300)

    this.drawScaleLegend();
    d3.selectAll('.scales')
      .data(data)
      .each((d: ScalesDataSetup, i:any) => {
        const numberOfElements = 5
        
        const vracYes = Math.round(d.vracReturnValue * numberOfElements)
        const noVracYes = Math.round(d.nonVracReturnValue * numberOfElements)
        
        let delay = 0;
        this.addImages(vracYes,'#scale' + i, ".pile0", "assets/images/happy_tupperware.png",delay);
        delay += vracYes;
        this.addImages(noVracYes,'#scale' + i, ".pile1", "assets/images/garbage.png" ,delay);
        delay += noVracYes;
        this.addImages(5 - vracYes,'#scale' + i, ".pile2", "assets/images/happy_tupperware.png" ,delay);
        delay += 5 - vracYes;
        this.addImages(5 - noVracYes,'#scale' + i, ".pile3", "assets/images/garbage.png" ,delay);
        delay += 5 - noVracYes;
      })
  }

  drawScaleLegend() {
    const legendItemsNames: string[] = ['Fait du vrac', 'Ne fait pas de vrac'];
    d3.select('.allScales')
      .append('div')
      .attr('class', 'legend')
      .style('position','absolute')
      .style('right', 0)
      .style('top', 0)
      .style('transform', 'translate(150%, -150%)')
      .style('display','flex')
      .style('flex-direction','column')
      .append('text')
      .text('Légende')
      .style('font-size', '25px')
      .style('font-weight', 'bold')

    d3.select('.legend')
      .append('div')
      .attr('class', 'legendItem')
      .style('display', 'flex')
      .style('flex-direction', 'row')
      .append('img')
      .attr('src', "assets/images/happy_tupperware.png")
      .attr("width", 30)
      .attr("height", 30)
      .style('margin', '10px')
    
    d3.select('.legend')
      .append('div')
      .attr('class', 'legendItem')
      .style('display', 'flex')
      .style('flex-direction', 'row')
      .append('img')
      .attr('src', "assets/images/garbage.png")
      .attr("width", 30)
      .attr("height", 30)
      .style('margin', '10px')

    d3.selectAll('.legendItem')
      .append('text')
      .text(function(d, i) {
        return legendItemsNames[i];
      })
      .style('font-size', '20px')
      .style('margin', '10px')
  }

  rotateScale(scaleName:string, degrees: number, delay: number) {
    setTimeout(()=>{
      const scale = d3.select(scaleName)

      const plates = scale.selectAll(".plate");
    
      scale.style("transform-origin", "top left")
          .style("transform", `rotate(${degrees}deg) translate(-50%, -50%)`)
      
      plates.style("transform-origin", "top left")
            .style("transform", `rotate(${-degrees}deg) translate(-50%, -50%)`);
    }, delay);
  }
  
  addImages(number: number, scaleId: string, pileid: string, src: string, delay: number) {
    const container = d3.select(scaleId).select(pileid);
    let start = (delay + number) * 0.6;

    container.selectAll("img")
      .data(d3.range(number))
      .enter()
      .append("img")
      .attr("src", src)
      .style('position', "relative")
      .attr("width", 30)
      .attr("height", 30)
      .style("display", "block")
      .style('animation', function(d: any) { return (Math.random() < 0.5 ? "fall-right": "fall-left") + " 2s linear backwards"})
      .style('animation-delay', function(d: any) { start -= 0.6; return start + "s"});
  }

  createBalanceAnimation(id: string, data: ScalesDataSetup) {
    const angle_increments = 7 / 5; /*7 looks to be the perfect value*/

    const delay_increments = 600; /* in ms */
    
    const numberOfElements = 5;
    
    const vracYes = Math.round(data.vracReturnValue * numberOfElements)
    const noVracYes = Math.round(data.nonVracReturnValue * numberOfElements)

    let queue: any[] = []    

    const animation = {
      id: id,
      state: 0,
      queue: queue,
    };
    
    let currentAngle = 0;
    let currentDelay = 800; /* in ms */

    for (let i = 1; i <= vracYes + noVracYes; i++) {
      currentAngle -= angle_increments;
      currentDelay += delay_increments;
      animation.queue.push({angle: currentAngle, delay: currentDelay});
    }
    for (let i = 1; i <= numberOfElements * 2 - vracYes - noVracYes; i++) {
      currentAngle += angle_increments;
      currentDelay += delay_increments;
      animation.queue.push({angle: currentAngle, delay: currentDelay});
    }

    return animation;
  }

  drawCircles(data: QuestionData[]){

    const width = 150
    const borderWidth = 10

    const svg = d3.create('svg')
    .attr('viewBox', `0 0 ${width} ${width}`)
    
    svg.append('circle')
      .attr('cx', width/2)
      .attr('cy', width/2)
      .attr('r', width/2 - borderWidth/2)
      .style('stroke', 'gray')
      .style('stroke-width', borderWidth)
      .style('fill', 'none');

    const svgNode = svg.node();
    const svgString = svgNode ? new XMLSerializer().serializeToString(svgNode) : '';
    const dataUri = "data:image/svg+xml;base64," + btoa(svgString);

    d3.select('.donuts')
    .selectAll('.donut')
    .data(data)
    .each(function (d: QuestionData, i: number, nodes: any) {
      const value = Math.round(d.value);
      const donut = d3.select(nodes[i]);
      donut.select('.pie.animate')
        .html(value + '%')
        .style('--p', value)
        .style('--c', 'orange')
        .style('--b', '10px')
        .style('background-image', `url(${dataUri})`)

      donut.select('.text')
        .append('text')
        .text(d.label)
        .style('flex-wrap', 'wrap')
        .style('display', 'flex')
        .style('text-align', 'center')
        .style('margin', 'auto')
        .style('justify-content', 'center')
        .style('width', '150px');
    })
  }

  drawImagesGraph(data: QuestionData[]) {
    const g = d3.select('.images-graph');

    g.append('div')
      .attr('class', 'images')
      .selectAll(".image-stack")
      .data(data)
      .enter()
      .append("div")
      .attr("class", "image-stack")
      .style('display', 'flex')
      .style('flex-direction', 'column')
      .style('margin-right', '10px')
      .style("position", "relative")
      .append("img")
      .attr('src', function(d){ return d.label})
      .style('height', '200px')
      .attr('class', 'bottom-image')
      .style("position", "relative")
      .style('filter', 'grayscale(100%)')
      .style('opacity', 0.2)

    
    g.selectAll(".image-stack")
      .data(data)
      .append('img')
      .attr('src', function(d){ return d.label})
      .attr('class', 'top-image')
      .style('opacity', 1)
      .style("transition", "clip-path 2s, -webkit-clip-path 2s")
      .style('clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('-webkit-clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('height', '200px')
      .style('position', 'absolute')
      .attr('top', '0')
      .style('left', '0')


    g.select('.title')
      .style('margin', '40px')
  }

  animateImagesGraph(data: QuestionData[]) {
    const g = d3.select('.images-graph');
    setTimeout(()=>{
      g.selectAll(".top-image")
        .data(data)
        .style("transition", "clip-path 2s, -webkit-clip-path 2s")
        .style('clip-path', function(d) {return 'inset(0 ' + (d.value * 100) + '% 0 0)';})
        .style('-webkit-clip-path', function(d) {return 'inset(0 ' + (d.value * 100) + '% 0 0)';})
    }, 500);
  }

  resetImagesGraph() {
    const g = d3.select('.images-graph');

    g.selectAll(".top-image")
      .style('clip-path', function(d) {return 'inset(0 100% 0 0)';})
      .style('-webkit-clip-path', function(d) {return 'inset(0 100% 0 0)';})
  }
}
