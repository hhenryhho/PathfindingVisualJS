function Board() {
    this.nodeArray = []
    this.startCoordinate = ''
    this.endCoordinate = ''
    this.nodeWall = []
    this.nodeVisited = []
    this.isDragging = false
    this.isStartDragging = false
    this.isEndDragging = false
    this.isReset = false
}

// Create the grid
Board.prototype.createGrid = function(width, height) {
    width = Math.round(width) 
    height = Math.round(height)
    // Create the html grid
    let htmlGrid = ""
    for (let row = 0; row <= height; row++) {
        // Create a row in html
        let htmlRow = `<tr id='row ${row}'>`
        // Create a row in the grid
        let gridRow = []
        for (let column = 0; column <= width; column++) {
            // Create a node in html
            htmlRow += `<td id='${row},${column}' class='unvisited'></td>`
            // Push a new node into the grid
            gridRow.push(new Node('unvisited', row, column)) 
        }
        // Add the row to the html grid
        htmlGrid += `${htmlRow}</tr>`
        // Push the row into the grid
        this.nodeArray.push(gridRow)
    }   
    // Add the whole html grid to the html 
    $("#board").html(htmlGrid);

    // Set start and end nodes
    this.setSpecial(Math.round(height/2), Math.round(width/4), 'start')
    this.setSpecial(Math.round(height/2), Math.round(width/4 * 3), 'end')
}

Board.prototype.addEventListeners = function() {
    // Create a reference to the Board object
    var self = this
    // For each row
    for (let row = 0; row < this.nodeArray.length; row++) {
        // For each column
        for (let column = 0; column < this.nodeArray[row].length; column++) { 
            // Get the string element of each node
            node = document.getElementById(row + ',' + column)
            // Create an event listener for mouse down for each node
            $(node).mousedown(self, function() {
                x = this.id.split(',')[0]
                y = this.id.split(',')[1]
                if ($(this).attr('class') === 'start'){
                    self.isStartDragging = true
                } else if ($(this).attr('class') === 'end') {
                    self.isEndDragging = true
                } else if ($(this).attr('class') === 'unvisited') { 
                    self.setNormal(x, y, 'unvisited', 'wall')
                    self.isDragging = true
                } else if ($(this).attr('class') === 'wall') {
                    self.setNormal(x, y, 'wall', 'unvisited')
                }
            })
            // Create an event listener for mouse up
            $(node).mouseup(self, function() {
                self.isDragging = false
                self.isStartDragging = false
                self.isEndDragging = false

            })
            // Create an event listener for mouse drag
            $(node).mouseenter(self, function() {
                x = this.id.split(',')[0]
                y = this.id.split(',')[1]
                if (self.isStartDragging === true) {
                    self.setSpecial(x, y, 'start')
                } else if (self.isEndDragging === true) {
                    self.setSpecial(x, y, 'end')
                } else if (self.isDragging === true){
                    if (self.nodeArray[x][y].status === 'unvisited'){
                        self.setNormal(x, y, 'unvisited', 'wall')
                    } else if (self.nodeArray[x][y].status === 'wall') {
                        self.setNormal(x, y, 'wall', 'unvisited')
                    }
                }   
            })
        }
    }
    $('#start').click(self, function(){
        self.breadthFirstTraversal()
        alert("Do not press any buttons until animation is finished")
    })
    $('#pause').click(function(){
        alert("Work in progress")
    })
    $('#reset').click(self, function(){
        self.clear()
        self.isReset = true
        self.setSpecial(Math.round(height/2), Math.round(width/4), 'start')
        self.setSpecial(Math.round(height/2), Math.round(width/4 * 3), 'end')
        self.isReset = false
    })
}

Board.prototype.setNormal = function(x, y, before, after) {
    node = this.nodeArray[x][y]
    htmlNode = document.getElementById(x + ',' + y)

    if (before === 'unvisited' && after === 'wall') {
        // Change the class name of the node in html to be a wall
        htmlNode.className = 'wall'
        // Change the status of the node in nodeArray to be a wall
        node.status = 'wall'
        // Add it to the nodeWall array
        this.nodeWall.push(node)
    } else if (before === 'wall' && after === 'unvisited'){
        // Find the node in nodeWall array
        nodeInWallArray = this.nodeWall.indexOf(node)
        // If the node exists
        if (nodeInWallArray !== -1) {
            // Change the class name of the node in html to be unvisited
            htmlNode.className = 'unvisited'
            // Change the status of the node in nodeArray to be unvisited
            node.status = 'unvisited'
            // Remove the node from the nodeWall array
            this.nodeWall.splice(nodeInWallArray, 1)
        }
    } else if (before === 'unvisited' && after === 'visited'){
        // Change the class name of the node in html to be a wall
        htmlNode.className = 'visited'
        // Change the status of the node in nodeArray to be a wall
        node.status = 'visited'
        // Add it to the nodeVisited array
        this.nodeVisited.push(node)
    } else if (before === 'visited' && after === 'unvisited'){
        // If the node exists
        if (nodeInVisitedArray !== -1) {
            // Change the class name of the node in html to be unvisited
            htmlNode.className = 'unvisited'
            // Change the status of the node in nodeArray to be unvisited
            node.status = 'unvisited'
            // Remove the node from the nodevisited array
            this.nodeVisited.splice(nodeInVisitedArray, 1)
        }
    } else if (before === 'visited' && after === 'path'){
        // Change the class name of the node in html to be a path
        htmlNode.className = 'path'
        // Change the status of the node in nodeArray to be a path
        node.status = 'path'
    } else if (before === 'path' && after === 'visited'){
        // If the node exists
        if (nodeInVisitedArray !== -1) {
            // Change the class name of the node in html to be unvisited
            htmlNode.className = 'unvisited'
            // Change the status of the node in nodeArray to be unvisited
            node.status = 'unvisited'
        }
    }
}

