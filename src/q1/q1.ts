const nodeProcess = require('process')
// basic assumption : 
// 1. all vertex are postive weight (no negative/zero weight vertex)
// 2. must not have loop (stated in the question)


const _ = require('lodash');

interface Node {
    name: string;
    neighbour: number[];
}

interface Path {
    accumulateDistance: number;
    visitedNodeId: number[];
}


// those hardcode stuff, just for easier reading and editing
const nodeNameList = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H']
const vertexList = [
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
] as [string, string][]


// walk to a node from a given path. if no path is given (a new start), will create a newPath starting with that node
function walkToNode(nodeId: number, shortestDistanceMatrix: number[][], givenPath?: Path) {

    if (!givenPath) {
        return {
            accumulateDistance: 0,
            visitedNodeId: [nodeId]
        } as Path
    }

    const path = _.cloneDeep(givenPath) as Path
    const lastVisistedNodeId = givenPath.visitedNodeId[givenPath.visitedNodeId.length - 1]

    path.visitedNodeId.push(nodeId)

    const distance = shortestDistanceMatrix[lastVisistedNodeId][nodeId]
    path.accumulateDistance = path.accumulateDistance + distance

    return path

}


// wrapper function for findAllPath
function findAllPathWithName(startNodeName: string, endNodeName: string) {

    const { nodeList, nodeNameMap, shortestDistanceMatrix } = initNodeList()

    printGraph(shortestDistanceMatrix,nodeNameMap)

    const startNodeId = nodeNameMap[startNodeName]
    const endNodeId = nodeNameMap[endNodeName]

    if (startNodeId === undefined || endNodeId === undefined) {
        throw new Error('plase enter valid nodeName')
    }


    // recursive function for findAllPath
    function findAllPath(startNodeId: number, endNodeId: number, givenPath?: Path): Path[] {


        let resultPathList = [] as Path[]

        const currentPath = walkToNode(startNodeId, shortestDistanceMatrix, givenPath)

        if (startNodeId === endNodeId) {
            return [currentPath as Path]
        }


        const startNode = nodeList[startNodeId]


        // loop all not visted Neighbour
        const avaliableNeighbour = startNode.neighbour.filter(x => !currentPath.visitedNodeId.includes(x))

        avaliableNeighbour.map(neighbourNodeId => {

            const pathParam = _.cloneDeep(currentPath)

            // get the subResult and append to the result
            const subPathList = findAllPath(neighbourNodeId, endNodeId, pathParam)
            resultPathList = resultPathList.concat(subPathList)

        })

        return resultPathList

    }



    // print the result
    const allPathList = findAllPath(startNodeId, endNodeId)

    if (allPathList.length) {
        allPathList.map(path => printPath(path))
    }
    else {
        console.log('no avaliable path found!')
    }

}



// wrapper for findShortestPath
function findShortestPathWithName(startNodeName: string, endNodeName: string) {

    const { nodeList, nodeNameMap, shortestDistanceMatrix } = initNodeList()

    printGraph(shortestDistanceMatrix,nodeNameMap)


    const startNodeId = nodeNameMap[startNodeName]
    const endNodeId = nodeNameMap[endNodeName]

    if (startNodeId === undefined || endNodeId === undefined) {
        throw new Error('plase enter valid nodeName')
    }


    function findShortestPath(startNodeId: number, endNodeId: number, givenPath?: Path): Path[] {

        const currentPath = walkToNode(startNodeId, shortestDistanceMatrix, givenPath)


        // if reached endNode, return result
        if (startNodeId === endNodeId) {
            return [currentPath] as Path[]
        }

        let bestPathList = [] as Path[]
        const startNode = nodeList[startNodeId]


        // get all not visited neighbour
        const avaliableNeighbour = startNode.neighbour.filter(x => !currentPath.visitedNodeId.includes(x))

        for (let index = 0; index < avaliableNeighbour.length; index++) {
            const neighbourNodeId = avaliableNeighbour[index];

            const distance = shortestDistanceMatrix[startNodeId][neighbourNodeId]

            // decide whether should further explore this neighbour
            // if currentPath + this vertex already excced the accumulate distance in bestPathList, no need to explore
            const continueToSearch = !(bestPathList && bestPathList.length && bestPathList[0].accumulateDistance < currentPath.accumulateDistance + distance)

            if (continueToSearch) {
                const pathParam = _.cloneDeep(currentPath)
                const subResultPathList = findShortestPath(neighbourNodeId, endNodeId, pathParam)

                if (subResultPathList && subResultPathList.length) {


                    // set subResultPathList as bestPathList if its accumlateDistance is less than our current best solution
                    if (!(bestPathList && bestPathList.length) || bestPathList[0].accumulateDistance > subResultPathList[0].accumulateDistance) {
                        bestPathList = subResultPathList
                    }

                    // if the are equal, append into bestPathList

                    else if (bestPathList[0].accumulateDistance === subResultPathList[0].accumulateDistance) {
                        bestPathList = bestPathList.concat(subResultPathList)
                    }

                }
            }


        }

        return bestPathList

    }


    const shortestPathList = findShortestPath(startNodeId, endNodeId)


    if (shortestPathList && shortestPathList.length) {
        shortestPathList.map(x => printPath(x))
    }
    else {
        console.log('no avaliable path found!')
    }


}



