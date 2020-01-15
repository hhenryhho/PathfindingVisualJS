function Board() {
    this.nodeArray = []
    this.startCoordinate = ''
    this.endCordinate = ''
    this.nodeWall = []
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
    this.setStart(Math.round(height/2), Math.round(width/4))
    this.setEnd(Math.round(height/2), Math.round(width/4 * 3))
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
                if ($(this).attr('class') === 'start'){
                    self.isStartDragging = true
                } else if ($(this).attr('class') === 'end') {
                    self.isEndDragging = true
                } else if ($(this).attr('class') === 'unvisited' || 'wall') { 
                    self.changeUnvisitedToWall(this)
                    self.isDragging = true
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
                    self.setStart(x, y)
                } else if (self.isEndDragging === true) {
                    self.setEnd(x, y)
                } else if (self.isDragging === true){
                    self.changeUnvisitedToWall(this)
                }   
            })
        }
    }
    $('#start').click(self, function(){
        self.breadthFirstTraversal()
    })
    $('#pause').click(function(){
        alert('Ill do this later')
    })
    $('#reset').click(self, function(){
        self.clear()
        self.isReset = true
        self.setStart(Math.round(height/2), Math.round(width/4))
        self.setEnd(Math.round(height/2), Math.round(width/4 * 3))
        self.isReset = false
    })
}

Board.prototype.changeUnvisitedToWall = function(node) {
    if ($(node).attr('class') === 'unvisited') {
        $(node).addClass('wall').removeClass('unvisited');
        console.log(node)
        this.nodeWall.push(node)
    } else if ($(node).attr('class') === 'wall') {
        for (currentNode in this.nodeWall) {
            if (this.nodeWall[currentNode] === node) {
                this.nodeWall.splice(currentNode, 1)
                $(node).addClass('unvisited').removeClass('wall');
            }
        }
    }
}

Board.prototype.setStart = function(x, y) {
     // Get location of new node
    node = document.getElementById(x + ',' + y)
    // If the new location is a wall
    if ($(node).attr('class') === 'wall') {
        // Change it to a start node
        $(node).addClass('start').removeClass('wall')
    // If the new location is the end node
    } else if ($(node).attr('class') === 'end') {
        // End the function
        return
    // If the new location is an unvisited node
    } else if ($(node).attr('class') === 'unvisited') {
        // Change it to a start node
        $(node).addClass('start').removeClass('unvisited')
    }
    // Erase previous start node location
    if (this.isStartDragging === true || this.isReset === true) {
        previousNode = document.getElementById(this.startCoordinate)
        if (previousNode === node) {
            return
        } else {
            $(previousNode).addClass('unvisited').removeClass('start')
        }
        
    } 
    this.nodeArray[x][y].status = 'start'
    this.startCoordinate = x + ',' + y
    
}

Board.prototype.setEnd = function(x, y) {
    // Get location of new node
    node = document.getElementById(x + ',' + y)
    // If the new location is a wall
    if ($(node).attr('class') === 'wall') {
        // Change it to a end node
        $(node).addClass('end').removeClass('wall')
    // If the new location is the start node
    } else if ($(node).attr('class') === 'start') {
        // End the function
        return
    // If the new location is an unvisited node
    } else if ($(node).attr('class') === 'unvisited') {
        // Change it to a end node
        $(node).addClass('end').removeClass('unvisited')
    }
    // Erase previous end node location
    if (this.isEndDragging === true || this.isReset === true) {
        previousNode = document.getElementById(this.endCoordinate)
        if (previousNode === node) {
            return
        } else {
            $(previousNode).addClass('unvisited').removeClass('end')
        }
    } 
    this.nodeArray[x][y].status = 'end'
    this.endCoordinate = x + ',' + y
}


Board.prototype.clear = function() {
    let numberOfWallNodes = this.nodeWall.length
    // Go through all nodes that are currently walls
    for (i = 0; i < numberOfWallNodes; i++) {
        currentNode = this.nodeWall.pop()
        $(currentNode).addClass('unvisited').removeClass('wall')
    }
}

// Queue implemented using push() and shift() javascript functions
Board.prototype.breadthFirstTraversal = function() {
    queue = []
    x = this.startCoordinate.split(',')[0]
    y = this.startCoordinate.split(',')[1]
    queue.push(this.nodeArray[x][y])
    console.log(queue)
}



let titleHeight = document.getElementById("title").clientHeight
let documentHeight = $(window).height()
let documentWidth = $(window).width()
let height = (documentHeight - titleHeight)/30
let width = documentWidth/25

let board = new Board()

board.createGrid(width, height)
board.addEventListeners()