Board.prototype.setSpecial = function(x, y, option) {
    // Get location of new node
    node = document.getElementById(x + ',' + y)
    // Get the counter option
    counterOption = ''
    // Get location of previous node
    previousNode = ''
    if (option === 'start') {
        // Get the previous node location
        previousNode = document.getElementById(this.startCoordinate)
        counterOption = 'end'
    } else {
        // Get the previous node location
        previousNode = document.getElementById(this.endCoordinate)
        counterOption = 'start'
    }
    // If the new location is a not the option
    if (node.className === 'wall' || node.className === 'unvisited' || node.className === 'visited') {
        // Change the class name of the new location to be the option
        node.className = option
        // Set the status of the new node to be the option
        this.nodeArray[x][y].status = option
    // If the new location is the counter option
    } else if (node.className === counterOption) {
        // End the function
        return
    } 

    // Erase previous node location if user is dragging a node or if user resets
    if (this.isStartDragging === true || this.isEndDragging === true || this.isReset === true) {
        // If the node is not in the same place
        if (previousNode !== node) {
            // Set the previous node in html to be unvisited
            previousNode.className = 'unvisited'
            // Set the previous node in the node array to be unvisited
            this.nodeArray[previousNode.id.split(',')[0]][previousNode.id.split(',')[1]].status = 'unvisited' 
        }
    }
    if (option === 'start') {
        // Update start coordinate
        this.startCoordinate = x + ',' + y
    } else {
        // Update end coordinate
        this.endCoordinate = x + ',' + y
    }
}

Board.prototype.clear = function() {
    let numberOfWallNodes = this.nodeWall.length
    // Go through all nodes that are currently walls
    for (i = 0; i < numberOfWallNodes; i++) {
        // Remove the node from the nodeWall array
        currentNode = this.nodeWall.pop()
        // Change the class name of the node in html to be a unvisited
        document.getElementById(currentNode.x + ',' + currentNode.y).className = 'unvisited'
        // Change the status of the node in nodeArray to be a unvisited
        currentNode.status = 'unvisited'
    }

    let numberOfVisitedNodes = this.nodeVisited.length
    // Go through all nodes that are currently visited 
    for (i = 0; i < numberOfVisitedNodes; i++) {
        // Remove the node from the nodeWall array
        currentNode = this.nodeVisited.pop()
        // Remove the parent property
        currentNode.parent = null
        // Change the class name of the node in html to be a unvisited
        document.getElementById(currentNode.x + ',' + currentNode.y).className = 'unvisited'
        // Change the status of the node in nodeArray to be a unvisited
        currentNode.status = 'unvisited'
    }
}

// Queue implemented using push() and shift() javascript functions
Board.prototype.breadthFirstTraversal = async function() {
    function sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    async function backtrace (self, endNode) {
        finalPath = []
        // Push the end node onto the finalPath
        finalPath.push(endNode)
        // While the current node has no parent node
        while (endNode.parent != null) {
            if (endNode.status !== 'end'){
                await sleep(50)
                self.setNormal(endNode.x, endNode.y, 'visited', 'path')
            }
            // Keep on pushing the current node onto the final path array
            finalPath.push(endNode.parent)
            // Move onto the parent
            endNode = endNode.parent
        }
        return finalPath
    }
    // Create a queue to implement the traversal
    queue = []
    // Create a queue to hold the various paths to the end
    queueFinalPath = []
    dr = [1, -1, 0, 0]
    dc = [0, 0, -1, 1]
    xStart = this.startCoordinate.split(',')[0]
    yStart = this.startCoordinate.split(',')[1]
    xEnd = this.endCoordinate.split(',')[0]
    yEnd = this.endCoordinate.split(',')[1]

    // Enqueue the starting node
    queue.push(this.nodeArray[xStart][yStart])

    // While the queue is not empty
    while (queue.length !== 0) {
        // Dequeue the currentNode
        currentNode = queue.shift()
        for (i = 0; i < 4; i++){
            // Get a neighbor node
            if (currentNode.x + dr[i] >= 0 && currentNode.x + dr[i] < board.nodeArray.length && currentNode.y + dc[i] >= 0 && currentNode.y + dc[i] < board.nodeArray[0].length){
                nextNode = this.nodeArray[currentNode.x + dr[i]][currentNode.y + dc[i]]
                // If the neighbor node is the end node
                if (nextNode === this.nodeArray[xEnd][yEnd]){
                    // Set the neighbor node's parent as the current node
                    nextNode.parent = currentNode
                    queue = []
                    return backtrace(this, nextNode)
                // If the neighbor node is not visited yet
                } else if (nextNode.status === 'unvisited') {
                    // Add the neighbor node to the queue
                    queue.push(nextNode)
                    // Set the neighbor node's parent as the current node
                    nextNode.parent = currentNode
                    // Mark as visited
                    await sleep(10)
                    this.setNormal(nextNode.x, nextNode.y, 'unvisited', 'visited')
                }
            }
        }
    }
}

let titleHeight = document.getElementById('header').clientHeight
let documentHeight = window.innerHeight
let documentWidth = window.innerWidth
let height = (documentHeight - titleHeight)/30
let width = documentWidth/25


let board = new Board()

board.createGrid(width, height)
board.addEventListeners()