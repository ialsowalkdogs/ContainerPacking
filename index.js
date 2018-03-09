function Container(width, height, length) {
    this.width = width;
    this.height = height;
    this.length = length;
    this.volume = function () {
        return this.width * this.height * this.length;
    };
}

const smallBag = new Container(16, 23, 2);
const mediumBag = new Container(22, 26, 2);
const largeBag = new Container(14, 26, 10);

// Nulling the values
let totalBags = 0;
let smallBags = 0;
let mediumBags = 0;
let largeBags = 0;
let bags = [];
let contSize = 0;
let container = {};
let containers = [];

function assign() {
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

    contSize = document.getElementById("contSize").value;
    if (!contSize.match(/^[0-9]+$/)) {
        alert("Must input numbers! Enter a number between 30 and 100");
    }    
    else if (contSize < 30 || contSize > 100) {
        alert("Invalid number! Number must be between 30 and 100");
    }
    else {
        container = new Container(contSize, contSize, contSize);
    };    
    
}

// Initialise an instance of a container
function addNewContainer() {
    containers.push(container);
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

    for (var i = 0; i < containers.length; i++) {
        if (containers[i].volume >= bag.volume) {
            containers[i].volume -= bag.volume;
            return;
        }

        else {
            addNewContainer();
            containers[containers.length - 1] -= bag.volume;
            fitBoxes();
        }
        // TODO: check a box for dimensional fit 
    }
}

function output() {
    document.getElementById("output").innerHTML = `For ${totalBags} bags we will need at least ${containers.length} boxes.`;
}

function main() {
    assign();
    fitBoxes();
    output();
}