function printGraph(shortestDistanceMatrix : number[][],nodeNameMap : { [nodeName:string] : number })
{

    console.log(`===================`)
    console.log(`random weight vertex list`)
    console.log(`===================`)

    vertexList.map(vertex => {

        const [nodeAName,nodeBName] = vertex

        const nodeAId = nodeNameMap[nodeAName]
        const nodeBId = nodeNameMap[nodeBName]

        const distance = shortestDistanceMatrix[nodeAId][nodeBId]

        console.log(`${nodeAName} - ${nodeBName} : ${distance}`)

    })

    console.log(`===================`)
}


function printPath(path: Path) {


    const pathString = path.visitedNodeId.reduce((accumulator, nodeId) => {

        const nodeName = nodeNameList[nodeId]

        return accumulator + (accumulator.length ? ` => ` : ``) + nodeName

    }, '')

    console.log(`Path : ${pathString} Distance : ${path.accumulateDistance}`)

}


// return 3 object
// 1. nodeList : describe the graph, contain list of Node, each Node store its name and its neighbours
// 2. nodeNameMap : get the nodeId using nodeName
// 3. shortestDistanceMatrix : matrix for the vertex

function initNodeList() {
    // hash map for getting nodeId by name, just for my laziness
    const nodeNameMap = {} as { [nodeName: string]: number }


    const nodeList = [] as Node[]
    nodeNameList.map((nodeName: string, index: number) => {
        nodeNameMap[nodeName] = index
        nodeList.push({ name: nodeName, neighbour: [] as number[] } as Node)
    })

    const matrixSize = nodeNameList.length

    const shortestDistanceMatrix = new Array(matrixSize) as number[][]

    for (let x = 0; x < matrixSize; x++) {
        shortestDistanceMatrix[x] = new Array(matrixSize)
        for (let y = 0; y < matrixSize; y++) {
            shortestDistanceMatrix[x][y] = 0
        }
    }



    // set neighbour in nodeList and shortestDistanceMatrix
    vertexList.map(vertex => {
        const [nodeAName, nodeBName] = vertex

        const nodeAIndex = nodeNameMap[nodeAName]
        const nodeBIndex = nodeNameMap[nodeBName]

        // fixed weight
        // const weight = 1

        // randomlly genereate weight from 1 - 20
        const weight = Math.floor(Math.random() * 20) + 1; 

        shortestDistanceMatrix[nodeAIndex][nodeBIndex] = weight
        shortestDistanceMatrix[nodeBIndex][nodeAIndex] = weight

        nodeList[nodeAIndex].neighbour.push(nodeBIndex)
        nodeList[nodeBIndex].neighbour.push(nodeAIndex)

    })

    return { nodeList, nodeNameMap, shortestDistanceMatrix }

}



function main(args: string[]) {

    const mode = args[2]
    const startNodeName = args[3]
    const endNodeName = args[4]

    switch (mode) {
        case 'findAllPath':
            findAllPathWithName(startNodeName, endNodeName)
            break;

        case 'shortestPath':
            findShortestPathWithName(startNodeName, endNodeName)
            break;

        default:
            console.log(`cannot find function!`)
            break;
    }

}

main(nodeProcess.argv)