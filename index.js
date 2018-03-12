const axis = {
  h: 'h',
  w: 'w',
  d: 'd',
};

const axes = Object.keys(axis);

// All possible rotations
const rotation = {
  HWD: 'HWD',
  WHD: 'WHD',
  HDW: 'HDW',
  DHW: 'DHW',
  DWH: 'DWH',
  WDH: 'WDH',
};

const rotations = Object.keys(rotation);

function Container(w, h, d) {
  this.w = w;
  this.h = h;
  this.d = d;
  this.v = w * h * d;
  this.items = [];
  this.rotation = rotation.HWD;
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
let bagsNotPacked = [];
// const bagsToPack = [];

let contSize = 0;
let container = {};
const containers = [];

function assign() {
  // Emptying values
  totalBags = 0;
  containers.length = 0;
  bagsNotPacked.length = 0;

  smallBags = document.getElementById('small').value;
  mediumBags = document.getElementById('medium').value;
  largeBags = document.getElementById('large').value;

  // bags will serve as storage and for garbage collection
  while (smallBags > 0) {
    bagsNotPacked.push(smallBag);
    smallBags -= 1;
  }
  while (mediumBags > 0) {
    bagsNotPacked.push(mediumBag);
    mediumBags -= 1;
  }
  while (largeBags > 0) {
    bagsNotPacked.push(largeBag);
    largeBags -= 1;
  }

  totalBagsVolume = bagsNotPacked.reduce((sum, current) => {
    return sum + current.v;
  }, 0);

  contSize = Number(document.getElementById('contSize').value);
  if (contSize < 30 || contSize > 100) {
    alert('Invalid number! Number must be between 30 and 100');
  } else {
    container = new Container(contSize, contSize, contSize);
  }
}

// Initialise an instance of a container
function addNewContainer() {
  containers.push(new Container(contSize, contSize, contSize));
}

// Look up dimensions for each rotation
function getDimensions(bag) {
  switch (bag.rotation) {
    case rotation.WHD:
      return { h: bag.w, w: bag.h, d: bag.d };
    case rotation.WDH:
      return { h: bag.w, w: bag.d, d: bag.h };
    case rotation.HWD:
      return { h: bag.h, w: bag.w, d: bag.d };
    case rotation.HDW:
      return { h: bag.h, w: bag.d, d: bag.w };
    case rotation.DHW:
      return { h: bag.d, w: bag.h, d: bag.w };
    case rotation.DWH:
      return { h: bag.d, w: bag.w, d: bag.h };

    default:
      return bag;
  }
}

// Overlap check for two rectangles
function overlap(i1, i2, x, y) {
  const d1 = getDimensions(i1);
  const d2 = getDimensions(i2);

  const cx1 = i1[x] + d1[x] / 2;
  const cy1 = i1[y] + d1[y] / 2;
  const cx2 = i2[x] + d2[x] / 2;
  const cy2 = i2[y] + d2[y] / 2;

  const ix = Math.max(cx1, cx2) - Math.min(cx1, cx2);
  const iy = Math.max(cy1, cy2) - Math.min(cy1, cy2);

  return ix < (d1[x] + d2[x]) / 2 && iy < (d1[y] + d2[y]) / 2;
}

// Perform an overlap check for each dimension
function intersect(i1, i2) {
  return (
    overlap(i1, i2, axis.w, axis.h) &&
    overlap(i1, i2, axis.h, axis.d) &&
    overlap(i1, i2, axis.w, axis.d)
  );
}

// Put bag into pivot of a containerNo
function putItem(containerNo, bag, pivot) {
  bag.position = pivot;

  for (let a = 0; a < rotations.length; a += 1) {
    bag.rotation = rotation[rotations[a]];
    const dim = getDimensions(bag);

    // Try until space is found
    if (
      containers[containerNo].w < pivot.w + dim.w ||
      containers[containerNo].h < pivot.h + dim.h ||
      containers[containerNo].d < pivot.d + dim.d
    ) {
      continue;
    }

    // Check if there are any intersections
    const intersects = containers[containerNo].items.some(containerItem =>
      intersect(containerItem, bag));

    // If there are none, we can assign this bag to this container
    if (!intersects) {
      bag.fitted = true;
      // //Bag is cloned to ensure correct data storage
      containers[containerNo].items.push(Object.assign({}, bag));
      // containers[containerNo].items.push(bag);
      totalBags += 1;
      return true;
    }
  }
  return false;
}

// Volume fit - First Fit Decreasing
function fitByVolume() {
  if (bagsNotPacked.length === 0) return;

  if (containers.length === 0) {
    addNewContainer();
  }

  const bag = bagsNotPacked.pop();

  let fitContainer = -1;
  // Find first fitting container
  for (let j = 0; j < containers.length; j += 1) {
    if (containers[j].v >= bag.v) {
      fitContainer = j;
      break;
    }
  }
  // If it's found, box is assigned to it
  if (fitContainer !== -1) {
    containers[fitContainer].v -= bag.v;
    totalBags += 1;
  } else {
    // Else add a new container and assign box to it
    addNewContainer();
    containers[containers.length - 1].v -= bag.v;
    totalBags += 1;
  }

  fitByVolume();
}

// Pivot fit - Best Fit Decreasing
// Choose a pivot point
const startingPivot = { w: 0, h: 0, d: 0 };

function fitByPivot(bagsToPack) {
  const unpacked = []; // clear array for rejected bag collection

  if (containers[containers.length - 1].items.length === 0) {
    putItem(containers.length - 1, bagsToPack.pop(), startingPivot);
  }

  while (bagsToPack.length > 0) {
    const currentBag = bagsToPack.pop();
    currentBag.fitted = false;

    // Find available pivot in current container
    lookup: for (let j = 0; j < containers.length; j += 1) {
      for (let k = 0; k < axes.length; k += 1) {
        for (let l = 0; l < containers[j].items.length; l += 1) {
          const containerItem = containers[j].items[l];

          // Find a pivot in current container
          let pv = {};
          switch (axis[axes[k]]) {
            case axis.h:
              pv = {
                h: containerItem.position.h + containerItem.h,
                w: containerItem.position.w,
                d: containerItem.position.d,
              };
              break;
            case axis.w:
              pv = {
                h: containerItem.position.h,
                w: containerItem.position.w + containerItem.w,
                d: containerItem.position.d,
              };
              break;
            case axis.d:
              pv = {
                h: containerItem.position.h,
                w: containerItem.position.w,
                d: containerItem.position.d + containerItem.d,
              };
              break;
            default:
              pv = {
                h: containerItem.position.h,
                w: containerItem.position.w,
                d: containerItem.position.d,
              };
              break;
          }

          if (putItem(j, currentBag, pv)) {
            break lookup;
          }
        }
      }
    }

    // If bag can not be packed after rotating, save it for later and pack other items
    if (!currentBag.fitted) {
      currentBag.rotation = rotation.HWD;
      unpacked.push(currentBag);
    }
  }
  return unpacked;
}

function pack() {
  do {
    addNewContainer();
    bagsNotPacked = fitByPivot(bagsNotPacked).slice();
  } while (bagsNotPacked.length !== 0);
}

function output() {
  document.getElementById('output').innerHTML = `<p>The volume of one container is ${container.v} cm3.</p>
    We packed ${totalBags} bags with total volume of ${totalBagsVolume} cm3. For that we will need at least ${
  containers.length
} boxes.`;
}

function volumeFit() {
  assign();
  fitByVolume();
  output();
}

function pivotFit() {
  assign();
  pack();
  output();
}
