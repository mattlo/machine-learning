// sample size should have enough disparity
import properties from './sources/properties';

// level of accuracy, needs to be an odd number
// the lower the number, the lower the accuracy
const PROXIMITY_SAMPLE = 5;

// determine the noise matrix
const covarianceMatrix = (function () {
  // tally numbers
  const totalReducer = (c, r) => c + parseFloat(r);

  // determine avg of numbers
  const average = (prop) => properties.map(r => r[prop])
      .reduce(totalReducer, 0) / properties.length;

  // get matrix e.g.: [1, -1]
  const matrix = (avg) => [avg, avg * -1];

  return {
    rooms: matrix(average('rooms')),
    area: matrix(average('area'))
  };
})();

/**
 * Validates results by determining if there's a collision or not
 * @param {Array} items
 * @returns {Boolean}
 */
function collides(results) {
  // if there's secondary result, we got a 100% match
  if (!results[1]) {
    return false;
  }

  // if there's a clear winner
  return results[0].count <= results[1].count;
}

/**
 * Calculates distance of items and returns nearest type results
 * @param {Number} sampleArea
 * @param {Number} sampleRooms
 * @returns {Array<{Object}>}
 */
function getTypeDistances(sampleArea, sampleRooms) {
  const typeCounts = properties
    // get normalized euclidean distance point from sample
    .map(({area, rooms, type}) => {
      return {
        distance: Math.sqrt(
          Math.pow((area - sampleArea) / covarianceMatrix.area[0], 2) +
          Math.pow((rooms - sampleRooms) / covarianceMatrix.rooms[0], 2)
        ),
        area,
        rooms,
        type
      }
    })
    // sort by closest to largest
    .sort((a, b) => a.distance - b.distance)
    // sample the closest ones
    .filter((a, index) => index < PROXIMITY_SAMPLE)
    // reduce to a tally of types
    .reduce((ref, item) => ({
      ...ref, [item.type]: (ref[item.type] || 0) + 1
    }), {});

  // get ref keys
  return Object.keys(typeCounts)
    // convert keys of object to array
    .map(type => ({type, count: typeCounts[type]}))
    // sort highest to lowest
    .sort((a, b) => b - a);
}

/**
 * Returns the ~type
 * @param {Number} sampleArea
 * @param {Number} sampleRooms
 * @returns {String}
 */
function getType(sampleArea, sampleRooms) {
  const result = getTypeDistances(sampleArea, sampleRooms);

  // determine collision
  if (!collides(result)) {
    return result[0].type;
  } else {
    console.log('adding area noise...');
    //return getType(sampleArea + covarianceMatrix.area(), sampleRooms);
  }
}

// sample to test variance (using a constant room)
for (var x = 200; x < 1000; x = x + 200) {
  console.log(getType(x, 1));
}