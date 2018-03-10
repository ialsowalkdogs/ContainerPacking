function Container(width, height, length) {
    this.width = width;
    this.height = height;
    this.length = length;
    this.volume = width * height * length;
}

const smallBag = new Container(16, 23, 2);
const mediumBag = new Container(22, 26, 2);
const largeBag = new Container(14, 26, 10);

// Initialising values
let totalBags = 0;
let totalBagsVolume = 0;
let smallBags = 0;
let mediumBags = 0;
let largeBags = 0;
let bags = [];

let contSize = 0;
let container = {};
let containers = [];

function assign() {
    //Emptying arrays
    bags.length = 0;
    containers.length = 0;

    smallBags = document.getElementById("small").value;
    mediumBags = document.getElementById("medium").value;
    largeBags = document.getElementById("large").value;

    // bags will serve as storage and for garbage collection
    while (smallBags > 0) {
        bags.push(smallBag);
        smallBags--;
    }
    while (mediumBags > 0) {
        bags.push(mediumBag);
        mediumBags--;
    }
    while (largeBags > 0) {
        bags.push(largeBag);
        largeBags--;
    }

    totalBags = bags.length;
    totalBagsVolume = bags.reduce(function(sum, current) {
        return sum + current.volume;
      }, 0);

    contSize = Number(document.getElementById("contSize").value);
    if (contSize < 30 || contSize > 100) {
        alert("Invalid number! Number must be between 30 and 100");
    }
    else {
        container = new Container(contSize, contSize, contSize);
    }        
}

// Initialise an instance of a container
function addNewContainer() {
    containers.push(new Container(contSize, contSize, contSize));
}

// Main algorythm - First Fit Decreasing
// Create a new container
// Put the first box into container
// If there are more boxes, check next box for fit
// If it fits, assign it to first container that fits
// If it does not, initialise a new container and assign it to it
// When there are no more boxes, calculate number of containers
function fitBoxes() {
    if (bags.length === 0) return;

    if (containers.length === 0) {
        addNewContainer();
    }

    let bag = bags.pop();

    let fitContainer = -1;
        // Find first fitting container
        for (var j = 0; j < containers.length; j++) {
            if (containers[j].volume >= bag.volume) {
                fitContainer = j;
                break;
            }          
        }
        // If it's found, box is assigned to it
        if (fitContainer != -1) {
            containers[fitContainer].volume -= bag.volume;
        }
        // Else add a new container and assign box to it 
        else {
            addNewContainer();
            containers[containers.length - 1].volume -= bag.volume;
        }

        fitBoxes();
}

function output() {
    document.getElementById("output").innerHTML = `<p>The volume of one container is ${container.volume} cm3.</p>
    We packed ${totalBags} bags with total volume of ${totalBagsVolume} cm3. For that we will need at least ${containers.length} boxes.`;
}

function main() {
    assign();
    fitBoxes();
    output();
}