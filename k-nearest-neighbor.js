// sample size should have enough disparity
import rooms from './sources/rooms.js';

// level of accuracy, needs to be an odd number
const PROXIMITY_SAMPLE = 5;

// value to resolve collisions
const NOISE = 0.2;

/**
 * Validates results by determining if there's a collision or not
 * @param items
 * @returns {*}
 */
function collides(results) {
  // if there's secondary result, we got a 100% match
  if (!results[1]) {
    return false;
  }

  // if there's a clear winner
  return results[0].count <= results[1].count;
}


function getTypeDistances(sampleArea, sampleRooms) {
  const typeCounts = rooms
    // get euclidean distance point from sample
    .map(({area, rooms, type}) => {
      return {
        distance: Math.sqrt(
          Math.pow(area - sampleArea, 2) +
          Math.pow(rooms - sampleRooms, 2)
        ),
        area,
        rooms,
        type
      }
    })
    // sort by closest to largest
    .sort((a, b) => a - b)
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
 * Initializes operation
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
    console.log('adding noise...');
    return getType(sampleArea - NOISE, sampleRooms);
  }
}

console.log(getType(350, 1));