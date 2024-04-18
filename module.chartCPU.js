global.chartCPU = function() {
    // collect data
    let x = 0,
    xpoints = [],
    maxXValue = CPU.length,
    maxYValue = Math.max(...CPU);
    
    for (let value of CPU) {
    	let y = value / maxYValue,
    	xpoint = 44 * x / maxXValue + 4;
    	xpoints.push([xpoint, 12 - 10*y]);
    	x++;
    }
    
    // Background
    new RoomVisual().rect(0, 0, 49, 29, {fill: 'black'});

    // CPU line chart
    new RoomVisual().text("CPU/tick",24.5, 1);
    
    new RoomVisual().line(4, 12, 44 * x / maxXValue + 5, 12, {color: 'white', lineStyle: 'solid'});
    new RoomVisual().text("0",2, 12);

    new RoomVisual().poly(xpoints, {color: 'white', lineStyle: 'solid'});
    
    new RoomVisual().line(4, 12 - 10*(20/maxYValue), 44 * x / maxXValue + 5, 12 - 10*(20/maxYValue), {color: 'red', lineStyle: 'dashed'});
    new RoomVisual().text("20",2, 12 - 10*(20/maxYValue));
    
    new RoomVisual().line(4, 12 - 10*(10/maxYValue), 44 * x / maxXValue + 5, 12 - 10*(10/maxYValue), {color: 'red', lineStyle: 'dashed'});
    new RoomVisual().text("10",2, 12 - 10*(10/maxYValue));
    
    new RoomVisual().line(4, 12 - 10*(30/maxYValue), 44 * x / maxXValue + 5, 12 - 10*(30/maxYValue), {color: 'red', lineStyle: 'dashed'});
    new RoomVisual().text("30",2, 12 - 10*(30/maxYValue));
    
    new RoomVisual().line(4, 12 - 10*((_.sum(CPU)/CPU.length)/maxYValue), 44 * x / maxXValue + 5, 12 - 10*((_.sum(CPU)/CPU.length)/maxYValue), {color: 'green', lineStyle: 'dashed'});
    new RoomVisual().text("Avg",2, 12 - 10*(_.sum(CPU)/CPU.length)/maxYValue,{color: 'green'});

    let i = 0,
    ipoints = [],
    maxIValue = bucket.length,
    minJValue = Math.floor((Math.min(...bucket) - 50)/100)*100;
    
    for (let value of bucket) {
    	let v = (value-minJValue) / (10000-minJValue),
    	ipoint = 44 * i / maxIValue + 4;
    	ipoints.push([ipoint, 25 - 10*v]);
    	i++;
    }
    
    // Bucket line chart
    new RoomVisual().text("CPU Bucket",24.5, 14);
    
    new RoomVisual().line(4, 25, 44 * i / maxIValue + 5, 25, {color: 'white', lineStyle: 'solid'});
    new RoomVisual().text(minJValue,2, 25);

    new RoomVisual().poly(ipoints, {color: 'white', lineStyle: 'solid'});
    
    new RoomVisual().line(4, 20, 44 * i / maxIValue + 5, 20, {color: 'red', lineStyle: 'dashed'});
    new RoomVisual().text((10000+minJValue)/2,2, 20);
    
    new RoomVisual().line(4, 15, 44 * i / maxIValue + 5, 15, {color: 'red', lineStyle: 'dashed'});
    new RoomVisual().text("10000",2, 15);
    
    // Verticals
    let numberOfVerticals = Math.floor(maxIValue/50);
    for(let i = 1; i <= numberOfVerticals; i++) {
        new RoomVisual().line(4+i*44*50/maxIValue, 2, 4+i*44*50/maxIValue, 25, {color: 'white', lineStyle: 'dashed'});
        new RoomVisual().text(50*i,4+44*i*50/maxIValue, 13);
        new RoomVisual().text(50*i,4+44*i*50/maxIValue, 26);
    }

    // Stats
    new RoomVisual().text("Avg: " + Math.round(100*(_.sum(CPU)/CPU.length))/100,20, 28,{color: 'white', strokeWidth: 0.2});
    new RoomVisual().text("Min: " + Math.round(100*_.min(CPU))/100,30, 28,{color: 'white', strokeWidth: 0.2});
    new RoomVisual().text("Bucket: " + Game.cpu.bucket, 10, 28,{color: 'white', strokeWidth: 0.2});
    new RoomVisual().text("# ticks: " + CPU.length, 40, 28,{color: 'white', strokeWidth: 0.2});
    
}