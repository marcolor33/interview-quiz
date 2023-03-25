var nodeProcess = require('process');
// basic assumption : 
// 1. all vertex are postive weight (no negative/zero weight vertex)
// 2. must not have loop (stated in the question)
var _ = require('lodash');
// those hardcode stuff, just for easier reading and editing
var nodeNameList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
var vertexList = [
    ['A', 'B'],
    ['A', 'D'],
    ['A', 'H'],
    ['B', 'C'],
    ['B', 'D'],
    ['C', 'D'],
    ['C', 'F'],
    ['D', 'E'],
    ['E', 'F'],
    ['E', 'H'],
    ['F', 'G'],
    ['G', 'H'],
];
// walk to a node from a given path. if no path is given (a new start), will create a newPath starting with that node
function walkToNode(nodeId, shortestDistanceMatrix, givenPath) {
    if (!givenPath) {
        return {
            accumulateDistance: 0,
            visitedNodeId: [nodeId]
        };
    }
    var path = _.cloneDeep(givenPath);
    var lastVisistedNodeId = givenPath.visitedNodeId[givenPath.visitedNodeId.length - 1];
    path.visitedNodeId.push(nodeId);
    var distance = shortestDistanceMatrix[lastVisistedNodeId][nodeId];
    path.accumulateDistance = path.accumulateDistance + distance;
    return path;
}
// wrapper function for findAllPath
function findAllPathWithName(startNodeName, endNodeName) {
    var _a = initNodeList(), nodeList = _a.nodeList, nodeNameMap = _a.nodeNameMap, shortestDistanceMatrix = _a.shortestDistanceMatrix;
    printGraph(shortestDistanceMatrix, nodeNameMap);
    var startNodeId = nodeNameMap[startNodeName];
    var endNodeId = nodeNameMap[endNodeName];
    if (startNodeId === undefined || endNodeId === undefined) {
        throw new Error('plase enter valid nodeName');
    }
    // recursive function for findAllPath
    function findAllPath(startNodeId, endNodeId, givenPath) {
        var resultPathList = [];
        var currentPath = walkToNode(startNodeId, shortestDistanceMatrix, givenPath);
        if (startNodeId === endNodeId) {
            return [currentPath];
        }
        var startNode = nodeList[startNodeId];
        // loop all not visted Neighbour
        var avaliableNeighbour = startNode.neighbour.filter(function (x) { return !currentPath.visitedNodeId.includes(x); });
        avaliableNeighbour.map(function (neighbourNodeId) {
            var pathParam = _.cloneDeep(currentPath);
            // get the subResult and append to the result
            var subPathList = findAllPath(neighbourNodeId, endNodeId, pathParam);
            resultPathList = resultPathList.concat(subPathList);
        });
        return resultPathList;
    }
    // print the result
    var allPathList = findAllPath(startNodeId, endNodeId);
    if (allPathList.length) {
        allPathList.map(function (path) { return printPath(path); });
    }
    else {
        console.log('no avaliable path found!');
    }
}
// wrapper for findShortestPath
function findShortestPathWithName(startNodeName, endNodeName) {
    var _a = initNodeList(), nodeList = _a.nodeList, nodeNameMap = _a.nodeNameMap, shortestDistanceMatrix = _a.shortestDistanceMatrix;
    printGraph(shortestDistanceMatrix, nodeNameMap);
    var startNodeId = nodeNameMap[startNodeName];
    var endNodeId = nodeNameMap[endNodeName];
    if (startNodeId === undefined || endNodeId === undefined) {
        throw new Error('plase enter valid nodeName');
    }
    function findShortestPath(startNodeId, endNodeId, givenPath) {
        var currentPath = walkToNode(startNodeId, shortestDistanceMatrix, givenPath);
        // if reached endNode, return result
        if (startNodeId === endNodeId) {
            return [currentPath];
        }
        var bestPathList = [];
        var startNode = nodeList[startNodeId];
        // get all not visited neighbour
        var avaliableNeighbour = startNode.neighbour.filter(function (x) { return !currentPath.visitedNodeId.includes(x); });
        for (var index = 0; index < avaliableNeighbour.length; index++) {
            var neighbourNodeId = avaliableNeighbour[index];
            var distance = shortestDistanceMatrix[startNodeId][neighbourNodeId];
            // decide whether should further explore this neighbour
            // if currentPath + this vertex already excced the accumulate distance in bestPathList, no need to explore
            var continueToSearch = !(bestPathList && bestPathList.length && bestPathList[0].accumulateDistance < currentPath.accumulateDistance + distance);
            if (continueToSearch) {
                var pathParam = _.cloneDeep(currentPath);
                var subResultPathList = findShortestPath(neighbourNodeId, endNodeId, pathParam);
                if (subResultPathList && subResultPathList.length) {
                    // set subResultPathList as bestPathList if its accumlateDistance is less than our current best solution
                    if (!(bestPathList && bestPathList.length) || bestPathList[0].accumulateDistance > subResultPathList[0].accumulateDistance) {
                        bestPathList = subResultPathList;
                    }
                    // if the are equal, append into bestPathList
                    else if (bestPathList[0].accumulateDistance === subResultPathList[0].accumulateDistance) {
                        bestPathList = bestPathList.concat(subResultPathList);
                    }
                }
            }
        }
        return bestPathList;
    }
    var shortestPathList = findShortestPath(startNodeId, endNodeId);
    if (shortestPathList && shortestPathList.length) {
        shortestPathList.map(function (x) { return printPath(x); });
    }
    else {
        console.log('no avaliable path found!');
    }
}
function printGraph(shortestDistanceMatrix, nodeNameMap) {
    console.log("===================");
    console.log("random weight vertex list");
    console.log("===================");
    vertexList.map(function (vertex) {
        var nodeAName = vertex[0], nodeBName = vertex[1];
        var nodeAId = nodeNameMap[nodeAName];
        var nodeBId = nodeNameMap[nodeBName];
        var distance = shortestDistanceMatrix[nodeAId][nodeBId];
        console.log(nodeAName + " - " + nodeBName + " : " + distance);
    });
    console.log("===================");
}
function printPath(path) {
    var pathString = path.visitedNodeId.reduce(function (accumulator, nodeId) {
        var nodeName = nodeNameList[nodeId];
        return accumulator + (accumulator.length ? " => " : "") + nodeName;
    }, '');
    console.log("Path : " + pathString + " Distance : " + path.accumulateDistance);
}
// return 3 object
// 1. nodeList : describe the graph, contain list of Node, each Node store its name and its neighbours
// 2. nodeNameMap : get the nodeId using nodeName
// 3. shortestDistanceMatrix : matrix for the vertex
function initNodeList() {
    // hash map for getting nodeId by name, just for my laziness
    var nodeNameMap = {};
    var nodeList = [];
    nodeNameList.map(function (nodeName, index) {
        nodeNameMap[nodeName] = index;
        nodeList.push({ name: nodeName, neighbour: [] });
    });
    var matrixSize = nodeNameList.length;
    var shortestDistanceMatrix = new Array(matrixSize);
    for (var x = 0; x < matrixSize; x++) {
        shortestDistanceMatrix[x] = new Array(matrixSize);
        for (var y = 0; y < matrixSize; y++) {
            shortestDistanceMatrix[x][y] = 0;
        }
    }
    // set neighbour in nodeList and shortestDistanceMatrix
    vertexList.map(function (vertex) {
        var nodeAName = vertex[0], nodeBName = vertex[1];
        var nodeAIndex = nodeNameMap[nodeAName];
        var nodeBIndex = nodeNameMap[nodeBName];
        // fixed weight
        // const weight = 1
        // randomlly genereate weight from 1 - 20
        var weight = Math.floor(Math.random() * 20) + 1;
        shortestDistanceMatrix[nodeAIndex][nodeBIndex] = weight;
        shortestDistanceMatrix[nodeBIndex][nodeAIndex] = weight;
        nodeList[nodeAIndex].neighbour.push(nodeBIndex);
        nodeList[nodeBIndex].neighbour.push(nodeAIndex);
    });
    return { nodeList: nodeList, nodeNameMap: nodeNameMap, shortestDistanceMatrix: shortestDistanceMatrix };
}
function main(args) {
    var mode = args[2];
    var startNodeName = args[3];
    var endNodeName = args[4];
    switch (mode) {
        case 'findAllPath':
            findAllPathWithName(startNodeName, endNodeName);
            break;
        case 'shortestPath':
            findShortestPathWithName(startNodeName, endNodeName);
            break;
        default:
            console.log("cannot find function!");
            break;
    }
}
main(nodeProcess.argv);
