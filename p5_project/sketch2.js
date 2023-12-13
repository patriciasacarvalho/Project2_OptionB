let data;
let raindrops = [];

function preload() {
  data = loadTable("assets/combined_stations.csv", "csv", "header");
}

function setup() {
  let myCanvas2 = createCanvas(1200, 1200);
  myCanvas2.parent('mySketch2');
  noLoop();

  // Filter data for CHARLES RIVER, StationID = 012
  let charlesRiver012Data = data.rows.filter(
    (row) =>
      row.get("Region") === "CHARLES RIVER" && row.get("StationID") === "012"
  );
  let charlesRiver166Data = data.rows.filter(
    (row) =>
      row.get("Region") === "CHARLES RIVER" && row.get("StationID") === "166"
  );

  // Concatenate data for both stations
  // Concatenation: process of combining two or more strings, arrays or other data structures into a single entitiy. Mergest data from both arrays into a single array.
  // Code is combining them into a single dataset
  let filteredData = charlesRiver012Data.concat(charlesRiver166Data);

  // Sort data by sample_date in descending order
  filteredData.sort((a, b) => {
    // Arrow function. "a, b" are the parameters of the function. These parameters represent two elements being compared during the sorting "sort" process
    let dateA = new Date(a.get("sample_date")); // a.get and b.get extract the "sample_date" property from these elements
    let dateB = new Date(b.get("sample_date"));
    return dateB - dateA; // Expression is used as return value of the sorting function. if 'dateB' is earlier than 'dateA', the result ('dateB - dateA') will be negative (then, B is earleir than A and should come before A in the sorted array). If 'dateB' is later, than result positive. If dates equal, result is '0'.
  });

  // Parse the filtered data and create Raindrop objects
  for (let i = 0; i < filteredData.length; i++) {
    // 'let i = 0' initializes the loop counter variable. 'filteredData.length' is the loop condition, loop continues until value of 'i' is less than the length of the 'filteredData.  "i++ ensures that the loop will move to the next element in the array with each iteration".
    let row = filteredData[i]; // 'let row' declares new variable named 'row'. 'row' gives a convenient reference to the current element within the loop body. [i], access the element at index (row above). First element is at index '0'.
    let enterococcusCount = row.getNum("Enterococcus"); // extracts value of the 'Enterococcus' property from the current 'row, and assigns it to the variable 'enterococcusCount'.
    let rainfallIntensity = row.getNum("Logan_rainfall_in"); // same for rainfall intensity.
    let rainfallCategory = row.get("Rainfall_Category");
    let dropColor; // Declares a variable without assigning value to it. The value of 'dropColor' will be determined below in the loop based on certain conditions.

    // Depending on StationID, a color and radius are set - IF-ELSE Statement
    if (row.get("StationID") === "012") {
      dropColor = enterococcusCount > 61 ? color(255, 0, 0, 170) : color(150); // RGB Colors (R,G,B,Transparency) Red if count > 61, gray otherwise. - Ternary Operator '?' and ':' to write if-else =   condition ? expressionIfTrue : expressionIfFalse
      var radius = 500; // Radius for StationID 012
    } else if (row.get("StationID") === "166") {
      dropColor = enterococcusCount > 61 ? color(0, 0, 255, 170) : color(150); // Blue if count > 61, gray otherwise.  condition ? expressionIfTrue : expressionIfFalse
      var radius = 550; // Radius for StationID 166
    }

    // Calculate angle - 'map' function to convert loop counter ('i') into an angle. - Resulting 'angle' is then used in creation of 'Randrop' objects to position them around a circular arrangement.
    let angle = map(i, 0, filteredData.length, 0, TWO_PI);
    // let angle, declares new variable named 'angle' to store the calculated angle.
    // 'map' function used to linearly map a value from one range to another.
    // 'i' value to be mapped
    // '0' minimum value in range (starting point of the loop counter)
    // 'filteredData.length' maximum value, end point of loop counter
    // '0' min. value in the target range
    // 'TWO_PI' max value in target range - TWO_PI represents full circle in radians (360 degrees).

    let raindrop = new Raindrop(
      enterococcusCount,
      rainfallIntensity,
      dropColor,
      angle,
      radius,
      rainfallCategory,
      row.get("sample_date")
    );
    raindrops.push(raindrop); // pushing 'Raindrop' object (created here), into the 'raindrops' array.
  }
}

function draw() {
  background("black");
  translate(width / 2, height / 2); // translates the origin of the canvas to the center.  The raindrops are drawn relative to the center of the canvas.

  // Display raindrops
  for (let i = 0; i < raindrops.length; i++) {
    // 'for' loop iterates through each element in the 'raindrops' array. Each iteration 'i' is incremented by 1 ('i++')
    raindrops[i].mouseHover();
    raindrops[i].display(); // 'i' accesses the element in the 'raindrops' array. 'display' draws the raindrop on the canvas.
  }
}

class Raindrop {
  constructor(
    enterococcusCount,
    rainfallIntensity,
    dropColor,
    angle,
    radius,
    rainfallCategory
  ) {
    if (isNaN(rainfallIntensity) || rainfallIntensity === 0) {
      this.isSquare = true; // Flag to indicate square shape
    } else {
      this.isSquare = false; // Flag to indicate circle shape
    }
    this.dropColor = dropColor;
    this.angle = angle; // Angle based on the position in the sorted array
    this.radius = radius; // Radius based on the station ID
    this.rainfallCategory = rainfallCategory;
    this.over = false;
    this.brightness = 0;
  }

  mouseHover() {
    if (
      mouseX > this.x - this.radius &&
      mouseX < this.x + this.radius &&
      mouseY > this.y - this.radius &&
      mouseY < this.y + this.radius
      ) {
        this.over = true;
      } else{
        this.over = false;
      }
    }

  display() {
    let x = this.radius * cos(this.angle);
    let y = this.radius * sin(this.angle);

    fill(this.dropColor);
    if (this.over === true) {
      fill(this.brightness+ 200);
    } else {
      fill(this.dropColor);
    }

    if (this.isSquare) {
      rectMode(CENTER);
      rect(x, y, 8, 8); // Size 1 square
    } else {
      let sizeMapping = map(this.rainfallCategory, 1, 5, 25, 8); // Adjusted raindrop size range based on Rainfall_Category
      ellipse(x, y, sizeMapping * 2, sizeMapping * 2);
    }
  }
}
